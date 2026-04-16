package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.CheckoutRequest;
import com.example.traphe_backend.dto.request.CreateDrinkOrderRequest;
import com.example.traphe_backend.dto.request.CreateMerchandiseOrderRequest;
import com.example.traphe_backend.dto.request.UpdateOrderStatusRequest;
import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.CheckoutResponse;
import com.example.traphe_backend.dto.response.MerchandiseOrderResponse;
import com.example.traphe_backend.dto.response.OrderResponse;
import com.example.traphe_backend.service.CheckoutService;
import com.example.traphe_backend.service.MerchandiseOrderService;
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
@Tag(name = "Order", description = "API Quản lý Đơn hàng — Đồ uống, Merchandise, và Thanh toán gộp (Combined Checkout).")
public class OrderController {

    private final OrderService orderService;
    private final MerchandiseOrderService merchandiseOrderService;
    private final CheckoutService checkoutService;

    // ======================== DRINK ORDER ========================

    /**
     * POST /api/orders/drink — Tạo đơn đồ uống
     * Requires JWT authentication.
     */
    @PostMapping("/drink")
    @Operation(summary = "Tạo đơn Đồ uống (Online)",
            description = "Submit giỏ hàng đồ uống lên hệ thống. Yêu cầu branchId để xác định chi nhánh. "
                    + "Hỗ trợ chọn size, options (đường/đá), toppings. Cần JWT token.")
    public ResponseEntity<ApiResponse<OrderResponse>> createDrinkOrder(
            @Valid @RequestBody CreateDrinkOrderRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        OrderResponse response = orderService.createDrinkOrder(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Tạo đơn đồ uống thành công"));
    }

    // ======================== MERCHANDISE ORDER ========================

    /**
     * POST /api/orders/merchandise — Tạo đơn merchandise (bột cà phê, trà đóng gói, gift set...)
     * Requires JWT authentication.
     */
    @PostMapping("/merchandise")
    @Operation(summary = "Tạo đơn Merchandise (Sản phẩm đóng gói)",
            description = "Tạo đơn hàng cho các sản phẩm không phải đồ uống — ví dụ cà phê gói, trà túi lọc, gift set. "
                    + "Không có size/options/toppings. Dùng basePrice. Cần shipping address.")
    public ResponseEntity<ApiResponse<MerchandiseOrderResponse>> createMerchandiseOrder(
            @Valid @RequestBody CreateMerchandiseOrderRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        MerchandiseOrderResponse response = merchandiseOrderService.createMerchandiseOrder(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Tạo đơn merchandise thành công"));
    }

    // ======================== COMBINED CHECKOUT ========================

    /**
     * POST /api/orders/checkout — Thanh toán gộp (drink + merchandise)
     * Hỗ trợ thanh toán 1 hoặc cả 2 loại đơn trong 1 giao dịch.
     */
    @PostMapping("/checkout")
    @Operation(summary = "Thanh toán gộp (Combined Checkout)",
            description = "Thanh toán 1 hoặc 2 đơn hàng (drink + merchandise) trong cùng một giao dịch. "
                    + "Tạo bản ghi combined_checkouts, xử lý payment, và tự động chuyển trạng thái đơn sang CONFIRMED nếu thành công. "
                    + "Hỗ trợ VNPay, MoMo, Cash, QR.")
    public ResponseEntity<ApiResponse<CheckoutResponse>> checkout(
            @Valid @RequestBody CheckoutRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        CheckoutResponse response = checkoutService.checkout(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Thanh toán thành công"));
    }

    // ======================== STATUS UPDATE ========================

    /**
     * PUT /api/orders/:id/status — Cập nhật trạng thái đơn hàng
     */
    @PutMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái đơn",
            description = "Chuyển đơn từ PENDING → CONFIRMED → COMPLETED. (Dành cho Quản lý / Nhân viên). "
                    + "Để huỷ đơn thì gọi DELETE endpoint.")
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

    // ======================== CANCEL ========================

    /**
     * DELETE /api/orders/:id — Huỷ đơn hàng
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Huỷ đơn hàng",
            description = "Huỷ đơn, chỉ có tác dụng nếu đơn chưa COMPLETED. "
                    + "Hệ thống tự động hoàn lại point nếu dùng point, và set payment_status = REFUNDED nếu đã thanh toán.")
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
