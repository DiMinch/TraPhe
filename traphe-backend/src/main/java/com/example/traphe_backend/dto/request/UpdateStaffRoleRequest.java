package com.example.traphe_backend.dto.request;

import com.example.traphe_backend.enums.RoleName;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Set;

@Data
public class UpdateStaffRoleRequest {

    @NotEmpty(message = "Roles cannot be empty")
    private Set<RoleName> roles;
}
