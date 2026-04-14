package com.example.traphe_backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreateDrinkOrderRequest {

    @NotNull(message = "Branch ID is required")
    private UUID branchId;

    @NotNull(message = "Order type is required")
    private String orderType; // DRINK_PICKUP or DRINK_DELIVERY

    private UUID deliveryAddressId; // Only for DRINK_DELIVERY

    @NotEmpty(message = "Order must have at least one item")
    @Valid
    private List<OrderItemRequest> items;

    private String voucherCode;
    private int loyaltyPointsUsed;
    private String paymentMethod; // VNPAY, MOMO, CASH, QR
}
