package com.example.traphe_backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class OrderItemRequest {

    @NotNull(message = "Menu item ID is required")
    private UUID menuItemId;

    private UUID menuItemSizeId; // Nullable if item has no size

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity = 1;

    private String notes;

    @Valid
    private List<OrderItemOptionRequest> options;

    @Valid
    private List<OrderItemToppingRequest> toppings;
}
