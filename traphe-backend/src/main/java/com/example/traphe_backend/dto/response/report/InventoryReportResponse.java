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
public class InventoryReportResponse {
    private int totalProducts;
    private int lowStockProducts;
    private int outOfStockProducts;
    private List<InventoryReportItem> items;
    private List<FastMovingItem> fastMovingItems;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryReportItem {
        private String productVariantId;
        private String productName;
        private String variantName;
        private String sku;
        private double quantityPhysical;
        private double quantityReserved;
        private double quantityAvailable;
        private double minThreshold;
        private boolean isLowStock;
        private boolean isOutOfStock;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FastMovingItem {
        private String productVariantId;
        private String productName;
        private String variantName;
        private String sku;
        private int quantitySold;
        private int daysSinceFirstSale;
        private double averageDailySales;
    }
}
