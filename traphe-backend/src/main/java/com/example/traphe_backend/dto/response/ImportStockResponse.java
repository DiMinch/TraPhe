package com.example.traphe_backend.dto.response;

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
public class ImportStockResponse {

    private int totalItemsImported;
    private List<ImportedItem> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportedItem {
        private String ingredientName;
        private BigDecimal quantityImported;
        private BigDecimal newQuantity;
    }
}
