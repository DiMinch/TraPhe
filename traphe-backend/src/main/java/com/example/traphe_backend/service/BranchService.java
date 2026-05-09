package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.BranchMenuItemRequest;
import com.example.traphe_backend.dto.response.BranchMenuItemResponse;
import com.example.traphe_backend.dto.response.BranchResponse;
import com.example.traphe_backend.dto.response.PageResponse;

import java.util.UUID;

public interface BranchService {

    PageResponse<BranchResponse> getBranches(String search, Boolean isActive,
                                              int page, int size, String sortBy, String sortDir);

    BranchResponse getBranchById(UUID id);

    PageResponse<BranchMenuItemResponse> getBranchMenuItems(UUID branchId, Boolean isAvailable,
                                                             String search, int page, int size);

    BranchMenuItemResponse updateBranchMenuItem(UUID branchId, BranchMenuItemRequest request);
}
