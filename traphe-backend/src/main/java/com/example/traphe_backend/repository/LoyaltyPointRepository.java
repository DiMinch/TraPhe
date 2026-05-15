package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.LoyaltyPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoyaltyPointRepository extends JpaRepository<LoyaltyPoint, UUID> {
    Optional<LoyaltyPoint> findByUserId(UUID userId);
}
