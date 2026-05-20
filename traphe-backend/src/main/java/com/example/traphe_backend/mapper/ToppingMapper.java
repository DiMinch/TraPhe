package com.example.traphe_backend.mapper;

import com.example.traphe_backend.dto.response.ToppingResponse;
import com.example.traphe_backend.entity.Topping;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ToppingMapper {

    ToppingResponse toResponse(Topping topping);
}
