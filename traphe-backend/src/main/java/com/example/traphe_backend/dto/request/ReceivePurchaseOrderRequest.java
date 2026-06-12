package com.example.traphe_backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceivePurchaseOrderRequest {

    private LocalDate actualDeliveryDate;

    @Valid
    private List<ReceiveItem> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReceiveItem {

        @NotNull(message = "ingredientId không được trống")
        private UUID ingredientId;

        @NotNull(message = "quantityReceived không được trống")
        @DecimalMin(value = "0.001", message = "Số lượng nhận phải > 0")
        private BigDecimal quantityReceived;
    }
}
