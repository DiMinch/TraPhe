package com.example.traphe_backend.entity;

import com.example.traphe_backend.enums.UserVoucherStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Bảng liên kết user – voucher (many-to-many).
 * Một user có thể sở hữu nhiều voucher, một voucher (batch) có thể được gán cho nhiều user.
 * Dùng để:
 * - Lưu voucher được tặng qua Loyalty, Event, Admin batch.
 * - Tra cứu "Ví voucher của tôi" (My Vouchers).
 * - Theo dõi trạng thái: AVAILABLE → USED / EXPIRED.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_vouchers",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"user_id", "promotion_id"},
                name = "uq_user_voucher"
        ))
public class UserVoucher extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "promotion_id", nullable = false)
    private Promotion promotion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private UserVoucherStatus status = UserVoucherStatus.AVAILABLE;

    /** Nguồn gốc voucher: "LOYALTY_REDEEM", "ADMIN_BATCH", "EVENT", ... */
    @Column(name = "source", length = 50)
    private String source;

    /** Ngày gán voucher cho user */
    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    /** Ngày sử dụng (nếu đã dùng) */
    @Column(name = "used_at")
    private LocalDateTime usedAt;
}
