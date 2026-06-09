package com.example.traphe_backend.mapper;

import com.example.traphe_backend.dto.response.OptionGroupResponse;
import com.example.traphe_backend.dto.response.OptionValueResponse;
import com.example.traphe_backend.entity.OptionGroup;
import com.example.traphe_backend.entity.OptionValue;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OptionGroupMapper {

    @Mapping(target = "id", source = "group.id")
    @Mapping(target = "name", source = "group.name")
    @Mapping(target = "type", source = "group.type")
    @Mapping(target = "isRequired", source = "group.required")
    @Mapping(target = "displayOrder", source = "group.displayOrder")
    @Mapping(target = "values", source = "values")
    OptionGroupResponse toResponse(OptionGroup group, List<OptionValue> values);

    @Mapping(target = "isDefault", source = "default")
    OptionValueResponse toValueResponse(OptionValue value);
}
