package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.dto.request.CreateRecipeRequest;
import com.example.traphe_backend.dto.request.UpdateRecipeRequest;
import com.example.traphe_backend.dto.response.RecipeResponse;
import com.example.traphe_backend.entity.Ingredient;
import com.example.traphe_backend.entity.MenuItem;
import com.example.traphe_backend.entity.Recipe;
import com.example.traphe_backend.entity.RecipeItem;
import com.example.traphe_backend.enums.MenuItemStatus;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.mapper.RecipeMapper;
import com.example.traphe_backend.repository.IngredientRepository;
import com.example.traphe_backend.repository.MenuItemRepository;
import com.example.traphe_backend.repository.RecipeItemRepository;
import com.example.traphe_backend.repository.RecipeRepository;
import com.example.traphe_backend.service.RecipeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecipeServiceImpl implements RecipeService {

    private final RecipeRepository recipeRepository;
    private final RecipeItemRepository recipeItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeMapper recipeMapper;

    @Override
    @Transactional
    public RecipeResponse createRecipe(CreateRecipeRequest request) {

        // 1. Validate menu item
        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Menu item không tồn tại với ID: " + request.getMenuItemId()));

        if (menuItem.isDeleted() || menuItem.getStatus() != MenuItemStatus.ACTIVE) {
            throw new IllegalArgumentException("Menu item '" + menuItem.getName() + "' không active.");
        }
        if (!menuItem.isDrink()) {
            throw new IllegalArgumentException("Chỉ tạo công thức cho đồ uống. '" + menuItem.getName() + "' không phải đồ uống.");
        }

        // 2. Check uniqueness (menu_item_id, size)
        String size = request.getSize() != null ? request.getSize().trim().toUpperCase() : null;
        boolean exists;
        if (size == null) {
            exists = recipeRepository.existsByMenuItemIdAndSizeIsNullAndIsDeletedFalse(menuItem.getId());
        } else {
            exists = recipeRepository.existsByMenuItemIdAndSizeAndIsDeletedFalse(menuItem.getId(), size);
        }
        if (exists) {
            String sizeLabel = size != null ? size : "chung (tất cả size)";
            throw new IllegalArgumentException(
                    "Đã tồn tại công thức cho '" + menuItem.getName() + "' size " + sizeLabel + ".");
        }

        // 3. Validate ingredients (batch-fetch, no duplicates)
        Set<UUID> ingredientIds = new HashSet<>();
        for (CreateRecipeRequest.RecipeItemRequest item : request.getItems()) {
            if (!ingredientIds.add(item.getIngredientId())) {
                throw new IllegalArgumentException("Trùng nguyên liệu trong công thức: " + item.getIngredientId());
            }
        }

        Map<UUID, Ingredient> ingredientMap = ingredientRepository
                .findAllByIdInAndIsDeletedFalse(ingredientIds)
                .stream().collect(Collectors.toMap(Ingredient::getId, i -> i));

        for (UUID id : ingredientIds) {
            Ingredient ingredient = ingredientMap.get(id);
            if (ingredient == null) {
                throw new ResourceNotFoundException("Nguyên liệu không tồn tại với ID: " + id);
            }
            if (!ingredient.isActive()) {
                throw new IllegalArgumentException("Nguyên liệu '" + ingredient.getName() + "' không active.");
            }
        }

        // 4. Build Recipe
        Recipe recipe = Recipe.builder()
                .menuItem(menuItem)
                .size(size)
                .notes(request.getNotes())
                .build();

        for (CreateRecipeRequest.RecipeItemRequest itemReq : request.getItems()) {
            RecipeItem recipeItem = RecipeItem.builder()
                    .recipe(recipe)
                    .ingredient(ingredientMap.get(itemReq.getIngredientId()))
                    .quantity(itemReq.getQuantity())
                    .build();
            recipe.getItems().add(recipeItem);
        }

        Recipe saved = recipeRepository.save(recipe);
        List<RecipeItem> savedItems = saved.getItems();

        log.info("Recipe created for '{}' size {} with {} ingredients",
                menuItem.getName(), size != null ? size : "ALL", savedItems.size());

        return recipeMapper.toResponse(saved, savedItems, ingredientMap);
    }

    @Override
    @Transactional
    public RecipeResponse updateRecipe(UUID id, UpdateRecipeRequest request) {

        Recipe recipe = recipeRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Công thức không tồn tại với ID: " + id));

        if (request.getNotes() != null) {
            recipe.setNotes(request.getNotes());
        }
        if (request.getIsActive() != null) {
            recipe.setActive(request.getIsActive());
        }

        // Replace items if provided
        Map<UUID, Ingredient> ingredientMap;
        if (request.getItems() != null && !request.getItems().isEmpty()) {

            // Validate no duplicate ingredients
            Set<UUID> ingredientIds = new HashSet<>();
            for (UpdateRecipeRequest.RecipeItemRequest item : request.getItems()) {
                if (!ingredientIds.add(item.getIngredientId())) {
                    throw new IllegalArgumentException("Trùng nguyên liệu trong công thức: " + item.getIngredientId());
                }
            }

            ingredientMap = ingredientRepository
                    .findAllByIdInAndIsDeletedFalse(ingredientIds)
                    .stream().collect(Collectors.toMap(Ingredient::getId, i -> i));

            for (UUID ingId : ingredientIds) {
                Ingredient ingredient = ingredientMap.get(ingId);
                if (ingredient == null) {
                    throw new ResourceNotFoundException("Nguyên liệu không tồn tại với ID: " + ingId);
                }
                if (!ingredient.isActive()) {
                    throw new IllegalArgumentException("Nguyên liệu '" + ingredient.getName() + "' không active.");
                }
            }

            // Clear old items and add new ones
            recipe.getItems().clear();
            for (UpdateRecipeRequest.RecipeItemRequest itemReq : request.getItems()) {
                RecipeItem recipeItem = RecipeItem.builder()
                        .recipe(recipe)
                        .ingredient(ingredientMap.get(itemReq.getIngredientId()))
                        .quantity(itemReq.getQuantity())
                        .build();
                recipe.getItems().add(recipeItem);
            }
        } else {
            // Build ingredient map from existing items
            Set<UUID> existingIngIds = recipe.getItems().stream()
                    .map(ri -> ri.getIngredient().getId())
                    .collect(Collectors.toSet());
            ingredientMap = ingredientRepository
                    .findAllByIdInAndIsDeletedFalse(existingIngIds)
                    .stream().collect(Collectors.toMap(Ingredient::getId, i -> i));
        }

        Recipe saved = recipeRepository.save(recipe);
        log.info("Recipe updated: {} for '{}'", saved.getId(), saved.getMenuItem().getName());

        return recipeMapper.toResponse(saved, saved.getItems(), ingredientMap);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipeResponse> getRecipesByMenuItemId(UUID menuItemId) {

        // Verify menu item exists
        menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Menu item không tồn tại với ID: " + menuItemId));

        List<Recipe> recipes = recipeRepository.findByMenuItemIdAndIsDeletedFalse(menuItemId);
        if (recipes.isEmpty()) {
            return List.of();
        }

        // Batch-fetch recipe items
        Set<UUID> recipeIds = recipes.stream().map(Recipe::getId).collect(Collectors.toSet());
        List<RecipeItem> allItems = recipeItemRepository.findByRecipeIdIn(recipeIds);
        Map<UUID, List<RecipeItem>> itemsByRecipeId = allItems.stream()
                .collect(Collectors.groupingBy(ri -> ri.getRecipe().getId()));

        // Batch-fetch ingredients
        Set<UUID> ingredientIds = allItems.stream()
                .map(ri -> ri.getIngredient().getId())
                .collect(Collectors.toSet());
        Map<UUID, Ingredient> ingredientMap = ingredientRepository
                .findAllByIdInAndIsDeletedFalse(ingredientIds)
                .stream().collect(Collectors.toMap(Ingredient::getId, i -> i));

        return recipes.stream()
                .map(recipe -> recipeMapper.toResponse(
                        recipe,
                        itemsByRecipeId.getOrDefault(recipe.getId(), List.of()),
                        ingredientMap))
                .toList();
    }
}
