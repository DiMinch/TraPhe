package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.IngredientStock;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IngredientStockRepository extends JpaRepository<IngredientStock, UUID> {

    List<IngredientStock> findByBranchId(UUID branchId);

    Optional<IngredientStock> findByBranchIdAndIngredientId(UUID branchId, UUID ingredientId);

    List<IngredientStock> findByBranchIdAndIngredientIdIn(UUID branchId, Collection<UUID> ingredientIds);

    /**
     * PESSIMISTIC_WRITE lock for stock deduction — prevents concurrent modifications.
     * Critical for race condition prevention when multiple orders complete simultaneously.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM IngredientStock s WHERE s.branch.id = :branchId AND s.ingredient.id IN :ingredientIds")
    List<IngredientStock> findByBranchIdAndIngredientIdsForUpdate(
            @Param("branchId") UUID branchId,
            @Param("ingredientIds") Collection<UUID> ingredientIds);

    /**
     * Low stock filter: quantity_available < ingredient.min_stock_alert.
     */
    @Query("SELECT s FROM IngredientStock s JOIN s.ingredient i " +
            "WHERE s.branch.id = :branchId AND i.minStockAlert IS NOT NULL " +
            "AND s.quantityAvailable < i.minStockAlert AND i.isDeleted = false")
    List<IngredientStock> findLowStockByBranchId(@Param("branchId") UUID branchId);

    @Query("SELECT s FROM IngredientStock s JOIN s.ingredient i " +
            "WHERE i.minStockAlert IS NOT NULL " +
            "AND s.quantityAvailable < i.minStockAlert AND i.isDeleted = false")
    List<IngredientStock> findAllLowStock();
}
