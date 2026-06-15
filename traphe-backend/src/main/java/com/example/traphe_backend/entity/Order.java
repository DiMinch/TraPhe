package com.example.traphe_backend.entity;

import com.example.traphe_backend.enums.OrderStatus;
import com.example.traphe_backend.enums.OrderType;
import com.example.traphe_backend.enums.PaymentMethod;
import com.example.traphe_backend.enums.PaymentStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import org.hibernate.annotations.BatchSize;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders",
       indexes = {
           @jakarta.persistence.Index(name = "idx_orders_branch_status_created",
                  columnList = "branch_id, status, created_at DESC, is_deleted"),
           @jakarta.persistence.Index(name = "idx_orders_customer_created",
                  columnList = "customer_id, created_at DESC, is_deleted"),
           @jakarta.persistence.Index(name = "idx_orders_deleted_created",
                  columnList = "is_deleted, created_at DESC")
       })
public class Order extends BaseEntity {

    @Column(name = "order_number", nullable = false, length = 50, unique = true)
    private String orderNumber;

    // customer_id references users table — nullable for anonymous POS orders
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false, length = 20)
    private OrderType orderType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    // Only used for DRINK_DELIVERY
    @Column(name = "delivery_address_id")
    private UUID deliveryAddressId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "brewing_status", nullable = false, length = 20)
    @Builder.Default
    private com.example.traphe_backend.enums.BrewingStatus brewingStatus = com.example.traphe_backend.enums.BrewingStatus.WAITING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 20)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "total_discount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalDiscount = BigDecimal.ZERO;

    @Column(name = "shipping_fee", precision = 12, scale = 2)
    private BigDecimal shippingFee;

    @Column(name = "final_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal finalAmount = BigDecimal.ZERO;

    @Column(name = "loyalty_points_used")
    @Builder.Default
    private Integer loyaltyPointsUsed = 0;

    public Integer getLoyaltyPointsUsed() {
        return loyaltyPointsUsed == null ? 0 : loyaltyPointsUsed;
    }

    @Column(name = "estimated_ready_time")
    private LocalDateTime estimatedReadyTime;

    @Column(name = "combined_checkout_id")
    private UUID combinedCheckoutId;

    // Tier snapshot fields
    @Column(name = "tier_name", length = 50)
    private String tierName;

    @Column(name = "tier_discount_rate", precision = 5, scale = 2)
    private BigDecimal tierDiscountRate;

    @Column(name = "tier_discount_amount", precision = 15, scale = 2)
    private BigDecimal tierDiscountAmount;

    @Column(name = "point_rate_snapshot", precision = 10, scale = 2)
    private BigDecimal pointRateSnapshot;

    @Column(name = "point_discount_amount", precision = 15, scale = 2)
    private BigDecimal pointDiscountAmount;

    @Column(name = "is_deleted", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean isDeleted = false;

    @BatchSize(size = 30)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
}
