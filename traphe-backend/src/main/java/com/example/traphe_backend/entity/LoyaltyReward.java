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

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "loyalty_rewards")
public class LoyaltyReward extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Integer points;

    @Column(length = 500)
    private String description;

    @Column(length = 50)
    private String category; // e.g. "drink", "voucher", "merchandise"

    @Column(name = "discount_value", precision = 12, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "discount_type", length = 20)
    private String discountType; // "FIXED_AMOUNT" or "PERCENTAGE"

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;
}
