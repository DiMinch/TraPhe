package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.LoyaltyPointTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LoyaltyPointTransactionRepository extends JpaRepository<LoyaltyPointTransaction, UUID> {
    List<LoyaltyPointTransaction> findByUserId(UUID userId);
    List<LoyaltyPointTransaction> findByOrderId(UUID orderId);
}
