package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.AdjustStockRequest;
import com.example.traphe_backend.dto.request.ImportStockRequest;
import com.example.traphe_backend.dto.response.IngredientStockResponse;
import com.example.traphe_backend.dto.response.ImportStockResponse;

import java.util.List;
import java.util.UUID;

public interface StockService {

    List<IngredientStockResponse> getStockByBranch(UUID branchId, String searchName, Boolean lowStockOnly);

    ImportStockResponse importStock(UUID branchId, ImportStockRequest request, String userEmail);

    IngredientStockResponse adjustStock(UUID branchId, AdjustStockRequest request, String userEmail);
}
