package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.MembershipTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MembershipTierRepository extends JpaRepository<MembershipTier, UUID> {

    List<MembershipTier> findByIsActiveTrueAndIsDeletedFalseOrderByTierLevelAsc();

    List<MembershipTier> findByIsDeletedFalseOrderByTierLevelAsc();

    /**
     * Tìm hạng cao nhất mà user đủ điều kiện dựa trên tổng chi tiêu.
     * Trả về hạng có minSpending <= totalSpending, sắp xếp theo tierLevel giảm dần, lấy 1 kết quả.
     */
    Optional<MembershipTier> findFirstByIsActiveTrueAndIsDeletedFalseAndMinSpendingLessThanEqualOrderByTierLevelDesc(
            BigDecimal totalSpending);

    Optional<MembershipTier> findByNameAndIsDeletedFalse(String name);
}
