package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

import com.example.traphe_backend.enums.BrewingStatus;
import com.example.traphe_backend.enums.OrderStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByBranchIdAndStatusNotAndBrewingStatusNotOrderByCreatedAtAsc(UUID branchId, OrderStatus status, BrewingStatus brewingStatus);

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate AND (cast(:branchId as uuid) IS NULL OR o.branch.id = :branchId) AND o.status != 'CANCELLED' AND o.status != 'FAILED'")
    BigDecimal sumRevenueByDateRangeAndBranch(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("branchId") UUID branchId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate AND (cast(:branchId as uuid) IS NULL OR o.branch.id = :branchId) AND o.status != 'CANCELLED' AND o.status != 'FAILED'")
    long countOrdersByDateRangeAndBranch(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("branchId") UUID branchId);

    // ========== Order Query APIs ==========

    /** Tìm đơn hàng chưa soft-delete theo ID */
    Optional<Order> findByIdAndIsDeletedFalse(UUID id);

    /** Danh sách đơn hàng của 1 khách hàng (phân trang) */
    Page<Order> findByCustomerIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID customerId, Pageable pageable);

    /** Danh sách đơn hàng cho Admin (lọc theo trạng thái, chi nhánh) */
    @Query("SELECT o FROM Order o WHERE o.isDeleted = false " +
           "AND (:status IS NULL OR o.status = :status) " +
           "AND (:branchId IS NULL OR o.branch.id = :branchId) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findAllWithFilters(
            @Param("status") OrderStatus status,
            @Param("branchId") UUID branchId,
            Pageable pageable);
}

