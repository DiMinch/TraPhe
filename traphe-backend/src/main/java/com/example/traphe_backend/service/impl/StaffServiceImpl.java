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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StaffServiceImpl implements StaffService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;

    // ---- Helper: resolve the currently authenticated user ----

    private User getCurrentAuthUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    private boolean isCurrentUserAdmin() {
        User current = getCurrentAuthUser();
        if (current == null) return false;
        return current.getRoles().stream().anyMatch(r -> r.getName() == RoleName.ROLE_ADMIN);
    }

    private boolean isCurrentUserBranchManager() {
        User current = getCurrentAuthUser();
        if (current == null) return false;
        return current.getRoles().stream().anyMatch(r -> r.getName() == RoleName.ROLE_BRANCH_MANAGER);
    }

    /**
     * For a Branch Manager, returns their own branch.
     * Returns null if the BM has no branch assigned.
     */
    private Branch resolveBranchForManager() {
        User current = getCurrentAuthUser();
        if (current == null || current.getBranch() == null) {
            return null;
        }
        return current.getBranch();
    }

    /**
     * Validates that the target staff belongs to the current BM's branch.
     */
    private void assertBranchOwnership(User targetStaff) {
        if (isCurrentUserAdmin()) return; // Admin can manage anyone
        if (isCurrentUserBranchManager()) {
            Branch myBranch = resolveBranchForManager();
            if (myBranch == null || targetStaff.getBranch() == null || !targetStaff.getBranch().getId().equals(myBranch.getId())) {
                throw new AccessDeniedException("Bạn chỉ có thể quản lý nhân viên trong chi nhánh của mình.");
            }
        }
    }

    public List<StaffResponse> getAllStaff() {
        List<User> allStaff = userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream().noneMatch(r -> r.getName() == RoleName.ROLE_CUSTOMER))
                .collect(Collectors.toList());

        // Branch Manager only sees staff in their own branch
        if (isCurrentUserBranchManager() && !isCurrentUserAdmin()) {
            Branch myBranch = resolveBranchForManager();
            if (myBranch == null) {
                return java.util.Collections.emptyList();
            }
            allStaff = allStaff.stream()
                    .filter(u -> u.getBranch() != null && u.getBranch().getId().equals(myBranch.getId()))
                    .collect(Collectors.toList());
        }

        return allStaff.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public StaffResponse getStaffById(UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        assertBranchOwnership(user);
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
        if (isCurrentUserBranchManager() && !isCurrentUserAdmin()) {
            // BM: always force their own branch, ignore request.branchId
            branch = resolveBranchForManager();
            if (branch == null) {
                throw new AccessDeniedException("Branch Manager chưa được gán chi nhánh, không thể tạo nhân viên.");
            }
        } else if (request.getBranchId() != null) {
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
        assertBranchOwnership(user);

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
        assertBranchOwnership(user);

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
        assertBranchOwnership(user);

        // BM cannot transfer staff to a different branch
        if (isCurrentUserBranchManager() && !isCurrentUserAdmin()) {
            Branch myBranch = resolveBranchForManager();
            if (myBranch == null) {
                throw new AccessDeniedException("Branch Manager chưa được gán chi nhánh.");
            }
            if (request.getBranchId() != null && !request.getBranchId().equals(myBranch.getId())) {
                throw new AccessDeniedException("Bạn chỉ có thể gán nhân viên vào chi nhánh của mình.");
            }
        }

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
        assertBranchOwnership(user);
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
