package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.entity.Role;
import com.example.traphe_backend.repository.RoleRepository;
import com.example.traphe_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
public class AdminRoleController {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    @Data
    public static class RoleResponse {
        private UUID id;
        private String name;
        private String description;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static RoleResponse fromEntity(Role role) {
            RoleResponse response = new RoleResponse();
            response.setId(role.getId());
            if (role.getName() != null) {
                response.setName(role.getName().name());
                switch (role.getName()) {
                    case ROLE_ADMIN:
                        response.setDescription("Administrator with full access");
                        break;
                    case ROLE_BRANCH_MANAGER:
                        response.setDescription("Branch Manager");
                        break;
                    case ROLE_CASHIER:
                        response.setDescription("Cashier");
                        break;
                    case ROLE_BARISTA:
                        response.setDescription("Barista");
                        break;
                    case ROLE_CUSTOMER:
                        response.setDescription("Customer");
                        break;
                    default:
                        response.setDescription("System Role");
                }
            } else {
                response.setName("UNKNOWN");
                response.setDescription("Unknown Role");
            }
            
            response.setCreatedAt(role.getCreatedAt());
            response.setUpdatedAt(role.getUpdatedAt());
            return response;
        }
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRoles() {
        List<RoleResponse> roles = roleRepository.findAll().stream()
                .map(RoleResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(roles, "Roles retrieved successfully"));
    }

    @Data
    public static class UserInRoleResponse {
        private UUID id;
        private String username;
        private String email;
        private String fullName;
        private String phone;
        private String avatar;
        private String status;

        public static UserInRoleResponse fromEntity(com.example.traphe_backend.entity.User user) {
            UserInRoleResponse res = new UserInRoleResponse();
            res.setId(user.getId());
            res.setUsername(user.getEmail());
            res.setEmail(user.getEmail());
            res.setFullName(user.getFullName());
            res.setPhone(user.getPhoneNumber());
            res.setAvatar(user.getAvatarUrl());
            res.setStatus(user.isActive() ? "ACTIVE" : "INACTIVE");
            return res;
        }
    }

    @GetMapping("/{roleId}/users")
    public ResponseEntity<ApiResponse<List<UserInRoleResponse>>> getUsersByRole(@PathVariable UUID roleId) {
        List<UserInRoleResponse> users = userRepository.findByRoles_Id(roleId).stream()
                .map(UserInRoleResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users, "Users retrieved successfully"));
    }
}
