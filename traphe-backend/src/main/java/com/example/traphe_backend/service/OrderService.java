package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.CreateCompatibleOrderRequest;
import com.example.traphe_backend.dto.request.CreateDrinkOrderRequest;
import com.example.traphe_backend.dto.response.OrderResponse;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    public OrderResponse createDrinkOrder(CreateDrinkOrderRequest request, String userEmail);
    public OrderResponse updateOrderStatus(UUID orderId, String newStatusStr, String userEmail);
    public OrderResponse cancelOrder(UUID orderId, String userEmail);
    public OrderResponse getOrderById(UUID orderId);
    public OrderResponse getOrderById(UUID orderId, String userEmail);
    public Page<com.example.traphe_backend.dto.response.OrderSummaryResponse> getMyOrders(String userEmail, Pageable pageable);
    public Page<com.example.traphe_backend.dto.response.OrderSummaryResponse> getAllOrders(String statusStr, UUID branchId, Pageable pageable);
    public Page<OrderResponse> getFullOrders(String statusStr, UUID branchId, Pageable pageable);
    public OrderResponse createCompatibleOrder(CreateCompatibleOrderRequest request, String userEmail);
    Page<com.example.traphe_backend.dto.response.OrderSummaryResponse> getCustomerOrders(UUID customerId, Pageable pageable);

}