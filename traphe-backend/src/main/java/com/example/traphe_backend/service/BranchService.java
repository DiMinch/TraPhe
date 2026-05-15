package com.example.traphe_backend.service;

import com.example.traphe_backend.annotation.AuditLogging;
import com.example.traphe_backend.dto.request.BranchRequest;
import com.example.traphe_backend.dto.response.BranchResponse;
import com.example.traphe_backend.dto.response.NearestBranchResponse;
import com.example.traphe_backend.entity.Branch;
import com.example.traphe_backend.entity.SystemConfig;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.repository.BranchRepository;
import com.example.traphe_backend.repository.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.traphe_backend.dto.request.BranchMenuItemRequest;
import com.example.traphe_backend.dto.response.BranchMenuItemResponse;
import com.example.traphe_backend.dto.response.PageResponse;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;
    private final SystemConfigRepository systemConfigRepository;

    private static final double EARTH_RADIUS_KM = 6371.0;

    public List<BranchResponse> getAllBranches() {
        return branchRepository.findAll().stream()
                .filter(b -> !b.isDeleted())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BranchResponse getBranchById(UUID id) {
        Branch branch = branchRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
        if (branch.isDeleted()) throw new ResourceNotFoundException("Branch not found");
        return mapToResponse(branch);
    }

    @AuditLogging(action = "CREATE", entityName = "Branch")
    public BranchResponse createBranch(BranchRequest request) {
        Branch branch = Branch.builder()
                .name(request.getName())
                .address(request.getAddress())
                .lat(request.getLat())
                .lng(request.getLng())
                .phone(request.getPhone())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isDeleted(false)
                .build();
        return mapToResponse(branchRepository.save(branch));
    }

    @AuditLogging(action = "UPDATE", entityName = "Branch")
    public BranchResponse updateBranch(UUID id, BranchRequest request) {
        Branch branch = branchRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
        if (branch.isDeleted()) throw new ResourceNotFoundException("Branch not found");

        branch.setName(request.getName());
        branch.setAddress(request.getAddress());
        branch.setLat(request.getLat());
        branch.setLng(request.getLng());
        branch.setPhone(request.getPhone());
        if (request.getIsActive() != null) {
            branch.setActive(request.getIsActive());
        }

        return mapToResponse(branchRepository.save(branch));
    }

    @AuditLogging(action = "DELETE", entityName = "Branch")
    public void deleteBranch(UUID id) {
        Branch branch = branchRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
        branch.setDeleted(true);
        branchRepository.save(branch);
    }
  
    public PageResponse<BranchResponse> getBranches(
          String search,
          Boolean isActive,
          int page,
          int size,
          String sortBy,
          String sortDir
  ) {
      return null;
  }

  public PageResponse<BranchMenuItemResponse> getBranchMenuItems(
          UUID branchId,
          Boolean isAvailable,
          String search,
          int page,
          int size
  ) {
      return null;
  }

  public BranchMenuItemResponse updateBranchMenuItem(
          UUID branchId,
          BranchMenuItemRequest request
  ) {
      return null;
  }

    public NearestBranchResponse getNearestBranch(double lat, double lng) {
        List<Branch> activeBranches = branchRepository.findAll().stream()
                .filter(b -> !b.isDeleted() && b.isActive() && b.getLat() != null && b.getLng() != null)
                .collect(Collectors.toList());

        if (activeBranches.isEmpty()) {
            throw new ResourceNotFoundException("No active branches available");
        }

        Branch nearestBranch = null;
        double minDistance = Double.MAX_VALUE;

        for (Branch branch : activeBranches) {
            double distance = calculateHaversineDistance(lat, lng, branch.getLat().doubleValue(), branch.getLng().doubleValue());
            if (distance < minDistance) {
                minDistance = distance;
                nearestBranch = branch;
            }
        }

        BigDecimal shippingFee = calculateShippingFee(minDistance);

        return NearestBranchResponse.builder()
                .branch(mapToResponse(nearestBranch))
                .distanceKm(Math.round(minDistance * 100.0) / 100.0) // 2 decimal places
                .shippingFee(shippingFee)
                .build();
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        lat1 = Math.toRadians(lat1);
        lat2 = Math.toRadians(lat2);

        double a = Math.pow(Math.sin(dLat / 2), 2) +
                   Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
        double c = 2 * Math.asin(Math.sqrt(a));
        return EARTH_RADIUS_KM * c;
    }

    private BigDecimal calculateShippingFee(double distanceKm) {
        double baseFee = 15000.0; // Default 15k
        double feePerKm = 5000.0;  // Default 5k/km

        try {
            SystemConfig baseFeeConfig = systemConfigRepository.findByConfigKey("SHIPPING_BASE_FEE").orElse(null);
            if (baseFeeConfig != null) baseFee = Double.parseDouble(baseFeeConfig.getConfigValue());

            SystemConfig feePerKmConfig = systemConfigRepository.findByConfigKey("SHIPPING_PER_KM").orElse(null);
            if (feePerKmConfig != null) feePerKm = Double.parseDouble(feePerKmConfig.getConfigValue());
        } catch (Exception e) {
            // Ignore parse errors, fallback to defaults
        }

        double totalFee = baseFee + (distanceKm * feePerKm);
        return BigDecimal.valueOf(Math.round(totalFee / 1000.0) * 1000); // Round to nearest 1000
    }

    private BranchResponse mapToResponse(Branch branch) {
        return BranchResponse.builder()
                .id(branch.getId())
                .name(branch.getName())
                .address(branch.getAddress())
                .lat(branch.getLat())
                .lng(branch.getLng())
                .phone(branch.getPhone())
                .isActive(branch.isActive())
                .build();
    }
}
