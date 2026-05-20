package com.example.traphe_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Chương trình khuyến mãi / Voucher.
 * Hỗ trợ 2 loại giảm giá: PERCENTAGE (%) và FIXED_AMOUNT (VND).
 * Hỗ trợ 2 phạm vi: ORDER (toàn đơn) và PRODUCT (sản phẩm cụ thể — mở rộng sau).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "promotions")
public class Promotion extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    private DiscountType discountType;

    /**
     * Giá trị giảm giá.
     * Nếu PERCENTAGE: đây là phần trăm (ví dụ 10.00 = 10%).
     * Nếu FIXED_AMOUNT: đây là số tiền VND.
     */
    @Column(name = "discount_value", nullable = false, precision = 15, scale = 2)
    private BigDecimal discountValue;

    /** Giá trị đơn hàng tối thiểu để áp dụng */
    @Column(name = "min_order_value", precision = 15, scale = 2)
    private BigDecimal minOrderValue;

    /** Giá trị giảm giá tối đa (chỉ áp dụng cho PERCENTAGE) */
    @Column(name = "max_discount_amount", precision = 15, scale = 2)
    private BigDecimal maxDiscountAmount;

    /** Tổng số lượt sử dụng tối đa (null = không giới hạn) */
    @Column(name = "usage_limit")
    private Integer usageLimit;

    /** Số lượt đã sử dụng */
    @Column(name = "usage_count", nullable = false)
    @Builder.Default
    private int usageCount = 0;

    /** Mỗi user được dùng tối đa bao nhiêu lần (null = 1) */
    @Column(name = "per_user_limit")
    @Builder.Default
    private int perUserLimit = 1;

    /** Ngày bắt đầu hiệu lực */
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    /** Ngày hết hiệu lực */
    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    /** Trạng thái hoạt động */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    public enum DiscountType {
        PERCENTAGE,
        FIXED_AMOUNT
    }
}
