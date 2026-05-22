package com.example.traphe_backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private List<CartItemResponse> items;
    private int totalItems;
    private BigDecimal totalAmount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemResponse {
        private UUID id;

        // Menu item info
        private UUID menuItemId;
        private String menuItemName;
        private String menuItemImageUrl;
        @JsonProperty("isDrink")
        private boolean isDrink;
        private String status; // ACTIVE, DISCONTINUED etc.

        // Size info (drinks only)
        private UUID menuItemSizeId;
        private String sizeName;

        // Customization
        private Map<String, String> selectedOptions;
        private List<ToppingInfo> selectedToppings;
        private String note;

        // Pricing
        private int quantity;
        private BigDecimal unitPrice;  // base + toppings
        private BigDecimal subtotal;   // unitPrice * quantity

        private LocalDateTime addedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ToppingInfo {
        private UUID toppingId;
        private String toppingName;
        private BigDecimal extraPrice;
        private int quantity;
    }
}
