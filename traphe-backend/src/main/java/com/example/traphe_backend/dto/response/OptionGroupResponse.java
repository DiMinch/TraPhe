package com.example.traphe_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptionGroupResponse {
    private UUID id;
    private String name;
    private String type;
    private boolean isRequired;
    private int displayOrder;
    private List<OptionValueResponse> values;
}
