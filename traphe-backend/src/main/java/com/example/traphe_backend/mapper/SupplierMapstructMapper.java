package com.example.traphe_backend.mapper;

import com.example.traphe_backend.dto.response.SupplierResponse;
import com.example.traphe_backend.entity.Supplier;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SupplierMapstructMapper {

    SupplierResponse toResponse(Supplier supplier);

    List<SupplierResponse> toResponseList(List<Supplier> suppliers);
}
