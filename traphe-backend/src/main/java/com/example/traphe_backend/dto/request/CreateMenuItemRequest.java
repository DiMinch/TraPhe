package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateMenuItemRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private UUID categoryId;

    private String imageUrl;

    private String description;

    @NotNull(message = "isDrink is required")
    private Boolean isDrink;

    private BigDecimal basePrice;

    private Integer preparationTime;

    private Boolean allowToppings;

    /**
     * Optional: create sizes inline.
     */
    private List<SizeRequest> sizes;

    /**
     * Optional: IDs of option groups to link.
     */
    private List<UUID> optionGroupIds;

    /**
     * Optional: IDs of toppings to link.
     */
    private List<UUID> toppingIds;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SizeRequest {
        @NotBlank(message = "Size name is required")
        private String sizeName;

        @NotNull(message = "Selling price is required")
        private BigDecimal sellingPrice;

        private Integer displayOrder;
    }
}
