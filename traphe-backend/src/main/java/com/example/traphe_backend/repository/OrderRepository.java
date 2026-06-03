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
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByBranchIdAndStatusNotAndBrewingStatusNotOrderByCreatedAtAsc(UUID branchId, OrderStatus status, BrewingStatus brewingStatus);

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate AND (cast(:branchId as uuid) IS NULL OR o.branch.id = :branchId) AND o.status != 'CANCELLED' AND o.status != 'FAILED'")
    BigDecimal sumRevenueByDateRangeAndBranch(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("branchId") UUID branchId);

    @Query("SELECT o FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate AND (cast(:branchId as uuid) IS NULL OR o.branch.id = :branchId) AND o.status != 'CANCELLED' AND o.status != 'FAILED' AND o.isDeleted = false")
    List<Order> findAllByDateRangeAndBranch(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("branchId") UUID branchId);

    @Query("SELECT o FROM Order o JOIN FETCH o.branch WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate AND (cast(:branchId as uuid) IS NULL OR o.branch.id = :branchId) AND o.status != 'CANCELLED' AND o.status != 'FAILED' AND o.isDeleted = false")
    List<Order> findAllWithBranchByDateRangeAndBranch(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("branchId") UUID branchId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate AND (cast(:branchId as uuid) IS NULL OR o.branch.id = :branchId) AND o.status != 'CANCELLED' AND o.status != 'FAILED' AND o.isDeleted = false")
    long countOrdersByDateRangeAndBranch(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("branchId") UUID branchId);

    @Query("SELECT o FROM Order o WHERE o.isDeleted = false AND o.status IN :statuses AND (cast(:branchId as uuid) IS NULL OR o.branch.id = :branchId)")
    List<Order> findAllByBranchAndStatuses(@Param("branchId") UUID branchId, @Param("statuses") List<OrderStatus> statuses);

    // ========== Order Query APIs ==========

    /** Tìm đơn hàng chưa soft-delete theo ID */
    Optional<Order> findByIdAndIsDeletedFalse(UUID id);

    /** Dùng để khoá dòng Order khi xử lý thanh toán (Pessimistic Lock) */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :id AND o.isDeleted = false")
    Optional<Order> findByIdForUpdate(@Param("id") UUID id);

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

