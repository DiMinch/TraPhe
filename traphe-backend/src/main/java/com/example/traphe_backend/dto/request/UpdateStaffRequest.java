package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateStaffRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phoneNumber;

    private String avatarUrl;

    private Boolean isActive;
}
