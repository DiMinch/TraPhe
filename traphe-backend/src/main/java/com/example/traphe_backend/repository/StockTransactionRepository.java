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

    @Query(value = "SELECT st.* FROM ingredient_stock_transactions st WHERE " +
           "(CAST(:branchId AS uuid) IS NULL OR st.branch_id = :branchId) " +
           "AND (CAST(:ingredientId AS uuid) IS NULL OR st.ingredient_id = :ingredientId) " +
           "AND (CAST(:type AS varchar) IS NULL OR st.type = :type) " +
           "AND (CAST(:referenceId AS uuid) IS NULL OR st.reference_id = :referenceId) " +
           "AND (CAST(:startDate AS timestamp) IS NULL OR st.created_at >= :startDate) " +
           "AND (CAST(:endDate AS timestamp) IS NULL OR st.created_at <= :endDate) " +
           "ORDER BY st.created_at DESC",
           countQuery = "SELECT count(*) FROM ingredient_stock_transactions st WHERE " +
           "(CAST(:branchId AS uuid) IS NULL OR st.branch_id = :branchId) " +
           "AND (CAST(:ingredientId AS uuid) IS NULL OR st.ingredient_id = :ingredientId) " +
           "AND (CAST(:type AS varchar) IS NULL OR st.type = :type) " +
           "AND (CAST(:referenceId AS uuid) IS NULL OR st.reference_id = :referenceId) " +
           "AND (CAST(:startDate AS timestamp) IS NULL OR st.created_at >= :startDate) " +
           "AND (CAST(:endDate AS timestamp) IS NULL OR st.created_at <= :endDate)",
           nativeQuery = true)
    Page<StockTransaction> findByFilters(
            @Param("branchId") UUID branchId,
            @Param("ingredientId") UUID ingredientId,
            @Param("type") String type,
            @Param("referenceId") UUID referenceId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);
}
