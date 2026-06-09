package com.example.traphe_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MerchandiseOrderResponse {

    private UUID orderId;
    private String orderNumber;
    private String status;
    private BigDecimal subtotal;
    private BigDecimal finalAmount;
}
