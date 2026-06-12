package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.LoyaltyPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoyaltyPointRepository extends JpaRepository<LoyaltyPoint, UUID> {
    Optional<LoyaltyPoint> findByUserId(UUID userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT lp FROM LoyaltyPoint lp WHERE lp.user.id = :userId")
    Optional<LoyaltyPoint> findByUserIdForUpdate(@Param("userId") UUID userId);

    @Query("SELECT COALESCE(lp.membershipTier.name, 'Unknown'), COUNT(lp) FROM LoyaltyPoint lp GROUP BY lp.membershipTier.name")
    java.util.List<Object[]> countMembersPerTier();
}
