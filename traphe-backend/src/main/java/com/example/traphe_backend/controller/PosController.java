package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.CreatePosOrderRequest;
import com.example.traphe_backend.dto.request.PosPaymentRequest;
import com.example.traphe_backend.dto.request.UpdateBrewingStatusRequest;
import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.OrderResponse;
import com.example.traphe_backend.dto.response.PosCustomerResponse;
import com.example.traphe_backend.dto.response.PosMenuResponse;
import com.example.traphe_backend.dto.response.PosQueueItemResponse;
import com.example.traphe_backend.service.PosService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pos")
@RequiredArgsConstructor
public class PosController {

    private final PosService posService;

    @GetMapping("/menu")
    public ResponseEntity<ApiResponse<List<PosMenuResponse>>> getPosMenu(@RequestParam UUID branchId) {
        List<PosMenuResponse> menu = posService.getMenuByBranch(branchId);
        return ResponseEntity.ok(ApiResponse.success(menu, "Lấy danh sách menu POS thành công"));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<PosCustomerResponse>> lookupCustomer(@RequestParam String phone) {
        PosCustomerResponse customer = posService.lookupCustomer(phone);
        return ResponseEntity.ok(ApiResponse.success(customer, "Tìm thấy khách hàng"));
    }

    @PostMapping("/orders")
    public ResponseEntity<ApiResponse<OrderResponse>> createPosOrder(
            @Valid @RequestBody CreatePosOrderRequest request,
            Authentication authentication
    ) {
        String staffEmail = authentication != null ? authentication.getName() : "anonymous-pos";
        OrderResponse response = posService.createPosOrder(request, staffEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Tạo đơn POS thành công"));
    }

    @PostMapping("/payment")
    public ResponseEntity<ApiResponse<Void>> processPayment(
            @RequestParam UUID orderId,
            @Valid @RequestBody PosPaymentRequest request
    ) {
        posService.processPayment(orderId, request);
        return ResponseEntity.ok(ApiResponse.success(null, "Thanh toán đơn hàng thành công"));
    }

    @GetMapping("/queue")
    public ResponseEntity<ApiResponse<List<PosQueueItemResponse>>> getQueue(@RequestParam UUID branchId) {
        List<PosQueueItemResponse> queue = posService.getQueue(branchId);
        return ResponseEntity.ok(ApiResponse.success(queue, "Lấy danh sách queue hiện tại thành công"));
    }

    @PutMapping("/orders/{id}/brewing-status")
    public ResponseEntity<ApiResponse<Void>> updateBrewingStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateBrewingStatusRequest request
    ) {
        posService.updateBrewingStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(null, "Cập nhật trạng thái pha chế KDS thành công"));
    }
}
