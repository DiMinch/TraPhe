package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.dto.request.CreatePurchaseOrderRequest;
import com.example.traphe_backend.dto.request.ReceivePurchaseOrderRequest;
import com.example.traphe_backend.dto.response.PageResponse;
import com.example.traphe_backend.dto.response.PurchaseOrderResponse;
import com.example.traphe_backend.dto.response.PurchaseOrderResponse.PurchaseOrderItemResponse;
import com.example.traphe_backend.dto.response.PurchaseOrderResponse.SupplierInfo;
import com.example.traphe_backend.entity.Branch;
import com.example.traphe_backend.entity.Ingredient;
import com.example.traphe_backend.entity.PurchaseOrder;
import com.example.traphe_backend.entity.PurchaseOrderItem;
import com.example.traphe_backend.entity.Supplier;
import com.example.traphe_backend.enums.PurchaseOrderStatus;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.repository.BranchRepository;
import com.example.traphe_backend.repository.IngredientRepository;
import com.example.traphe_backend.repository.PurchaseOrderRepository;
import com.example.traphe_backend.repository.SupplierRepository;
import com.example.traphe_backend.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository poRepository;
    private final SupplierRepository supplierRepository;
    private final IngredientRepository ingredientRepository;
    private final BranchRepository branchRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PurchaseOrderResponse> getAllPurchaseOrders(UUID supplierId, String status, int page, int size) {
        PurchaseOrderStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try {
                statusEnum = PurchaseOrderStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid PO status filter: {}", status);
            }
        }

        Page<PurchaseOrder> result = poRepository.findByFilters(supplierId, statusEnum, PageRequest.of(page, size));
        List<PurchaseOrderResponse> content = result.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, result.getTotalElements(), result.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getPurchaseOrderById(UUID id) {
        PurchaseOrder po = poRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiếu đặt hàng: " + id));
        return mapToResponse(po);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getPurchaseOrdersBySupplierId(UUID supplierId) {
        return poRepository.findBySupplierIdAndIsDeletedFalseOrderByCreatedAtDesc(supplierId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PurchaseOrderResponse createPurchaseOrder(CreatePurchaseOrderRequest request, String userEmail) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhà cung cấp: " + request.getSupplierId()));

        Branch branch = null;
        if (request.getBranchId() != null) {
            branch = branchRepository.findById(request.getBranchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh: " + request.getBranchId()));
        }

        // Generate PO number
        int nextSeq = poRepository.findMaxPoNumberSequence() + 1;
        String poNumber = String.format("PO-%06d", nextSeq);

        PurchaseOrder po = PurchaseOrder.builder()
                .poNumber(poNumber)
                .supplier(supplier)
                .branch(branch)
                .status(PurchaseOrderStatus.DRAFT)
                .expectedDeliveryDate(request.getExpectedDeliveryDate())
                .note(request.getNote())
                .build();

        // Add items
        for (CreatePurchaseOrderRequest.PurchaseOrderItemRequest itemReq : request.getItems()) {
            Ingredient ingredient = ingredientRepository.findById(itemReq.getIngredientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nguyên liệu: " + itemReq.getIngredientId()));

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .ingredient(ingredient)
                    .quantityOrdered(itemReq.getQuantityOrdered())
                    .unitPrice(itemReq.getUnitPrice())
                    .build();

            po.addItem(item);
        }

        po.recalculateTotal();
        po = poRepository.save(po);

        log.info("Purchase order created: {} by {}", poNumber, userEmail);
        return mapToResponse(po);
    }

    @Override
    public PurchaseOrderResponse receivePurchaseOrder(UUID id, ReceivePurchaseOrderRequest request, String userEmail) {
        PurchaseOrder po = poRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiếu đặt hàng: " + id));

        if (po.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new IllegalStateException("Chỉ có thể nhận hàng cho phiếu ở trạng thái DRAFT. Trạng thái hiện tại: " + po.getStatus());
        }

        // Update received quantities
        if (request.getItems() != null) {
            for (ReceivePurchaseOrderRequest.ReceiveItem receiveItem : request.getItems()) {
                po.getItems().stream()
                        .filter(item -> item.getIngredient().getId().equals(receiveItem.getIngredientId()))
                        .findFirst()
                        .ifPresent(item -> item.setQuantityReceived(receiveItem.getQuantityReceived()));
            }
        }

        po.setStatus(PurchaseOrderStatus.RECEIVED);
        po.setActualDeliveryDate(request.getActualDeliveryDate() != null
                ? request.getActualDeliveryDate()
                : LocalDate.now());

        po = poRepository.save(po);

        log.info("Purchase order {} received by {}", po.getPoNumber(), userEmail);
        return mapToResponse(po);
    }

    @Override
    public PurchaseOrderResponse closePurchaseOrder(UUID id) {
        PurchaseOrder po = poRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiếu đặt hàng: " + id));

        if (po.getStatus() != PurchaseOrderStatus.RECEIVED) {
            throw new IllegalStateException("Chỉ có thể đóng phiếu ở trạng thái RECEIVED. Trạng thái hiện tại: " + po.getStatus());
        }

        po.setStatus(PurchaseOrderStatus.CLOSED);
        po = poRepository.save(po);

        log.info("Purchase order {} closed", po.getPoNumber());
        return mapToResponse(po);
    }

    @Override
    public void deletePurchaseOrder(UUID id) {
        PurchaseOrder po = poRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiếu đặt hàng: " + id));

        if (po.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new IllegalStateException("Chỉ có thể xóa phiếu ở trạng thái DRAFT. Trạng thái hiện tại: " + po.getStatus());
        }

        po.setDeleted(true);
        po.setDeletedAt(LocalDateTime.now());
        poRepository.save(po);

        log.info("Purchase order {} soft-deleted", po.getPoNumber());
    }

    // ==================== Mapper ====================

    private PurchaseOrderResponse mapToResponse(PurchaseOrder po) {
        return PurchaseOrderResponse.builder()
                .id(po.getId())
                .poNumber(po.getPoNumber())
                .supplier(SupplierInfo.builder()
                        .id(po.getSupplier().getId())
                        .name(po.getSupplier().getName())
                        .contactName(po.getSupplier().getContactName())
                        .phone(po.getSupplier().getPhone())
                        .email(po.getSupplier().getEmail())
                        .build())
                .status(po.getStatus().name())
                .totalAmount(po.getTotalAmount())
                .expectedDeliveryDate(po.getExpectedDeliveryDate())
                .actualDeliveryDate(po.getActualDeliveryDate())
                .note(po.getNote())
                .createdAt(po.getCreatedAt())
                .updatedAt(po.getUpdatedAt())
                .items(po.getItems().stream().map(this::mapItemToResponse).collect(Collectors.toList()))
                .createdBy(po.getCreatedBy() != null ? po.getCreatedBy().toString() : null)
                .updatedBy(po.getUpdatedBy() != null ? po.getUpdatedBy().toString() : null)
                .build();
    }

    private PurchaseOrderItemResponse mapItemToResponse(PurchaseOrderItem item) {
        return PurchaseOrderItemResponse.builder()
                .id(item.getId())
                .ingredientId(item.getIngredient().getId())
                .ingredientName(item.getIngredient().getName())
                .unit(item.getIngredient().getUnit())
                .quantityOrdered(item.getQuantityOrdered())
                .quantityReceived(item.getQuantityReceived())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .build();
    }
}
