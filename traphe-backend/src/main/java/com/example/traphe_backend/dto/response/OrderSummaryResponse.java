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
public class OrderSummaryResponse {
    private UUID orderId;
    private String orderNumber;
    private String orderType;
    private String status;
    private String brewingStatus;
    private String paymentMethod;
    private String paymentStatus;
    private BigDecimal finalAmount;
    private int itemCount;
    private String branchName;
    private String customerName;
    private LocalDateTime createdAt;
}
