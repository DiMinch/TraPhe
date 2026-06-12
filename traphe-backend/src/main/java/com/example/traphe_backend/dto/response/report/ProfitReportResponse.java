package com.example.traphe_backend.dto.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfitReportResponse {
    private BigDecimal totalRevenue;
    private BigDecimal totalCost;
    private BigDecimal grossProfit;
    private double profitMargin;
    private List<ProductProfit> details;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductProfit {
        private String productVariantId;
        private String productName;
        private String variantName;
        private String sku;
        private long quantitySold;
        private BigDecimal revenue;
        private BigDecimal cost;
        private BigDecimal grossProfit;
        private double profitMargin;
    }
}
