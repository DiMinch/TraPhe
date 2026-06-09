package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchMenuItemRequest {

    @NotNull(message = "Menu item ID is required")
    private UUID menuItemId;

    private Boolean isAvailable;

    private BigDecimal customPrice;

    private String unavailableReason;
}
