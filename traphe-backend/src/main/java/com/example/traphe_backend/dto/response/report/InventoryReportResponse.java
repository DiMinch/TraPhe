package com.example.traphe_backend.dto.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryReportResponse {
    private UUID branchId;
    private String branchName;
    private UUID menuItemId;
    private String productName;
    private boolean isAvailable;
    private String unavailableReason;
}
