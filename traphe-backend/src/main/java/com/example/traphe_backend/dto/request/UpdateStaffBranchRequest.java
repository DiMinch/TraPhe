package com.example.traphe_backend.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class UpdateStaffBranchRequest {
    
    // Can be null to remove staff from branch
    private UUID branchId;
}
