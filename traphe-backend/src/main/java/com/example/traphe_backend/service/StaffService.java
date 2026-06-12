package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.CreateStaffRequest;
import com.example.traphe_backend.dto.request.UpdateStaffBranchRequest;
import com.example.traphe_backend.dto.request.UpdateStaffRequest;
import com.example.traphe_backend.dto.request.UpdateStaffRoleRequest;
import com.example.traphe_backend.dto.response.StaffResponse;
import java.util.List;
import java.util.UUID;

public interface StaffService {
    public List<StaffResponse> getAllStaff();
    public StaffResponse getStaffById(UUID id);
    public StaffResponse createStaff(CreateStaffRequest request);
    public StaffResponse updateStaff(UUID id, UpdateStaffRequest request);
    public StaffResponse updateStaffRole(UUID id, UpdateStaffRoleRequest request);
    public StaffResponse updateStaffBranch(UUID id, UpdateStaffBranchRequest request);
    public void deleteStaff(UUID id);
}