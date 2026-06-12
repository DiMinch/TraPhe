package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.PromotionUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PromotionUsageRepository extends JpaRepository<PromotionUsage, UUID> {

    /** Đếm số lần 1 user đã sử dụng 1 promotion */
    long countByPromotionIdAndUserId(UUID promotionId, UUID userId);

    /** Kiểm tra xem đơn hàng đã được áp dụng promotion chưa */
    boolean existsByOrderId(UUID orderId);

    /** Lấy thông tin sử dụng promotion của đơn hàng */
    Optional<PromotionUsage> findByOrderId(UUID orderId);
}
