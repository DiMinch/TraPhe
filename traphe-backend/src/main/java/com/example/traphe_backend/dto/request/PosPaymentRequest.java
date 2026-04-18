package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PosPaymentRequest {
    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // CASH, VN_PAY, etc.
}
