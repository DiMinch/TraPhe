package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.dto.request.BranchMenuItemRequest;
import com.example.traphe_backend.dto.response.BranchMenuItemResponse;
import com.example.traphe_backend.dto.response.BranchResponse;
import com.example.traphe_backend.dto.response.PageResponse;
import com.example.traphe_backend.entity.Branch;
import com.example.traphe_backend.entity.BranchHour;
import com.example.traphe_backend.entity.BranchMenuItem;
import com.example.traphe_backend.entity.MenuItem;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.mapper.BranchMapper;
import com.example.traphe_backend.mapper.BranchMenuItemMapper;
import com.example.traphe_backend.repository.BranchHourRepository;
import com.example.traphe_backend.repository.BranchMenuItemRepository;
import com.example.traphe_backend.repository.BranchRepository;
import com.example.traphe_backend.repository.MenuItemRepository;
import com.example.traphe_backend.service.BranchService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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
    public PageResponse<BranchMenuItemResponse> getBranchMenuItems(UUID branchId, Boolean isAvailable,
                                                                    String search, int page, int size) {
        // Verify branch exists
        branchRepository.findByIdAndIsDeletedFalse(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + branchId));

        Pageable pageable = PageRequest.of(page, size);

        Page<BranchMenuItem> bmiPage;
        if (isAvailable != null) {
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
}
