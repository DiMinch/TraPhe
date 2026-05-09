package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdjustStockRequest {

    @NotNull(message = "ingredientId không được trống")
    private UUID ingredientId;

    @NotNull(message = "quantity không được trống")
    private BigDecimal quantity; // positive = increase, negative = decrease

    @NotBlank(message = "Lý do điều chỉnh không được trống")
    private String reason;
}
