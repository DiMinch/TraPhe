package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreatePosOrderRequest {
    @NotNull(message = "Branch ID is required")
    private UUID branchId;

    private String customerPhone; // optional

    @NotEmpty(message = "Order must have at least one item")
    private List<OrderItemRequest> items;
}
