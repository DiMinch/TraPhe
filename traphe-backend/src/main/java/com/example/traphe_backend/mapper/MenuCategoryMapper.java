package com.example.traphe_backend.mapper;

import com.example.traphe_backend.dto.response.MenuCategoryResponse;
import com.example.traphe_backend.entity.MenuCategory;
import org.springframework.stereotype.Component;

@Component
public class MenuCategoryMapper {

    public MenuCategoryResponse toResponse(MenuCategory category) {
        return MenuCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .displayOrder(category.getDisplayOrder())
                .imageUrl(category.getImageUrl())
                .isDrinkCategory(category.isDrinkCategory())
                .build();
    }
}
