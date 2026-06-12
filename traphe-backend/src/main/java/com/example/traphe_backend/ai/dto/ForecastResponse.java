package com.example.traphe_backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForecastResponse {

    private UUID ingredientId;
    private String ingredientName;
    private String unit;

    private LocalDate forecastDate;
    private BigDecimal predictedQuantity;

    /** Phần trăm thay đổi so với kỳ trước (dương = cần nhiều hơn, âm = ít hơn) */
    private BigDecimal trendPct;

    /** "UP", "DOWN", "STABLE" */
    private String trendLabel;

    /** 0.0 - 1.0 */
    private double confidence;

    /** Lượng tồn kho hiện tại (nếu có) */
    private BigDecimal currentStock;

    /** Khuyến nghị: "REORDER", "OK", "LOW" */
    private String stockStatus;
}
