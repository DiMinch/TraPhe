package com.example.traphe_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "loyalty_points")
public class LoyaltyPoint extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "points_available", nullable = false)
    @Builder.Default
    private int pointsAvailable = 0;

    /** Tổng chi tiêu tích luỹ (VND) — dùng để xếp hạng thành viên */
    @Column(name = "total_spending", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalSpending = BigDecimal.ZERO;

    /** Hạng thành viên hiện tại */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_tier_id")
    private MembershipTier membershipTier;
}

