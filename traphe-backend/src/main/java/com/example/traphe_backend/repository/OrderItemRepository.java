package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;
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
}
