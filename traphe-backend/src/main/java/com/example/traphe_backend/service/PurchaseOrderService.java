package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.CreatePurchaseOrderRequest;
import com.example.traphe_backend.dto.request.ReceivePurchaseOrderRequest;
import com.example.traphe_backend.dto.response.PageResponse;
import com.example.traphe_backend.dto.response.PurchaseOrderResponse;

import java.util.List;
import java.util.UUID;

public interface PurchaseOrderService {

    PageResponse<PurchaseOrderResponse> getAllPurchaseOrders(UUID supplierId, String status, int page, int size);

    PurchaseOrderResponse getPurchaseOrderById(UUID id);

    List<PurchaseOrderResponse> getPurchaseOrdersBySupplierId(UUID supplierId);

    PurchaseOrderResponse createPurchaseOrder(CreatePurchaseOrderRequest request, String userEmail);

    PurchaseOrderResponse receivePurchaseOrder(UUID id, ReceivePurchaseOrderRequest request, String userEmail);

    PurchaseOrderResponse closePurchaseOrder(UUID id);

    void deletePurchaseOrder(UUID id);
}
