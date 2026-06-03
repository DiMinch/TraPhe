package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.dto.response.OrderResponse;
import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.enums.OrderStatus;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.repository.OrderRepository;
import com.example.traphe_backend.repository.UserRepository;
import com.example.traphe_backend.service.OrderQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Read-only order query operations.
 * Extracted from OrderServiceImpl to improve separation of concerns.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderQueryServiceImpl implements OrderQueryService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    // ==========================================
    // GET /api/orders/:id — Chi tiết đơn hàng
    // ==========================================

    @Override
    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findByIdAndIsDeletedFalse(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Đơn hàng không tồn tại với ID: " + orderId));
        return mapToOrderResponse(order);
    }

    /**
     * Object-level access control for getOrderById.
     * Staff roles (ADMIN, BRANCH_MANAGER, CASHIER, BARISTA) can view any order.
     * Customers can only view their own orders.
     */
    @Override
    public OrderResponse getOrderById(UUID orderId, String userEmail) {
        Order order = orderRepository.findByIdAndIsDeletedFalse(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Đơn hàng không tồn tại với ID: " + orderId));

        User requester = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isStaff = requester.getRoles().stream()
                .anyMatch(r -> r.getName() == com.example.traphe_backend.enums.RoleName.ROLE_ADMIN
                            || r.getName() == com.example.traphe_backend.enums.RoleName.ROLE_BRANCH_MANAGER
                            || r.getName() == com.example.traphe_backend.enums.RoleName.ROLE_CASHIER
                            || r.getName() == com.example.traphe_backend.enums.RoleName.ROLE_BARISTA);

        if (!isStaff && (order.getCustomer() == null || !order.getCustomer().getId().equals(requester.getId()))) {
            throw new IllegalArgumentException("Bạn không có quyền xem đơn hàng này.");
        }

        return mapToOrderResponse(order);
    }

    // ==========================================
    // GET /api/orders/user — Lịch sử đơn hàng của User
    // ==========================================

    @Override
    public Page<OrderResponse> getMyOrders(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return orderRepository
                .findByCustomerIdAndIsDeletedFalseOrderByCreatedAtDesc(user.getId(), pageable)
                .map(this::mapToOrderResponse);
    }

    // ==========================================
    // GET /api/orders/customer/{id} — Lịch sử đơn hàng của khách hàng (Admin)
    // ==========================================

    @Override
    public Page<OrderResponse> getCustomerOrders(UUID customerId, Pageable pageable) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return orderRepository
                .findByCustomerIdAndIsDeletedFalseOrderByCreatedAtDesc(user.getId(), pageable)
                .map(this::mapToOrderResponse);
    }

    // ==========================================
    // GET /api/orders — Danh sách đơn hàng (Admin)
    // ==========================================

    @Override
    public Page<OrderResponse> getAllOrders(String statusStr, UUID branchId, Pageable pageable) {
        OrderStatus status = null;
        if (statusStr != null && !statusStr.isBlank() && !"all-status".equalsIgnoreCase(statusStr)) {
            try {
                status = OrderStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Trạng thái không hợp lệ: " + statusStr);
            }
        }
        return orderRepository.findAllWithFilters(status, branchId, pageable)
                .map(this::mapToOrderResponse);
    }

    // ==========================================
    // Shared mapper
    // ==========================================

    @Override
    public OrderResponse mapToOrderResponse(Order order) {
        // Build item details
        List<OrderResponse.OrderItemDetail> itemDetails = order.getItems().stream()
                .map(item -> {
                    List<String> optionNames = item.getSelectedOptions().stream()
                            .map(opt -> opt.getOptionGroup().getName() + ": " + opt.getOptionValue().getLabel())
                            .collect(Collectors.toList());
                    List<String> toppingNames = item.getSelectedToppings().stream()
                            .map(top -> top.getTopping().getName() + (top.getQuantity() > 1 ? " x" + top.getQuantity() : ""))
                            .collect(Collectors.toList());
                    return OrderResponse.OrderItemDetail.builder()
                            .id(item.getId())
                            .menuItemName(item.getMenuItem() != null ? item.getMenuItem().getName() : null)
                            .sizeName(item.getMenuItemSize() != null ? item.getMenuItemSize().getSizeName() : null)
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .subtotal(item.getSubtotal())
                            .notes(item.getNotes())
                            .options(optionNames)
                            .toppings(toppingNames)
                            .build();
                }).collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .orderType(order.getOrderType() != null ? order.getOrderType().name() : null)
                .status(order.getStatus().name())
                .brewingStatus(order.getBrewingStatus() != null ? order.getBrewingStatus().name() : null)
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null)
                .paymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null)
                .subtotal(order.getSubtotal())
                .totalDiscount(order.getTotalDiscount())
                .shippingFee(order.getShippingFee())
                .finalAmount(order.getFinalAmount())
                .loyaltyPointsUsed(order.getLoyaltyPointsUsed())
                .branchId(order.getBranch() != null ? order.getBranch().getId() : null)
                .branchName(order.getBranch() != null ? order.getBranch().getName() : null)
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .customerName(order.getCustomer() != null ? order.getCustomer().getFullName() : null)
                .customerPhone(order.getCustomer() != null ? order.getCustomer().getPhoneNumber() : null)
                .estimatedReadyTime(order.getEstimatedReadyTime())
                .createdAt(order.getCreatedAt())
                .items(itemDetails)
                .paymentUrl(null)
                .build();
    }
}
