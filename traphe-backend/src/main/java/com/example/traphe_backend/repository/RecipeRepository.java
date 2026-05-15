package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecipeRepository extends JpaRepository<Recipe, UUID> {

    Optional<Recipe> findByIdAndIsDeletedFalse(UUID id);

    /**
     * Find recipe for a specific menu item + size combo.
     */
    Optional<Recipe> findByMenuItemIdAndSizeAndIsDeletedFalse(UUID menuItemId, String size);

    /**
     * Find the "general" recipe where size is NULL.
     */
    Optional<Recipe> findByMenuItemIdAndSizeIsNullAndIsDeletedFalse(UUID menuItemId);

    /**
     * Check uniqueness: (menu_item_id, size).
     */
    boolean existsByMenuItemIdAndSizeAndIsDeletedFalse(UUID menuItemId, String size);

    boolean existsByMenuItemIdAndSizeIsNullAndIsDeletedFalse(UUID menuItemId);

    /**
     * All recipes for a given menu item (all sizes).
     */
    List<Recipe> findByMenuItemIdAndIsDeletedFalse(UUID menuItemId);

    /**
     * Batch-fetch active recipes by menu item IDs — used in InventoryDeductionService.
     */
    @Query("SELECT r FROM Recipe r WHERE r.menuItem.id IN :menuItemIds AND r.isActive = true AND r.isDeleted = false")
    List<Recipe> findActiveByMenuItemIdIn(@Param("menuItemIds") Collection<UUID> menuItemIds);
}
