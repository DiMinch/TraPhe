package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BranchRequest {
    @NotBlank(message = "Branch name is required")
    private String name;

    @NotBlank(message = "Branch address is required")
    private String address;

    private BigDecimal lat;
    private BigDecimal lng;
    private String phone;
    private Boolean isActive;
}
