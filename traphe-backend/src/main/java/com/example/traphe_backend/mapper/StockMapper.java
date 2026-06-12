package com.example.traphe_backend.mapper;

import com.example.traphe_backend.dto.response.IngredientStockResponse;
import com.example.traphe_backend.dto.response.StockTransactionResponse;
import com.example.traphe_backend.entity.Ingredient;
import com.example.traphe_backend.entity.IngredientStock;
import com.example.traphe_backend.entity.StockTransaction;
import org.springframework.stereotype.Component;


/**
 * Mapper for stock and transaction entities.
 * Manual implementation because responses need ingredient details from parent entity.
 */
@Component
public class StockMapper {

    public IngredientStockResponse toStockResponse(IngredientStock stock, Ingredient ingredient) {
        boolean isLowStock = ingredient.getMinStockAlert() != null
                && stock.getQuantityAvailable().compareTo(ingredient.getMinStockAlert()) < 0;

        return IngredientStockResponse.builder()
                .id(stock.getId())
                .branchId(stock.getBranch().getId())
                .branchName(stock.getBranch().getName())
                .ingredientId(ingredient.getId())
                .ingredientName(ingredient.getName())
                .unit(ingredient.getUnit())
                .quantityAvailable(stock.getQuantityAvailable())
                .minStockAlert(ingredient.getMinStockAlert())
                .isLowStock(isLowStock)
                .lastUpdated(stock.getLastUpdated())
                .build();
    }

    public StockTransactionResponse toTransactionResponse(StockTransaction tx, Ingredient ingredient) {
        return StockTransactionResponse.builder()
                .id(tx.getId())
                .ingredientName(ingredient.getName())
                .type(tx.getType().name())
                .quantityChange(tx.getQuantityChange())
                .quantityBefore(tx.getQuantityBefore())
                .quantityAfter(tx.getQuantityAfter())
                .referenceType(tx.getReferenceType() != null ? tx.getReferenceType().name() : null)
                .referenceId(tx.getReferenceId())
                .reason(tx.getReason())
                .createdAt(tx.getCreatedAt())
                .build();
    }
}
