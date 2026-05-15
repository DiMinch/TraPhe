package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.CreateIngredientRequest;
import com.example.traphe_backend.dto.request.UpdateIngredientRequest;
import com.example.traphe_backend.dto.response.IngredientResponse;

import java.util.List;
import java.util.UUID;

public interface IngredientService {

    IngredientResponse createIngredient(CreateIngredientRequest request);

    List<IngredientResponse> getAllIngredients();

    IngredientResponse getIngredientById(UUID id);

    IngredientResponse updateIngredient(UUID id, UpdateIngredientRequest request);

    void softDeleteIngredient(UUID id);

    IngredientResponse findByBarcode(String barcode);

    IngredientResponse findBySku(String sku);
}
