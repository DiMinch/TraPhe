package com.example.traphe_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngredientStockResponse {
    private UUID id;
    private UUID branchId;
    private UUID ingredientId;
    private String ingredientName;
    private String unit;
    private BigDecimal quantityAvailable;
    private BigDecimal minStockAlert;
    private boolean isLowStock;
    private LocalDateTime lastUpdated;
}
