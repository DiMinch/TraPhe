package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CheckoutRequest {

    // At least one must be provided
    private UUID drinkOrderId;
    private UUID merchandiseOrderId;

    @NotNull(message = "Payment method is required")
    private String paymentMethod; // VNPAY, MOMO, CASH, QR

    private String voucherCode;    // Placeholder for promotion system
    private int pointsUsed;        // Placeholder for loyalty system
}
