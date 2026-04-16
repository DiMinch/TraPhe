package com.example.traphe_backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMenuItemRequest {

    private String name;

    private UUID categoryId;

    private String imageUrl;

    private String description;

    private String status; // ACTIVE / HIDDEN

    private Boolean isDrink;

    private BigDecimal basePrice;

    private Integer preparationTime;

    private Boolean allowToppings;

    /**
     * If provided, replaces all sizes. Set to null to keep existing.
     */
    private List<CreateMenuItemRequest.SizeRequest> sizes;

    /**
     * If provided, replaces all option group links. Set to null to keep existing.
     */
    private List<UUID> optionGroupIds;

    /**
     * If provided, replaces all topping links. Set to null to keep existing.
     */
    private List<UUID> toppingIds;
}
