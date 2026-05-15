package com.example.traphe_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String avatarUrl;
    private boolean isActive;
    private Set<String> roles;
    private UUID branchId;
    private String branchName;
}
