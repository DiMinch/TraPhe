package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.AddToCartRequest;
import com.example.traphe_backend.dto.response.CartResponse;

import java.util.UUID;

public interface CartService {
    CartResponse getCart(UUID userId);

    CartResponse addToCart(UUID userId, AddToCartRequest request);

    CartResponse updateItemQuantity(UUID userId, UUID cartItemId, int quantity);

    CartResponse removeItem(UUID userId, UUID cartItemId);

    void clearCart(UUID userId);

    long getItemCount(UUID userId);
}
