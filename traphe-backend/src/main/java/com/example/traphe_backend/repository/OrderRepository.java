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
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByBranchIdAndStatusNotAndBrewingStatusNotOrderByCreatedAtAsc(UUID branchId, OrderStatus status, BrewingStatus brewingStatus);

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate AND (cast(:branchId as uuid) IS NULL OR o.branch.id = :branchId) AND o.status != 'CANCELLED' AND o.status != 'FAILED'")
    BigDecimal sumRevenueByDateRangeAndBranch(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("branchId") UUID branchId);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items LEFT JOIN FETCH o.branch WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate AND (cast(:branchId as uuid) IS NULL OR o.branch.id = :branchId) AND o.status != 'CANCELLED' AND o.status != 'FAILED' AND o.isDeleted = false")
    List<Order> findAllByDateRangeAndBranch(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("branchId") UUID branchId);

    @Query("SELECT o FROM Order o JOIN FETCH o.branch WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate AND (cast(:branchId as uuid) IS NULL OR o.branch.id = :branchId) AND o.status != 'CANCELLED' AND o.status != 'FAILED' AND o.isDeleted = false")
    List<Order> findAllWithBranchByDateRangeAndBranch(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("branchId") UUID branchId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate AND (cast(:branchId as uuid) IS NULL OR o.branch.id = :branchId) AND o.status != 'CANCELLED' AND o.status != 'FAILED' AND o.isDeleted = false")
    long countOrdersByDateRangeAndBranch(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("branchId") UUID branchId);

    @Query("SELECT o FROM Order o WHERE o.isDeleted = false AND o.status IN :statuses AND (cast(:branchId as uuid) IS NULL OR o.branch.id = :branchId)")
    List<Order> findAllByBranchAndStatuses(@Param("branchId") UUID branchId, @Param("statuses") List<OrderStatus> statuses);

    @Query(value = "SELECT DISTINCT o.branch_id FROM orders o " +
           "WHERE o.created_at >= :startDate AND o.created_at <= :endDate " +
           "AND o.branch_id IS NOT NULL " +
           "AND o.status NOT IN ('CANCELLED', 'FAILED') AND o.is_deleted = false", nativeQuery = true)
    List<UUID> findActiveBranchIdsNative(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT CAST(o.created_at AS date) AS date, SUM(i.quantity) AS volume " +
           "FROM orders o JOIN order_items i ON o.id = i.order_id " +
           "WHERE o.created_at >= :startDate AND o.created_at <= :endDate " +
           "AND o.branch_id = :branchId " +
           "AND o.status NOT IN ('CANCELLED', 'FAILED') AND o.is_deleted = false " +
           "GROUP BY CAST(o.created_at AS date)", nativeQuery = true)
    List<Object[]> findDailyVolumeByDateRangeAndBranchNative(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("branchId") UUID branchId);

    // ========== Order Query APIs ==========

    /** Tìm đơn hàng chưa soft-delete theo ID */
    @EntityGraph(attributePaths = {"branch", "customer"})
    Optional<Order> findByIdAndIsDeletedFalse(UUID id);

    /** Dùng để khoá dòng Order khi xử lý thanh toán (Pessimistic Lock) */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :id AND o.isDeleted = false")
    Optional<Order> findByIdForUpdate(@Param("id") UUID id);

    /** Danh sách đơn hàng của 1 khách hàng (phân trang) */
    @EntityGraph(attributePaths = {"branch", "customer"})
    Page<Order> findByCustomerIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID customerId, Pageable pageable);


    /** Danh sách đơn hàng cho Admin (lọc theo trạng thái, chi nhánh) */
    @EntityGraph(attributePaths = {"branch", "customer"})
    @Query("SELECT o FROM Order o WHERE o.isDeleted = false " +
           "AND (:status IS NULL OR o.status = :status) " +
           "AND (:branchId IS NULL OR o.branch.id = :branchId) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findAllWithFilters(
            @Param("status") OrderStatus status,
            @Param("branchId") UUID branchId,
            Pageable pageable);

    @Query("""
        SELECT new com.example.traphe_backend.dto.response.OrderSummaryResponse(
            o.id, o.orderNumber, CAST(o.orderType AS string), CAST(o.status AS string), CAST(o.brewingStatus AS string),
            CAST(o.paymentMethod AS string), CAST(o.paymentStatus AS string),
            o.finalAmount, SIZE(o.items), b.name, c.fullName, o.createdAt
        )
        FROM Order o
        LEFT JOIN o.branch b
        LEFT JOIN o.customer c
        WHERE o.isDeleted = false
          AND (:status IS NULL OR o.status = :status)
          AND (:branchId IS NULL OR b.id = :branchId)
        ORDER BY o.createdAt DESC
        """)
    Page<com.example.traphe_backend.dto.response.OrderSummaryResponse> findSummariesWithFilters(
            @Param("status") OrderStatus status,
            @Param("branchId") UUID branchId,
            Pageable pageable);

    @Query("""
        SELECT new com.example.traphe_backend.dto.response.OrderSummaryResponse(
            o.id, o.orderNumber, CAST(o.orderType AS string), CAST(o.status AS string), CAST(o.brewingStatus AS string),
            CAST(o.paymentMethod AS string), CAST(o.paymentStatus AS string),
            o.finalAmount, SIZE(o.items), b.name, c.fullName, o.createdAt
        )
        FROM Order o
        LEFT JOIN o.branch b
        LEFT JOIN o.customer c
        WHERE o.isDeleted = false
          AND o.customer.id = :customerId
        ORDER BY o.createdAt DESC
        """)
    Page<com.example.traphe_backend.dto.response.OrderSummaryResponse> findSummariesByCustomerId(
            @Param("customerId") UUID customerId,
            Pageable pageable);
}

