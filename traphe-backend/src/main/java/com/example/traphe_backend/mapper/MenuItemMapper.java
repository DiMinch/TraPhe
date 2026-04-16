package com.example.traphe_backend.mapper;

import com.example.traphe_backend.dto.response.MenuItemDetailResponse;
import com.example.traphe_backend.dto.response.MenuItemResponse;
import com.example.traphe_backend.dto.response.MenuItemSizeResponse;
import com.example.traphe_backend.dto.response.OptionGroupResponse;
import com.example.traphe_backend.dto.response.ToppingResponse;
import com.example.traphe_backend.entity.MenuItem;
import com.example.traphe_backend.entity.MenuItemSize;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MenuItemMapper {

    public MenuItemResponse toResponse(MenuItem item, List<MenuItemSize> sizes) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                .categoryName(item.getCategory() != null ? item.getCategory().getName() : null)
                .imageUrl(item.getImageUrl())
                .description(item.getDescription())
                .status(item.getStatus().name())
                .isDrink(item.isDrink())
                .basePrice(item.getBasePrice())
                .preparationTime(item.getPreparationTime())
                .allowToppings(item.isAllowToppings())
                .sizes(sizes.stream().map(this::toSizeResponse).toList())
                .createdAt(item.getCreatedAt())
                .build();
    }

    public MenuItemDetailResponse toDetailResponse(MenuItem item,
                                                    List<MenuItemSize> sizes,
                                                    List<OptionGroupResponse> optionGroups,
                                                    List<ToppingResponse> toppings) {
        return MenuItemDetailResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                .categoryName(item.getCategory() != null ? item.getCategory().getName() : null)
                .imageUrl(item.getImageUrl())
                .description(item.getDescription())
                .status(item.getStatus().name())
                .isDrink(item.isDrink())
                .basePrice(item.getBasePrice())
                .preparationTime(item.getPreparationTime())
                .allowToppings(item.isAllowToppings())
                .sizes(sizes.stream().map(this::toSizeResponse).toList())
                .optionGroups(optionGroups)
                .availableToppings(toppings)
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }

    public MenuItemSizeResponse toSizeResponse(MenuItemSize size) {
        return MenuItemSizeResponse.builder()
                .id(size.getId())
                .sizeName(size.getSizeName())
                .sellingPrice(size.getSellingPrice())
                .displayOrder(size.getDisplayOrder())
                .build();
    }
}
