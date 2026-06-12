package com.example.traphe_backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
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
public class CreatePurchaseOrderRequest {

    @NotNull(message = "supplierId không được trống")
    private UUID supplierId;

    private UUID branchId;

    private LocalDate expectedDeliveryDate;

    private String note;

    @NotEmpty(message = "Danh sách nguyên liệu đặt hàng không được trống")
    @Valid
    private List<PurchaseOrderItemRequest> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseOrderItemRequest {

        @NotNull(message = "ingredientId không được trống")
        private UUID ingredientId;

        @NotNull(message = "quantityOrdered không được trống")
        @DecimalMin(value = "0.001", message = "Số lượng phải > 0")
        private BigDecimal quantityOrdered;

        @NotNull(message = "unitPrice không được trống")
        @DecimalMin(value = "0", message = "Đơn giá phải >= 0")
        private BigDecimal unitPrice;
    }
}
