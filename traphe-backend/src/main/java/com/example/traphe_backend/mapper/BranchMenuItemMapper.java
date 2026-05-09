package com.example.traphe_backend.mapper;

import com.example.traphe_backend.dto.response.BranchMenuItemResponse;
import com.example.traphe_backend.entity.BranchMenuItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BranchMenuItemMapper {

    @Mapping(target = "branchId", source = "branch.id")
    @Mapping(target = "menuItemId", source = "menuItem.id")
    @Mapping(target = "menuItemName", source = "menuItem.name")
    @Mapping(target = "menuItemImageUrl", source = "menuItem.imageUrl")
    BranchMenuItemResponse toResponse(BranchMenuItem bmi);
}
