package com.example.traphe_backend.mapper;

import com.example.traphe_backend.dto.response.OptionGroupResponse;
import com.example.traphe_backend.dto.response.OptionValueResponse;
import com.example.traphe_backend.entity.OptionGroup;
import com.example.traphe_backend.entity.OptionValue;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OptionGroupMapper {

    public OptionGroupResponse toResponse(OptionGroup group, List<OptionValue> values) {
        return OptionGroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .type(group.getType().name())
                .isRequired(group.isRequired())
                .displayOrder(group.getDisplayOrder())
                .values(values.stream().map(this::toValueResponse).toList())
                .build();
    }

    public OptionValueResponse toValueResponse(OptionValue value) {
        return OptionValueResponse.builder()
                .id(value.getId())
                .label(value.getLabel())
                .isDefault(value.isDefault())
                .sortOrder(value.getSortOrder())
                .build();
    }
}
