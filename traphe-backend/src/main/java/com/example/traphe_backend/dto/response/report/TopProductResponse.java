package com.example.traphe_backend.dto.response.report;

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
public class TopProductResponse {
    private UUID menuItemId;
    private String productName;
    private String categoryName;
    private long totalQuantitySold;
    private BigDecimal totalRevenueGenerated;
}
