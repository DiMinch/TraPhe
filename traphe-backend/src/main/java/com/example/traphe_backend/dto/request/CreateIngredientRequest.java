package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateIngredientRequest {

    @NotBlank(message = "Tên nguyên liệu không được trống")
    private String name;

    @NotBlank(message = "Đơn vị không được trống")
    private String unit;

    private BigDecimal minStockAlert;

    private String barcode;

    private String sku;
}
