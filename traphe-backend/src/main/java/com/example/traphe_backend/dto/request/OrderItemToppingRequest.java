package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class OrderItemToppingRequest {

    @NotNull(message = "Topping ID is required")
    private UUID toppingId;

    @Min(value = 1, message = "Topping quantity must be at least 1")
    private int quantity = 1;
}
