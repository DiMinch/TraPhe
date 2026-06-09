package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.dto.request.BranchMenuItemRequest;
import com.example.traphe_backend.dto.response.BranchMenuItemResponse;
import com.example.traphe_backend.dto.response.BranchResponse;
import com.example.traphe_backend.dto.response.PageResponse;
import com.example.traphe_backend.entity.Branch;
import com.example.traphe_backend.entity.BranchHour;
import com.example.traphe_backend.entity.BranchMenuItem;
import com.example.traphe_backend.entity.MenuItem;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.mapper.BranchMapper;
import com.example.traphe_backend.mapper.BranchMenuItemMapper;
import com.example.traphe_backend.repository.BranchHourRepository;
import com.example.traphe_backend.repository.BranchMenuItemRepository;
import com.example.traphe_backend.repository.BranchRepository;
import com.example.traphe_backend.repository.MenuItemRepository;
import com.example.traphe_backend.repository.UserRepository;
import com.example.traphe_backend.service.BranchService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BranchServiceImpl implements BranchService {

    private final BranchRepository branchRepository;
    private final BranchHourRepository branchHourRepository;
    private final BranchMenuItemRepository branchMenuItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;
    private final com.example.traphe_backend.repository.SystemConfigRepository systemConfigRepository;

    private final BranchMapper branchMapper;
    private final BranchMenuItemMapper branchMenuItemMapper;

    @Override
    public PageResponse<BranchResponse> getBranches(String search, Boolean isActive,
                                                     int page, int size, String sortBy, String sortDir) {
        String field = (sortBy != null && !sortBy.isBlank()) ? sortBy : "name";
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, field));

        Specification<Branch> spec = buildBranchSpec(search, isActive);
        Page<Branch> branchPage = branchRepository.findAll(spec, pageable);

        List<BranchResponse> content = branchPage.getContent().stream()
                .map(branch -> {
                    List<BranchHour> hours = branchHourRepository.findByBranchIdOrderByDayOfWeekAsc(branch.getId());
                    return branchMapper.toResponse(branch, hours);
                })
                .toList();

        return PageResponse.of(content, page, size,
                branchPage.getTotalElements(), branchPage.getTotalPages());
    }

    @Override
    public BranchResponse getBranchById(UUID id) {
        Branch branch = branchRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + id));

        List<BranchHour> hours = branchHourRepository.findByBranchIdOrderByDayOfWeekAsc(id);
        return branchMapper.toResponse(branch, hours);
    }

    @Override
    public List<BranchResponse> getAllBranches() {
        return branchRepository.findAll().stream()
                .filter(b -> !b.isDeleted())
                .map(branch -> {
                    List<BranchHour> hours = branchHourRepository.findByBranchIdOrderByDayOfWeekAsc(branch.getId());
                    return branchMapper.toResponse(branch, hours);
                })
                .toList();
    }

    @Override
    @Transactional
    @com.example.traphe_backend.annotation.AuditLogging(action = "CREATE", entityName = "Branch")
    public BranchResponse createBranch(com.example.traphe_backend.dto.request.BranchRequest request) {
        Branch branch = Branch.builder()
                .name(request.getName())
                .address(request.getAddress())
                .lat(request.getLat())
                .lng(request.getLng())
                .phone(request.getPhone())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        Branch savedBranch = branchRepository.save(branch);
        return branchMapper.toResponse(savedBranch, new ArrayList<>());
    }

    @Override
    @Transactional
    @com.example.traphe_backend.annotation.AuditLogging(action = "UPDATE", entityName = "Branch")
    public BranchResponse updateBranch(UUID id, com.example.traphe_backend.dto.request.BranchRequest request) {
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

        Branch savedBranch = branchRepository.save(branch);
        List<BranchHour> hours = branchHourRepository.findByBranchIdOrderByDayOfWeekAsc(id);
        return branchMapper.toResponse(savedBranch, hours);
    }

    @Override
    @Transactional
    @com.example.traphe_backend.annotation.AuditLogging(action = "DELETE", entityName = "Branch")
    public void deleteBranch(UUID id) {
        Branch branch = branchRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
        branch.setDeleted(true);
        branchRepository.save(branch);
    }

    @Override
    public com.example.traphe_backend.dto.response.NearestBranchResponse getNearestBranch(double lat, double lng) {
        List<Branch> activeBranches = branchRepository.findAll().stream()
                .filter(b -> !b.isDeleted() && b.isActive() && b.getLat() != null && b.getLng() != null)
                .toList();

        if (activeBranches.isEmpty()) {
            throw new ResourceNotFoundException("No active branches available");
        }

        Branch nearestBranch = null;
        double minDistance = Double.MAX_VALUE;
        double EARTH_RADIUS_KM = 6371.0;

        for (Branch branch : activeBranches) {
            double dLat = Math.toRadians(branch.getLat().doubleValue() - lat);
            double dLon = Math.toRadians(branch.getLng().doubleValue() - lng);
            double lat1 = Math.toRadians(lat);
            double lat2 = Math.toRadians(branch.getLat().doubleValue());
            double a = Math.pow(Math.sin(dLat / 2), 2) + Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
            double c = 2 * Math.asin(Math.sqrt(a));
            double distance = EARTH_RADIUS_KM * c;

            if (distance < minDistance) {
                minDistance = distance;
                nearestBranch = branch;
            }
        }

        java.math.BigDecimal shippingFee = calculateShippingFee(minDistance);
        List<BranchHour> hours = branchHourRepository.findByBranchIdOrderByDayOfWeekAsc(nearestBranch.getId());

        return com.example.traphe_backend.dto.response.NearestBranchResponse.builder()
                .branch(branchMapper.toResponse(nearestBranch, hours))
                .distanceKm(Math.round(minDistance * 100.0) / 100.0)
                .shippingFee(shippingFee)
                .build();
    }

    @Override
    public PageResponse<BranchMenuItemResponse> getBranchMenuItems(UUID branchId, Boolean isAvailable,
                                                                    String search, int page, int size) {
        // Verify branch exists
        branchRepository.findByIdAndIsDeletedFalse(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + branchId));

        Pageable pageable = PageRequest.of(page, size);

        boolean hasSearch = search != null && !search.isBlank();
        Page<BranchMenuItem> bmiPage;

        if (hasSearch && isAvailable != null) {
            bmiPage = branchMenuItemRepository
                    .findAllByBranchIdAndIsAvailableAndSearchWithMenuItem(branchId, isAvailable, search, pageable);
        } else if (hasSearch) {
            bmiPage = branchMenuItemRepository
                    .findAllByBranchIdAndSearchWithMenuItem(branchId, search, pageable);
        } else if (isAvailable != null) {
            bmiPage = branchMenuItemRepository
                    .findAllByBranchIdAndIsAvailableWithMenuItem(branchId, isAvailable, pageable);
        } else {
            bmiPage = branchMenuItemRepository.findAllByBranchIdWithMenuItem(branchId, pageable);
        }

        List<BranchMenuItemResponse> content = bmiPage.getContent().stream()
                .map(branchMenuItemMapper::toResponse)
                .toList();

        return PageResponse.of(content, page, size,
                bmiPage.getTotalElements(), bmiPage.getTotalPages());
    }

    @Override
    @Transactional
    public BranchMenuItemResponse updateBranchMenuItem(UUID branchId, BranchMenuItemRequest request) {
        // Ownership check: BRANCH_MANAGER can only update their assigned branch
        verifyBranchAccess(branchId);

        // Verify branch exists
        Branch branch = branchRepository.findByIdAndIsDeletedFalse(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + branchId));

        // Verify menu item exists
        MenuItem menuItem = menuItemRepository.findByIdAndIsDeletedFalse(request.getMenuItemId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Menu item not found with id: " + request.getMenuItemId()));

        // Find or create branch-menu-item mapping
        BranchMenuItem bmi = branchMenuItemRepository
                .findByBranchIdAndMenuItemId(branchId, request.getMenuItemId())
                .orElseGet(() -> BranchMenuItem.builder()
                        .branch(branch)
                        .menuItem(menuItem)
                        .build());

        // Update fields
        if (request.getIsAvailable() != null) {
            bmi.setAvailable(request.getIsAvailable());
        }
        if (request.getCustomPrice() != null) {
            bmi.setCustomPrice(request.getCustomPrice());
        }
        if (request.getUnavailableReason() != null) {
            bmi.setUnavailableReason(request.getUnavailableReason());
        }

        // Clear reason when marking available
        if (Boolean.TRUE.equals(request.getIsAvailable())) {
            bmi.setUnavailableReason(null);
        }

        branchMenuItemRepository.save(bmi);
        return branchMenuItemMapper.toResponse(bmi);
    }

    // ---- Private helpers ----

    private java.math.BigDecimal calculateShippingFee(double distanceKm) {
        double baseFee = 15000.0; // Default 15k
        double feePerKm = 5000.0;  // Default 5k/km

        try {
            com.example.traphe_backend.entity.SystemConfig baseFeeConfig = systemConfigRepository.findByConfigKey("SHIPPING_BASE_FEE").orElse(null);
            if (baseFeeConfig != null) baseFee = Double.parseDouble(baseFeeConfig.getConfigValue());

            com.example.traphe_backend.entity.SystemConfig feePerKmConfig = systemConfigRepository.findByConfigKey("SHIPPING_PER_KM").orElse(null);
            if (feePerKmConfig != null) feePerKm = Double.parseDouble(feePerKmConfig.getConfigValue());
        } catch (Exception e) {
            // Ignore parse errors, fallback to defaults
        }

        double totalFee = baseFee + (distanceKm * feePerKm);
        return java.math.BigDecimal.valueOf(Math.round(totalFee / 1000.0) * 1000); // Round to nearest 1000
    }

    private Specification<Branch> buildBranchSpec(String search, Boolean isActive) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("address")), pattern)
                ));
            }
            if (isActive != null) {
                predicates.add(cb.equal(root.get("isActive"), isActive));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Verifies that the current user has access to modify the given branch.
     * ADMIN can access any branch. BRANCH_MANAGER can only access their assigned branch.
     */
    private void verifyBranchAccess(UUID branchId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) return;

        // For BRANCH_MANAGER: check ownership
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getBranchId() == null || !user.getBranchId().equals(branchId)) {
            throw new AccessDeniedException(
                    "Bạn không có quyền quản lý chi nhánh này. Chỉ có thể quản lý chi nhánh được gán.");
        }
    }
}
