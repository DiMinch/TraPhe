package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.CheckoutRequest;
import com.example.traphe_backend.dto.response.CheckoutResponse;

public interface CheckoutService {

    /**
     * Combined checkout for drink + merchandise orders.
     * Creates a single payment transaction that covers both orders.
     * At least one orderId must be provided.
     */
    CheckoutResponse checkout(CheckoutRequest request, String userEmail);
}
