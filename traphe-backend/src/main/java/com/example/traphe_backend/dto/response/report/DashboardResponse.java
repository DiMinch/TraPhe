package com.example.traphe_backend.dto.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private RevenueReportResponse revenueSummary;
    private List<TopProductResponse> topProducts;
    private LoyaltyStatsResponse loyaltyStats;
}
