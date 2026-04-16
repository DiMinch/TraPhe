package com.example.traphe_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemDetailResponse {
    private UUID id;
    private String name;
    private UUID categoryId;
    private String categoryName;
    private String imageUrl;
    private String description;
    private String status;
    private boolean isDrink;
    private BigDecimal basePrice;
    private Integer preparationTime;
    private boolean allowToppings;
    private List<MenuItemSizeResponse> sizes;
    private List<OptionGroupResponse> optionGroups;
    private List<ToppingResponse> availableToppings;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
