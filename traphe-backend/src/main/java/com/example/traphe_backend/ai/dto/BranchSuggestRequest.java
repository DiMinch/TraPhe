package com.example.traphe_backend.ai.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class BranchSuggestRequest {
    @NotNull
    private BigDecimal customerLat;

    @NotNull
    private BigDecimal customerLng;

    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {
        @NotNull
        private UUID menuItemId;
        private UUID sizeId;
        private Integer quantity;
    }
}
