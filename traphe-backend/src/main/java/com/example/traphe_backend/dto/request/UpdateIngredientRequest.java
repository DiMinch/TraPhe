package com.example.traphe_backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateIngredientRequest {

    private String name;
    private String unit;
    private BigDecimal minStockAlert;
    private Boolean isActive;
}
