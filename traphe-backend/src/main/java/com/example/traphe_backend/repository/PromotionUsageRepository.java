package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.PromotionUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PromotionUsageRepository extends JpaRepository<PromotionUsage, UUID> {

    /** Đếm số lần 1 user đã sử dụng 1 promotion */
    long countByPromotionIdAndUserId(UUID promotionId, UUID userId);
}
