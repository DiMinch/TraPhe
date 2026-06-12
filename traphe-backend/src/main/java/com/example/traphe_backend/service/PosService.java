package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.CreatePosOrderRequest;
import com.example.traphe_backend.dto.request.PosPaymentRequest;
import com.example.traphe_backend.dto.response.OrderResponse;
import com.example.traphe_backend.dto.response.PosCustomerResponse;
import com.example.traphe_backend.dto.response.PosMenuResponse;
import com.example.traphe_backend.dto.response.PosQueueItemResponse;
import java.util.List;
import java.util.UUID;

public interface PosService {
    public List<PosMenuResponse> getMenuByBranch(UUID branchId);
    public PosCustomerResponse lookupCustomer(String phone);
    public OrderResponse createPosOrder(CreatePosOrderRequest request, String staffEmail);
    public void processPayment(UUID orderId, PosPaymentRequest req);
    public List<PosQueueItemResponse> getQueue(UUID branchId);
    public void updateBrewingStatus(UUID orderId, String statusStr);
}