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

    @Query("SELECT po.poNumber FROM PurchaseOrder po WHERE po.poNumber LIKE 'PO-%'")
    List<String> findAllPoNumbers();

    default int findMaxPoNumberSequence() {
        return findAllPoNumbers().stream()
                .map(poNum -> {
                    if (poNum != null && poNum.startsWith("PO-")) {
                        try {
                            String seqStr = poNum.substring(3);
                            String digits = seqStr.replaceAll("[^0-9]", "");
                            return digits.isEmpty() ? 0 : Integer.parseInt(digits);
                        } catch (NumberFormatException e) {
                            return 0;
                        }
                    }
                    return 0;
                })
                .max(Integer::compare)
                .orElse(0);
    }
}
