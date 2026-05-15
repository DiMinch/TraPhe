package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.CreateMerchandiseOrderRequest;
import com.example.traphe_backend.dto.response.MerchandiseOrderResponse;

public interface MerchandiseOrderService {

    /**
     * Create a merchandise order (non-drink items like packaged coffee, gift sets, etc.).
     * Validates that all items are merchandise (isDrink = false) and ACTIVE.
     */
    MerchandiseOrderResponse createMerchandiseOrder(CreateMerchandiseOrderRequest request, String userEmail);
}
