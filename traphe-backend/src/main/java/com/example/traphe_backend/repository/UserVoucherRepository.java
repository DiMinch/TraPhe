package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.UserVoucher;
import com.example.traphe_backend.enums.UserVoucherStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserVoucherRepository extends JpaRepository<UserVoucher, UUID> {

    /** Lấy tất cả voucher của 1 user, sắp xếp mới nhất trước */
    List<UserVoucher> findByUserIdOrderByAssignedAtDesc(UUID userId);

    /** Lấy voucher của user theo trạng thái */
    List<UserVoucher> findByUserIdAndStatusOrderByAssignedAtDesc(UUID userId, UserVoucherStatus status);

    /** Tìm voucher theo user + promotion (kiểm tra trùng) */
    Optional<UserVoucher> findByUserIdAndPromotionId(UUID userId, UUID promotionId);

    /** Kiểm tra user đã có voucher này chưa */
    boolean existsByUserIdAndPromotionId(UUID userId, UUID promotionId);
}
