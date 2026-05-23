package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.PurchaseOrder;
import com.example.traphe_backend.enums.PurchaseOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID> {

    @Query("SELECT po FROM PurchaseOrder po WHERE po.isDeleted = false " +
           "AND (:supplierId IS NULL OR po.supplier.id = :supplierId) " +
           "AND (:status IS NULL OR po.status = :status) " +
           "ORDER BY po.createdAt DESC")
    Page<PurchaseOrder> findByFilters(
            @Param("supplierId") UUID supplierId,
            @Param("status") PurchaseOrderStatus status,
            Pageable pageable);

    Optional<PurchaseOrder> findByIdAndIsDeletedFalse(UUID id);

    List<PurchaseOrder> findBySupplierIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID supplierId);

    @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE po.isDeleted = false AND po.status = :status")
    long countByStatus(@Param("status") PurchaseOrderStatus status);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(po.poNumber, 4) AS int)), 0) FROM PurchaseOrder po")
    int findMaxPoNumberSequence();
}
