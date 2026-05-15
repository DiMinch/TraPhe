package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.RecipeItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface RecipeItemRepository extends JpaRepository<RecipeItem, UUID> {

    List<RecipeItem> findByRecipeId(UUID recipeId);

    /**
     * Batch-fetch recipe items for multiple recipes — N+1 fix for deduction.
     */
    List<RecipeItem> findByRecipeIdIn(Collection<UUID> recipeIds);

    void deleteByRecipeId(UUID recipeId);
}
