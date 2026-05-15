package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateBrewingStatusRequest {
    @NotBlank(message = "Status is required")
    private String status; // WAITING, BREWING, COMPLETED
}
