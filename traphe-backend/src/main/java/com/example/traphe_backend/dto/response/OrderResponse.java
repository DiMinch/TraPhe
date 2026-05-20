package com.example.traphe_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private UUID orderId;
    private String orderNumber;
    private String orderType;
    private String status;
    private String brewingStatus;
    private String paymentMethod;
    private String paymentStatus;

    // Pricing
    private BigDecimal subtotal;
    private BigDecimal totalDiscount;
    private BigDecimal shippingFee;
    private BigDecimal finalAmount;
    private int loyaltyPointsUsed;

    // Branch info
    private UUID branchId;
    private String branchName;

    // Customer info (nullable for anonymous POS orders)
    private UUID customerId;
    private String customerName;
    private String customerPhone;

    // Timing
    private LocalDateTime estimatedReadyTime;
    private LocalDateTime createdAt;

    // Items
    private List<OrderItemDetail> items;

    private String paymentUrl; // Placeholder for payment integration

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDetail {
        private UUID id;
        private String menuItemName;
        private String sizeName;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
        private String notes;
        private List<String> options;
        private List<String> toppings;
    }
}

