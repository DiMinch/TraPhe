package com.example.traphe_backend.ai.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class BranchSuggestionResponse {
    private int rank;
    private UUID branchId;
    private String branchName;
    private double totalScore;
    private double distanceKm;
    private int estimatedPrepMinutes;
    private int currentOrders;
    private String closingTime;
    private BigDecimal shippingFee;
    private Map<String, Double> scores;
    private String reason;
}
