package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.dto.response.InventoryOverviewResponse;
import com.example.traphe_backend.dto.response.InventoryOverviewResponse.LowStockItem;
import com.example.traphe_backend.dto.response.InventoryOverviewResponse.OnHandQuantityChartData;
import com.example.traphe_backend.dto.response.InventoryOverviewResponse.StockValueChartData;
import com.example.traphe_backend.entity.Branch;
import com.example.traphe_backend.entity.IngredientStock;
import com.example.traphe_backend.repository.BranchRepository;
import com.example.traphe_backend.repository.IngredientStockRepository;
import com.example.traphe_backend.service.InventoryOverviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Provides an aggregated inventory overview for the Admin/Employee dashboard.
 * Aggregates ingredient stock data across all active branches.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryOverviewServiceImpl implements InventoryOverviewService {

    private final IngredientStockRepository ingredientStockRepository;
    private final BranchRepository branchRepository;

    @Override
    public InventoryOverviewResponse getOverview(String stockValueTimeRange, String onHandQuantityTimeRange) {
        List<Branch> activeBranches = branchRepository.findByIsActiveTrue();

        // Aggregate per-branch stock data
        List<StockValueChartData> stockValueChart = new ArrayList<>();
        List<OnHandQuantityChartData> onHandChart = new ArrayList<>();
        List<LowStockItem> lowStockItems = new ArrayList<>();
        BigDecimal totalStockValue = BigDecimal.ZERO;
        int lowStockCount = 0;

        for (Branch branch : activeBranches) {
            List<IngredientStock> stocks = ingredientStockRepository.findByBranchId(branch.getId());
            BigDecimal branchTotal = BigDecimal.ZERO;
            BigDecimal branchQuantity = BigDecimal.ZERO;

            for (IngredientStock stock : stocks) {
                branchTotal = branchTotal.add(stock.getQuantityAvailable());
                branchQuantity = branchQuantity.add(stock.getQuantityAvailable());

                // Check low stock
                BigDecimal minAlert = stock.getIngredient().getMinStockAlert();
                if (minAlert != null && stock.getQuantityAvailable().compareTo(minAlert) < 0) {
                    lowStockCount++;
                    lowStockItems.add(LowStockItem.builder()
                            .productVariantId(stock.getIngredient().getId().toString())
                            .productName(stock.getIngredient().getName())
                            .variantName(branch.getName())
                            .sku(stock.getIngredient().getSku() != null ? stock.getIngredient().getSku() : "")
                            .currentStock(stock.getQuantityAvailable())
                            .minThreshold(minAlert)
                            .unitPrice(BigDecimal.ZERO)
                            .build());
                }
            }

            totalStockValue = totalStockValue.add(branchTotal);

            stockValueChart.add(StockValueChartData.builder()
                    .label(branch.getName())
                    .stockValue(branchTotal)
                    .build());

            onHandChart.add(OnHandQuantityChartData.builder()
                    .label(branch.getName())
                    .productQuantity(branchQuantity)
                    .componentQuantity(BigDecimal.ZERO) // Ingredient-based system: no separate component
                    .build());
        }

        return InventoryOverviewResponse.builder()
                .totalStockValue(totalStockValue)
                .lowStockProductCount(lowStockCount)
                .lowStockComponentCount(0)
                .stockValueChartData(stockValueChart)
                .onHandQuantityChartData(onHandChart)
                .lowStockProducts(lowStockItems)
                .lowStockComponents(List.of())
                .build();
    }
}
