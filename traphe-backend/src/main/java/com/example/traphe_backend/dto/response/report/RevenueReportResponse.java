package com.example.traphe_backend.dto.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueReportResponse {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private String periodType;
    private List<RevenueByPeriod> breakdown;
    private List<RevenueByType> byOrderType;
    private ComparisonData comparison;
    private List<RevenueByBranch> byBranch;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueByPeriod {
        private String period; // formatted date (e.g. yyyy-MM-dd)
        private BigDecimal revenue;
        private long orderCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueByType {
        private String orderType;
        private BigDecimal revenue;
        private long orderCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparisonData {
        private BigDecimal previousRevenue;
        private BigDecimal difference;
        private double percentageChange;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueByBranch {
        private UUID branchId;
        private String branchName;
        private BigDecimal revenue;
        private long orderCount;
    }
}
