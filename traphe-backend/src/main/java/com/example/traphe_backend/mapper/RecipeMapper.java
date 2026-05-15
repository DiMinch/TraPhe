package com.example.traphe_backend.mapper;

import com.example.traphe_backend.dto.response.RecipeItemResponse;
import com.example.traphe_backend.dto.response.RecipeResponse;
import com.example.traphe_backend.entity.Ingredient;
import com.example.traphe_backend.entity.Recipe;
import com.example.traphe_backend.entity.RecipeItem;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Manual mapper for Recipe — because recipe response needs ingredient details
 * resolved from a batch-fetched map (not navigable via lazy loading).
 */
@Component
public class RecipeMapper {

    public RecipeResponse toResponse(Recipe recipe, List<RecipeItem> items, Map<UUID, Ingredient> ingredientMap) {
        List<RecipeItemResponse> itemResponses = items.stream()
                .map(item -> {
                    Ingredient ingredient = ingredientMap.get(item.getIngredient().getId());
                    return RecipeItemResponse.builder()
                            .id(item.getId())
                            .ingredientId(ingredient.getId())
                            .ingredientName(ingredient.getName())
                            .unit(ingredient.getUnit())
                            .quantity(item.getQuantity())
                            .build();
                })
                .toList();

        return RecipeResponse.builder()
                .id(recipe.getId())
                .menuItemId(recipe.getMenuItem().getId())
                .menuItemName(recipe.getMenuItem().getName())
                .size(recipe.getSize())
                .notes(recipe.getNotes())
                .isActive(recipe.isActive())
                .items(itemResponses)
                .build();
    }
}
