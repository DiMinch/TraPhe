package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.StockTransaction;
import com.example.traphe_backend.enums.StockTransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, UUID> {

    Page<StockTransaction> findByBranchIdOrderByCreatedAtDesc(UUID branchId, Pageable pageable);

    Page<StockTransaction> findByBranchIdAndIngredientIdOrderByCreatedAtDesc(
            UUID branchId, UUID ingredientId, Pageable pageable);

    Page<StockTransaction> findByBranchIdAndTypeOrderByCreatedAtDesc(
            UUID branchId, StockTransactionType type, Pageable pageable);

    @Query("SELECT st FROM StockTransaction st WHERE st.branch.id = :branchId " +
           "AND (:ingredientId IS NULL OR st.ingredient.id = :ingredientId) " +
           "AND (:type IS NULL OR st.type = :type) " +
           "AND (:startDate IS NULL OR st.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR st.createdAt <= :endDate) " +
           "ORDER BY st.createdAt DESC")
    Page<StockTransaction> findByFilters(
            @Param("branchId") UUID branchId,
            @Param("ingredientId") UUID ingredientId,
            @Param("type") StockTransactionType type,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);
}
