package com.example.traphe_backend.service;

import com.example.traphe_backend.entity.Order;

/**
 * Core service for deducting ingredient stock when orders are completed.
 * Triggered from OrderService.updateOrderStatus() when status → COMPLETED.
 */
public interface InventoryDeductionService {

    /**
     * Deduct ingredient stock based on the order's drink items and their recipes.
     * Must run within an existing @Transactional context.
     *
     * @param order     the completed order (with items loaded)
     * @param userEmail the user who triggered the completion
     */
    void deductStockForOrder(Order order, String userEmail);
}
