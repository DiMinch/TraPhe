package com.example.traphe_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BranchMenuItemResponse {
    private UUID branchId;
    private UUID menuItemId;
    private String menuItemName;
    private String menuItemImageUrl;
    private boolean isAvailable;
    private BigDecimal customPrice;
    private String unavailableReason;
}
