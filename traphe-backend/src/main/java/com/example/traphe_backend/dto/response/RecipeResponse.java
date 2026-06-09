package com.example.traphe_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeResponse {
    private UUID id;
    private UUID menuItemId;
    private String menuItemName;
    private String size;
    private String notes;
    private boolean isActive;
    private List<RecipeItemResponse> items;
}
