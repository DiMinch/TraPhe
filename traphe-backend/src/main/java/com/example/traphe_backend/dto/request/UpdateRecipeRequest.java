package com.example.traphe_backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
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
public class UpdateRecipeRequest {

    private String notes;
    private Boolean isActive;

    @Valid
    private List<RecipeItemRequest> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecipeItemRequest {

        @NotNull(message = "ingredientId không được trống")
        private UUID ingredientId;

        @NotNull(message = "quantity không được trống")
        @DecimalMin(value = "0.001", message = "quantity phải > 0")
        private BigDecimal quantity;
    }
}
