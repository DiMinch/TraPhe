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
public class StockTransactionResponse {
    private UUID id;
    private String ingredientName;
    private String type;
    private BigDecimal quantityChange;
    private BigDecimal quantityBefore;
    private BigDecimal quantityAfter;
    private String referenceType;
    private UUID referenceId;
    private String reason;
    private LocalDateTime createdAt;
}
