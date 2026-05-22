package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.service.StaffService;

import com.example.traphe_backend.annotation.AuditLogging;
import com.example.traphe_backend.dto.request.CreateStaffRequest;
import com.example.traphe_backend.dto.request.UpdateStaffBranchRequest;
import com.example.traphe_backend.dto.request.UpdateStaffRequest;
import com.example.traphe_backend.dto.request.UpdateStaffRoleRequest;
import com.example.traphe_backend.dto.response.StaffResponse;
import com.example.traphe_backend.entity.Branch;
import com.example.traphe_backend.entity.Role;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.enums.RoleName;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.repository.BranchRepository;
import com.example.traphe_backend.repository.RoleRepository;
import com.example.traphe_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffServiceImpl implements StaffService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;

    public List<StaffResponse> getAllStaff() {
        // Find all users who are not just CUSTOMER
        return userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream().anyMatch(r -> r.getName() != RoleName.ROLE_CUSTOMER))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public StaffResponse getStaffById(UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        return mapToResponse(user);
    }

    @AuditLogging(action = "CREATE", entityName = "Staff")
    public StaffResponse createStaff(CreateStaffRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        Set<Role> roles = new HashSet<>();
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            for (RoleName roleName : request.getRoles()) {
                Role role = roleRepository.findByName(roleName)
                        .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));
                roles.add(role);
            }
        } else {
            Role role = roleRepository.findByName(RoleName.ROLE_CASHIER)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.ROLE_CASHIER).build()));
            roles.add(role);
        }

        Branch branch = null;
        if (request.getBranchId() != null) {
            branch = branchRepository.findById(request.getBranchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
        }

        User user = User.builder()
                .email(request.getEmail())
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(roles)
                .branch(branch)
                .isActive(true)
                .build();

        return mapToResponse(userRepository.save(user));
    }

    @AuditLogging(action = "UPDATE", entityName = "Staff")
    public StaffResponse updateStaff(UUID id, UpdateStaffRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAvatarUrl(request.getAvatarUrl());
        if (request.getIsActive() != null) {
            user.setActive(request.getIsActive());
        }

        return mapToResponse(userRepository.save(user));
    }

    @AuditLogging(action = "UPDATE", entityName = "StaffRole")
    public StaffResponse updateStaffRole(UUID id, UpdateStaffRoleRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        Set<Role> roles = new HashSet<>();
        for (RoleName roleName : request.getRoles()) {
            Role role = roleRepository.findByName(roleName)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));
            roles.add(role);
        }
        user.setRoles(roles);

        return mapToResponse(userRepository.save(user));
    }

    @AuditLogging(action = "UPDATE", entityName = "StaffBranch")
    public StaffResponse updateStaffBranch(UUID id, UpdateStaffBranchRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        Branch branch = null;
        if (request.getBranchId() != null) {
            branch = branchRepository.findById(request.getBranchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
        }
        user.setBranch(branch);

        return mapToResponse(userRepository.save(user));
    }

    @AuditLogging(action = "DELETE", entityName = "Staff")
    public void deleteStaff(UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        user.setActive(false); // soft delete or disable
        userRepository.save(user);
    }

    private StaffResponse mapToResponse(User user) {
        Set<String> roleNames = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        return StaffResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .isActive(user.isActive())
                .roles(roleNames)
                .branchId(user.getBranch() != null ? user.getBranch().getId() : null)
                .branchName(user.getBranch() != null ? user.getBranch().getName() : null)
                .build();
    }
}
