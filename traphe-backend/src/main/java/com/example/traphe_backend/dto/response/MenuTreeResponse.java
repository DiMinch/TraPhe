package com.example.traphe_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Nested tree response: Category → Items → Subcategories (recursive).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuTreeResponse {
    private UUID categoryId;
    private String categoryName;
    private String imageUrl;
    private boolean isDrinkCategory;
    private int displayOrder;
    private List<MenuItemResponse> items;
    private List<MenuTreeResponse> subCategories;
}
