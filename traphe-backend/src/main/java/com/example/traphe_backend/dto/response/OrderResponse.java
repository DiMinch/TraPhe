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
public class OrderResponse {

    private UUID orderId;
    private String orderNumber;
    private String status;
    private LocalDateTime estimatedReadyTime;
    private BigDecimal finalAmount;
    private String paymentUrl; // Placeholder for payment integration
}
