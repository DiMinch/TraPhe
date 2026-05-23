package com.example.traphe_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderResponse {
    private UUID id;
    private String poNumber;
    private SupplierInfo supplier;
    private String status;
    private BigDecimal totalAmount;
    private LocalDate expectedDeliveryDate;
    private LocalDate actualDeliveryDate;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PurchaseOrderItemResponse> items;
    private String createdBy;
    private String updatedBy;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierInfo {
        private UUID id;
        private String name;
        private String contactName;
        private String phone;
        private String email;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseOrderItemResponse {
        private UUID id;
        private UUID ingredientId;
        private String ingredientName;
        private String unit;
        private BigDecimal quantityOrdered;
        private BigDecimal quantityReceived;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }
}
