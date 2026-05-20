package com.example.traphe_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Hạng thành viên khách hàng.
 * Ví dụ: Bronze, Silver, Gold, Platinum.
 * Mỗi hạng có ngưỡng chi tiêu tối thiểu, hệ số tích điểm, và tỷ lệ giảm giá.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "membership_tiers")
public class MembershipTier extends BaseEntity {

    /** Tên hạng (Bronze, Silver, Gold, Platinum) */
    @Column(nullable = false, unique = true, length = 50)
    private String name;

    /** Thứ tự sắp xếp (hạng cao hơn = số lớn hơn) */
    @Column(name = "tier_level", nullable = false)
    private int tierLevel;

    /** Mức chi tiêu tích luỹ tối thiểu để đạt hạng này (VND) */
    @Column(name = "min_spending", nullable = false, precision = 15, scale = 2)
    private BigDecimal minSpending;

    /**
     * Hệ số tích điểm (point per 1,000 VND chi tiêu).
     * Ví dụ: 1.0 = 1 điểm / 1,000 VND, 1.5 = 1.5 điểm / 1,000 VND.
     */
    @Column(name = "point_earning_rate", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal pointEarningRate = BigDecimal.ONE;

    /**
     * Tỷ lệ giảm giá trực tiếp trên đơn hàng (0–100%).
     * Ví dụ: 5.00 = giảm 5% tổng đơn.
     */
    @Column(name = "discount_rate", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountRate = BigDecimal.ZERO;

    /** Hạng có đang hoạt động hay không */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    /** Mô tả quyền lợi */
    @Column(length = 500)
    private String description;
}
