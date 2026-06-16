package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.response.OrderResponse;
import com.example.traphe_backend.entity.Order;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Read-only order query operations.
 * Extracted from OrderServiceImpl to reduce service class complexity.
 */
public interface OrderQueryService {

    OrderResponse getOrderById(UUID orderId);

    OrderResponse getOrderById(UUID orderId, String userEmail);

    Page<OrderResponse> getMyOrders(String userEmail, Pageable pageable);

    Page<com.example.traphe_backend.dto.response.OrderSummaryResponse> getAllOrders(String statusStr, UUID branchId, Pageable pageable);

    Page<com.example.traphe_backend.dto.response.OrderSummaryResponse> getCustomerOrders(UUID customerId, Pageable pageable);
    Page<OrderResponse> getFullOrders(String statusStr, UUID branchId, Pageable pageable);

    /**
     * Maps an Order entity to an OrderResponse DTO.
     * Exposed as a shared utility so other services (e.g., OrderServiceImpl) can reuse it.
     */
    OrderResponse mapToOrderResponse(Order order);
}
