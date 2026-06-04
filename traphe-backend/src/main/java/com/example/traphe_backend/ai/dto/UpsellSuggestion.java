package com.example.traphe_backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpsellSuggestion {
    private String itemId;
    private String itemName;
    private String type; // "MENU_ITEM" or "TOPPING"
    private double confidence; // e.g. 0.85
    private String reason; // e.g. "Thường được mua cùng Cà phê sữa"
    private BigDecimal price; // Might need to populate this
    private String imageUrl;
}
