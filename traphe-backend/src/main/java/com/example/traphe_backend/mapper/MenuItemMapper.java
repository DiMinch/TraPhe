package com.example.traphe_backend.mapper;

import com.example.traphe_backend.dto.response.MenuItemDetailResponse;
import com.example.traphe_backend.dto.response.MenuItemResponse;
import com.example.traphe_backend.dto.response.MenuItemSizeResponse;
import com.example.traphe_backend.dto.response.OptionGroupResponse;
import com.example.traphe_backend.dto.response.ToppingResponse;
import com.example.traphe_backend.entity.MenuItem;
import com.example.traphe_backend.entity.MenuItemSize;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    builder = @org.mapstruct.Builder(disableBuilder = true)
)
public interface MenuItemMapper {

    @Mapping(target = "categoryId", source = "item.category.id")
    @Mapping(target = "categoryName", source = "item.category.name")
    @Mapping(target = "id", source = "item.id")
    @Mapping(target = "name", source = "item.name")
    @Mapping(target = "imageUrl", source = "item.imageUrl")
    @Mapping(target = "description", source = "item.description")
    @Mapping(target = "status", source = "item.status")
    @Mapping(target = "drink", source = "item.drink")
    @Mapping(target = "basePrice", source = "item.basePrice")
    @Mapping(target = "preparationTime", source = "item.preparationTime")
    @Mapping(target = "allowToppings", source = "item.allowToppings")
    @Mapping(target = "ingredientId", source = "item.ingredient.id")
    @Mapping(target = "sizes", source = "sizes")
    @Mapping(target = "createdAt", source = "item.createdAt")
    MenuItemResponse toResponse(MenuItem item, List<MenuItemSize> sizes);

    @Mapping(target = "categoryId", source = "item.category.id")
    @Mapping(target = "categoryName", source = "item.category.name")
    @Mapping(target = "id", source = "item.id")
    @Mapping(target = "name", source = "item.name")
    @Mapping(target = "imageUrl", source = "item.imageUrl")
    @Mapping(target = "description", source = "item.description")
    @Mapping(target = "status", source = "item.status")
    @Mapping(target = "drink", source = "item.drink")
    @Mapping(target = "basePrice", source = "item.basePrice")
    @Mapping(target = "preparationTime", source = "item.preparationTime")
    @Mapping(target = "allowToppings", source = "item.allowToppings")
    @Mapping(target = "ingredientId", source = "item.ingredient.id")
    @Mapping(target = "sizes", source = "sizes")
    @Mapping(target = "optionGroups", source = "optionGroups")
    @Mapping(target = "availableToppings", source = "toppings")
    @Mapping(target = "createdAt", source = "item.createdAt")
    @Mapping(target = "updatedAt", source = "item.updatedAt")
    MenuItemDetailResponse toDetailResponse(MenuItem item,
                                            List<MenuItemSize> sizes,
                                            List<OptionGroupResponse> optionGroups,
                                            List<ToppingResponse> toppings);

    @Mapping(target = "sizeName", source = "sizeName")
    @Mapping(target = "sellingPrice", source = "sellingPrice")
    @Mapping(target = "displayOrder", source = "displayOrder")
    @Mapping(target = "id", source = "id")
    MenuItemSizeResponse toSizeResponse(MenuItemSize size);
}
