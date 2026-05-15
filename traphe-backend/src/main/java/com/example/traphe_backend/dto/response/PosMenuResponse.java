package com.example.traphe_backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class PosMenuResponse {
    private UUID menuItemId;
    private String name;
    private String categoryName;
    private BigDecimal price; // custom price or base price
    private boolean isAvailable;
}
