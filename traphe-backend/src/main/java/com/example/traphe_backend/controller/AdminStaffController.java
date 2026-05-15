package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.CreateStaffRequest;
import com.example.traphe_backend.dto.request.UpdateStaffBranchRequest;
import com.example.traphe_backend.dto.request.UpdateStaffRequest;
import com.example.traphe_backend.dto.request.UpdateStaffRoleRequest;
import com.example.traphe_backend.dto.response.StaffResponse;
import com.example.traphe_backend.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/staff")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
public class AdminStaffController {

    private final StaffService staffService;

    @GetMapping
    public ResponseEntity<List<StaffResponse>> getAllStaff() {
        return ResponseEntity.ok(staffService.getAllStaff());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffResponse> getStaffById(@PathVariable UUID id) {
        return ResponseEntity.ok(staffService.getStaffById(id));
    }

    @PostMapping
    public ResponseEntity<StaffResponse> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(staffService.createStaff(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffResponse> updateStaff(@PathVariable UUID id, @Valid @RequestBody UpdateStaffRequest request) {
        return ResponseEntity.ok(staffService.updateStaff(id, request));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<StaffResponse> updateStaffRole(@PathVariable UUID id, @Valid @RequestBody UpdateStaffRoleRequest request) {
        return ResponseEntity.ok(staffService.updateStaffRole(id, request));
    }

    @PutMapping("/{id}/branch")
    public ResponseEntity<StaffResponse> updateStaffBranch(@PathVariable UUID id, @Valid @RequestBody UpdateStaffBranchRequest request) {
        return ResponseEntity.ok(staffService.updateStaffBranch(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable UUID id) {
        staffService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }
}
