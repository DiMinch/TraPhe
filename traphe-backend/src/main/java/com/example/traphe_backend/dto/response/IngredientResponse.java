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
public class IngredientResponse {
    private UUID id;
    private String name;
    private String unit;
    private BigDecimal minStockAlert;
    private boolean isActive;
    private LocalDateTime createdAt;
}
