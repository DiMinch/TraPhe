package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.BranchRequest;
import com.example.traphe_backend.dto.response.BranchResponse;
import com.example.traphe_backend.dto.response.NearestBranchResponse;
import com.example.traphe_backend.dto.request.BranchMenuItemRequest;
import com.example.traphe_backend.dto.response.BranchMenuItemResponse;
import com.example.traphe_backend.dto.response.PageResponse;

import java.util.List;
import java.util.UUID;

public interface BranchService {

    List<BranchResponse> getAllBranches();

    BranchResponse getBranchById(UUID id);

    BranchResponse createBranch(BranchRequest request);

    BranchResponse updateBranch(UUID id, BranchRequest request);

    void deleteBranch(UUID id);

    PageResponse<BranchResponse> getBranches(
          String search,
          Boolean isActive,
          int page,
          int size,
          String sortBy,
          String sortDir
    );

    PageResponse<BranchMenuItemResponse> getBranchMenuItems(
          UUID branchId,
          Boolean isAvailable,
          String search,
          int page,
          int size
    );

    BranchMenuItemResponse updateBranchMenuItem(
          UUID branchId,
          BranchMenuItemRequest request
    );

    NearestBranchResponse getNearestBranch(double lat, double lng);
}
