package com.example.traphe_backend.dto.request;

import com.example.traphe_backend.enums.RoleName;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;
import java.util.UUID;

@Data
public class CreateStaffRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phoneNumber;

    @NotBlank(message = "Password is required")
    private String password;

    private Set<RoleName> roles;

    private UUID branchId;
}
