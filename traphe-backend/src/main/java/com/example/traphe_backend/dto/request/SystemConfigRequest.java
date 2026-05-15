package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SystemConfigRequest {

    @NotBlank(message = "Config key is required")
    private String configKey;

    @NotBlank(message = "Config value is required")
    private String configValue;

    private String description;
}
