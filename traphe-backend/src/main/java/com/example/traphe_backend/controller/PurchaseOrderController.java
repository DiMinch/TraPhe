package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.CreatePurchaseOrderRequest;
import com.example.traphe_backend.dto.request.ReceivePurchaseOrderRequest;
import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.PageResponse;
import com.example.traphe_backend.dto.response.PurchaseOrderResponse;
import com.example.traphe_backend.service.PurchaseOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'BRANCH_MANAGER')")
@Tag(name = "Purchase Orders", description = "Quản lý phiếu đặt hàng nhà cung cấp")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping
    @Operation(summary = "Danh sách phiếu đặt hàng",
            description = "Lấy danh sách phiếu đặt hàng có phân trang. Hỗ trợ lọc theo supplierId, status.")
    public ResponseEntity<ApiResponse<List<PurchaseOrderResponse>>> getAllPurchaseOrders(
            @RequestParam(required = false) UUID supplierId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {

        PageResponse<PurchaseOrderResponse> result = purchaseOrderService.getAllPurchaseOrders(supplierId, status, page, size);
        return ResponseEntity.ok(ApiResponse.successPagination(result, "Danh sách phiếu đặt hàng"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết phiếu đặt hàng")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> getPurchaseOrderById(@PathVariable UUID id) {
        PurchaseOrderResponse data = purchaseOrderService.getPurchaseOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(data, "Chi tiết phiếu đặt hàng"));
    }

    @GetMapping("/supplier/{supplierId}")
    @Operation(summary = "Phiếu đặt hàng theo nhà cung cấp")
    public ResponseEntity<ApiResponse<List<PurchaseOrderResponse>>> getPurchaseOrdersBySupplierId(
            @PathVariable UUID supplierId) {
        List<PurchaseOrderResponse> data = purchaseOrderService.getPurchaseOrdersBySupplierId(supplierId);
        return ResponseEntity.ok(ApiResponse.success(data, "Phiếu đặt hàng theo nhà cung cấp"));
    }

    @PostMapping
    @Operation(summary = "Tạo phiếu đặt hàng mới (DRAFT)")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> createPurchaseOrder(
            @Valid @RequestBody CreatePurchaseOrderRequest request,
            Authentication authentication) {
        PurchaseOrderResponse data = purchaseOrderService.createPurchaseOrder(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(data, "Tạo phiếu đặt hàng thành công"));
    }

    @PostMapping("/{id}/receive")
    @Operation(summary = "Nhận hàng (DRAFT -> RECEIVED)",
            description = "Cập nhật số lượng nhận thực tế và chuyển trạng thái phiếu sang RECEIVED.")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> receivePurchaseOrder(
            @PathVariable UUID id,
            @Valid @RequestBody ReceivePurchaseOrderRequest request,
            Authentication authentication) {
        PurchaseOrderResponse data = purchaseOrderService.receivePurchaseOrder(id, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(data, "Nhận hàng thành công"));
    }

    @PutMapping("/{id}/close")
    @Operation(summary = "Đóng phiếu (RECEIVED -> CLOSED)")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> closePurchaseOrder(@PathVariable UUID id) {
        PurchaseOrderResponse data = purchaseOrderService.closePurchaseOrder(id);
        return ResponseEntity.ok(ApiResponse.success(data, "Đóng phiếu thành công"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa phiếu đặt hàng (chỉ DRAFT)")
    public ResponseEntity<ApiResponse<Void>> deletePurchaseOrder(@PathVariable UUID id) {
        purchaseOrderService.deletePurchaseOrder(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa phiếu đặt hàng thành công"));
    }
}
