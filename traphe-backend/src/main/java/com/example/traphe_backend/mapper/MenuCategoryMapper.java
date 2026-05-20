package com.example.traphe_backend.mapper;

import com.example.traphe_backend.dto.response.MenuCategoryResponse;
import com.example.traphe_backend.entity.MenuCategory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MenuCategoryMapper {

    @Mapping(target = "parentId", source = "parent.id")
    MenuCategoryResponse toResponse(MenuCategory category);
}
