package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Type-safe DTO for the client checkout "compatible" order endpoint.
 * Replaces the previous Map<String, Object> payload.
 *
 * Maps the FE CreateOrderRequest interface:
 *   { items, orderType, paymentMethod, branchId, addressId, voucherCode, loyaltyPointsToUse, ... }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCompatibleOrderRequest {

    private UUID branchId;

    @NotEmpty(message = "Đơn hàng phải có ít nhất 1 sản phẩm")
    private List<CompatibleOrderItem> items;

    /** OFFLINE, ONLINE_COD, ONLINE_TRANSFER → mapped to DRINK_PICKUP / DRINK_DELIVERY */
    private String orderType;

    /** CASH, VNPAY, MOMO, QR */
    private String paymentMethod;

    /** Customer ID (optional — for POS walk-in) */
    private UUID customerId;

    /** Address selection for delivery */
    private UUID addressId;

    /** Shipping address string (alternative to addressId) */
    private String shippingAddress;

    /** Voucher / promotion code */
    private String voucherCode;

    /** Alias for voucherCode (legacy FE compat) */
    private String promotionCode;

    /** Loyalty points to redeem */
    private Integer loyaltyPointsToUse;

    /** Guest info (POS anonymous orders) */
    private String guestName;
    private String guestPhone;
    private String guestEmail;

    // ---- Nested item ----

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompatibleOrderItem {

        @NotNull(message = "productVariantId là bắt buộc")
        private String productVariantId;

        @Min(value = 1, message = "Số lượng phải >= 1")
        private int quantity = 1;

        private BigDecimal unitPrice;
        private BigDecimal discount;
        private String notes;

        private List<CompatibleOrderItemOption> options;
        private List<CompatibleOrderItemTopping> toppings;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompatibleOrderItemOption {
        @NotNull private String optionGroupId;
        @NotNull private String optionValueId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompatibleOrderItemTopping {
        @NotNull private String toppingId;
        private int quantity = 1;
    }
}
