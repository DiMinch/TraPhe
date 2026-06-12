package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.LoyaltyPointTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.traphe_backend.enums.LoyaltyTransactionType;

@Repository
public interface LoyaltyPointTransactionRepository extends JpaRepository<LoyaltyPointTransaction, UUID> {
    List<LoyaltyPointTransaction> findByUserId(UUID userId);
    List<LoyaltyPointTransaction> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<LoyaltyPointTransaction> findByOrderId(UUID orderId);

    @Query("SELECT COALESCE(SUM(lpt.points), 0) FROM LoyaltyPointTransaction lpt WHERE lpt.type = :type")
    Long sumPointsByType(@Param("type") LoyaltyTransactionType type);

    @Query("SELECT COALESCE(SUM(lpt.points), 0) FROM LoyaltyPointTransaction lpt WHERE lpt.user.id = :userId AND lpt.type = :type")
    Long sumPointsByUserIdAndType(@Param("userId") UUID userId, @Param("type") LoyaltyTransactionType type);

    @Query("SELECT COUNT(DISTINCT lpt.user.id) FROM LoyaltyPointTransaction lpt")
    long countActiveLoyaltyUsers();
}
