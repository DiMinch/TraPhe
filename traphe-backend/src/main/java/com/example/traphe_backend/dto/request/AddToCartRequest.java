package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddToCartRequest {

    @NotNull(message = "menuItemId is required")
    private UUID menuItemId;

    /** Size selection (required for drinks, null for merchandise) */
    private UUID menuItemSizeId;

    @Min(value = 1, message = "Quantity must be at least 1")
    @Builder.Default
    private int quantity = 1;

    /** Optional note, e.g. "ít đá" */
    private String note;

    /** Selected options: {optionGroupId -> optionValueId} */
    private Map<String, String> selectedOptions;

    /** Selected toppings: [{toppingId, quantity}] */
    private List<ToppingSelectionRequest> selectedToppings;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ToppingSelectionRequest {
        @NotNull
        private UUID toppingId;
        private int quantity = 1;
    }
}
