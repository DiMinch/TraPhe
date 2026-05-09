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
public class RecipeItemResponse {
    private UUID id;
    private UUID ingredientId;
    private String ingredientName;
    private String unit;
    private BigDecimal quantity;
}
