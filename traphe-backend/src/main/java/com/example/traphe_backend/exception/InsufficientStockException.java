package com.example.traphe_backend.exception;

import lombok.Getter;

import java.math.BigDecimal;

/**
 * Thrown when a stock deduction cannot be fulfilled because
 * the available quantity is less than the required quantity.
 */
@Getter
public class InsufficientStockException extends RuntimeException {

    private final String ingredientName;
    private final BigDecimal required;
    private final BigDecimal available;

    public InsufficientStockException(String ingredientName, BigDecimal required, BigDecimal available) {
        super(String.format(
                "Không đủ tồn kho cho nguyên liệu '%s'. Cần: %s, Hiện có: %s",
                ingredientName, required.toPlainString(), available.toPlainString()));
        this.ingredientName = ingredientName;
        this.required = required;
        this.available = available;
    }
}
