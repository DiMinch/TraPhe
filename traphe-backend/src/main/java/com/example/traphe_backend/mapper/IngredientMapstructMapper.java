package com.example.traphe_backend.mapper;

import com.example.traphe_backend.dto.response.IngredientResponse;
import com.example.traphe_backend.entity.Ingredient;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface IngredientMapstructMapper {

    @Mapping(source = "active", target = "isActive")
    IngredientResponse toResponse(Ingredient ingredient);

    List<IngredientResponse> toResponseList(List<Ingredient> ingredients);
}
