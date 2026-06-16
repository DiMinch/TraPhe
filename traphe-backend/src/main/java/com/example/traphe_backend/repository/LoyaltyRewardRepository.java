package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.LoyaltyReward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LoyaltyRewardRepository extends JpaRepository<LoyaltyReward, UUID> {
    List<LoyaltyReward> findAllByIsDeletedFalseAndIsActiveTrue();
}
