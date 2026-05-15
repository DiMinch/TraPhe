package com.example.traphe_backend.mapper;

import com.example.traphe_backend.dto.response.ToppingResponse;
import com.example.traphe_backend.entity.Topping;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ToppingMapper {

    ToppingResponse toResponse(Topping topping);
}
