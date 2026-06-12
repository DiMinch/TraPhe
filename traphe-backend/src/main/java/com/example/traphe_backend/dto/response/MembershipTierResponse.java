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
public class MembershipTierResponse {
    private UUID id;
    private String name;
    private int tierLevel;
    private BigDecimal minSpending;
    private BigDecimal pointEarningRate;
    private BigDecimal discountRate;
    private boolean isActive;
    private String description;
    private LocalDateTime createdAt;
}
