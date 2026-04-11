package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.CreateDrinkOrderRequest;
import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.OrderResponse;
import com.example.traphe_backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * POST /api/orders/drink — Tạo đơn đồ uống
     * Requires JWT authentication.
     */
    @PostMapping("/drink")
    public ResponseEntity<ApiResponse<OrderResponse>> createDrinkOrder(
            @Valid @RequestBody CreateDrinkOrderRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        OrderResponse response = orderService.createDrinkOrder(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Tạo đơn đồ uống thành công"));
    }
}
