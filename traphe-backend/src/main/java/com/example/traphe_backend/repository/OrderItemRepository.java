package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import com.example.traphe_backend.dto.response.report.TopProductResponse;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    @Query("SELECT new com.example.traphe_backend.dto.response.report.TopProductResponse(m.id, m.name, c.name, SUM(oi.quantity), SUM(oi.subtotal)) " +
           "FROM OrderItem oi " +
           "JOIN oi.menuItem m " +
           "LEFT JOIN m.category c " +
           "JOIN oi.order o " +
           "WHERE (cast(:branchId as uuid) IS NULL OR o.branch.id = :branchId) " +
           "AND o.createdAt >= :startDate AND o.createdAt <= :endDate " +
           "AND o.status != 'CANCELLED' AND o.status != 'FAILED' " +
           "GROUP BY m.id, m.name, c.name " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<TopProductResponse> findTopProducts(@Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate, @Param("branchId") UUID branchId, Pageable pageable);
    @Query("SELECT DISTINCT oi FROM OrderItem oi " +
           "JOIN FETCH oi.menuItem mi " +
           "LEFT JOIN FETCH oi.menuItemSize mis " +
           "LEFT JOIN FETCH oi.selectedToppings st " +
           "LEFT JOIN FETCH oi.selectedOptions so " +
           "JOIN oi.order o " +
           "WHERE (cast(:branchId as uuid) IS NULL OR o.branch.id = :branchId) " +
           "AND o.createdAt >= :startDate AND o.createdAt <= :endDate " +
           "AND o.status != 'CANCELLED' AND o.status != 'FAILED' AND o.isDeleted = false")
    List<OrderItem> findAllByDateRangeAndBranch(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("branchId") UUID branchId);

    @Query("SELECT COUNT(oi) FROM OrderItem oi JOIN oi.order o WHERE oi.menuItem.id = :menuItemId AND o.status IN :statuses")
    long countByMenuItemIdAndOrderStatusIn(@Param("menuItemId") UUID menuItemId, @Param("statuses") List<com.example.traphe_backend.enums.OrderStatus> statuses);
}
