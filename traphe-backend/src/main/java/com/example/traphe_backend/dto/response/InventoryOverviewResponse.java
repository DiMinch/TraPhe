package com.example.traphe_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Response DTO for GET /api/inventory/overview.
 * Aggregates ingredient stock data across branches for Admin/Employee dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryOverviewResponse {
    private BigDecimal totalStockValue;
    private int lowStockProductCount;
    private int lowStockComponentCount;
    private List<StockValueChartData> stockValueChartData;
    private List<OnHandQuantityChartData> onHandQuantityChartData;
    private List<LowStockItem> lowStockProducts;
    private List<LowStockItem> lowStockComponents;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockValueChartData {
        private String label;
        private BigDecimal stockValue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OnHandQuantityChartData {
        private String label;
        private BigDecimal productQuantity;
        private BigDecimal componentQuantity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LowStockItem {
        private String productVariantId;
        private String productName;
        private String variantName;
        private String sku;
        private BigDecimal currentStock;
        private BigDecimal minThreshold;
        private BigDecimal unitPrice;
        private String imageUrl;
    }
}
