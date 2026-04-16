package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.CreateDrinkOrderRequest;
import com.example.traphe_backend.dto.request.UpdateOrderStatusRequest;
import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.OrderResponse;
import com.example.traphe_backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order", description = "API Quản lý Đơn hàng cho Khách mua hàng online hoặc tại quán.")
public class OrderController {

    private final OrderService orderService;

    /**
     * POST /api/orders/drink — Tạo đơn đồ uống
     * Requires JWT authentication.
     */
    @PostMapping("/drink")
    @Operation(summary = "Tạo một đơn đặt Đồ uống (Online)", description = "Submit giỏ hàng lên hệ thống để tiến hành tạo đơn chờ xác nhận. Cần token truyền lên.")

    public ResponseEntity<ApiResponse<OrderResponse>> createDrinkOrder(
            @Valid @RequestBody CreateDrinkOrderRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        OrderResponse response = orderService.createDrinkOrder(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Tạo đơn đồ uống thành công"));
    }

    /**
     * PUT /api/orders/:id/status — Cập nhật trạng thái đơn hàng
     * Valid transitions: PENDING → CONFIRMED → COMPLETED
     * Cancel phải dùng DELETE endpoint.
     */
    @PutMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái một đơn", description = "Chuyển đơn từ PENDING -> CONFIRMED -> COMPLETED. (Dành cho Quản lý / Nhân viên). Để huỷ đơn thì gọi route khác.")

    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        OrderResponse response = orderService.updateOrderStatus(id, request.getStatus(), userEmail);
        return ResponseEntity.ok(
                ApiResponse.success(response, "Cập nhật trạng thái đơn hàng thành công"));
    }

    /**
     * DELETE /api/orders/:id — Huỷ đơn hàng
     * Chỉ huỷ được khi đơn ở trạng thái PENDING hoặc CONFIRMED.
     * Tự động hoàn điểm tích luỹ và chuyển payment_status sang REFUNDED nếu đã thanh toán.
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Huỷ đơn hàng", description = "Huỷ đơn, chỉ có tác dụng nếu chưa đi vào pha chế. Hệ thống sẽ tự động hoàn lại point cho khách nếu dùng point để áp mã.")

    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        OrderResponse response = orderService.cancelOrder(id, userEmail);
        return ResponseEntity.ok(
                ApiResponse.success(response, "Huỷ đơn hàng thành công"));
    }
}
