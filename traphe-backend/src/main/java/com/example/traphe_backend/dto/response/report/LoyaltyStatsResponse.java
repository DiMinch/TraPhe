package com.example.traphe_backend.dto.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyStatsResponse {
    private long totalPointsIssued;
    private long totalPointsRedeemed;
    private long activeLoyaltyUsers;
}
