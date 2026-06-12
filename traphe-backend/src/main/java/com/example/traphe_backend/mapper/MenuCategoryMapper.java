package com.example.traphe_backend.mapper;

import com.example.traphe_backend.dto.response.MenuCategoryResponse;
import com.example.traphe_backend.entity.MenuCategory;
import org.springframework.stereotype.Component;

@Component
public class MenuCategoryMapper {

    public MenuCategoryResponse toResponse(MenuCategory category) {
        if (category == null) {
            return null;
        }
        return MenuCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .displayOrder(category.getDisplayOrder())
                .imageUrl(category.getImageUrl())
                .isDrinkCategory(category.isDrinkCategory())
                .productCount(category.getProductCount())
                .build();
    }
}
