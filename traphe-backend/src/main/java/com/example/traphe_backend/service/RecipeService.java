package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.CreateRecipeRequest;
import com.example.traphe_backend.dto.request.UpdateRecipeRequest;
import com.example.traphe_backend.dto.response.RecipeResponse;

import java.util.List;
import java.util.UUID;

public interface RecipeService {

    RecipeResponse createRecipe(CreateRecipeRequest request);

    RecipeResponse updateRecipe(UUID id, UpdateRecipeRequest request);

    List<RecipeResponse> getRecipesByMenuItemId(UUID menuItemId);
}
