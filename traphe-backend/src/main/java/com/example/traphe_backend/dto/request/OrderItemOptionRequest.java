package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class OrderItemOptionRequest {

    @NotNull(message = "Option group ID is required")
    private UUID optionGroupId;

    @NotNull(message = "Option value ID is required")
    private UUID optionValueId;
}
