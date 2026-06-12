package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.CreateMembershipTierRequest;
import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.MembershipTierResponse;
import com.example.traphe_backend.entity.MembershipTier;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.repository.MembershipTierRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/membership-tiers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Membership Tiers", description = "Quản lý hạng thành viên khách hàng (Chỉ Admin)")
public class MembershipTierController {

    private final MembershipTierRepository membershipTierRepository;

    @GetMapping
    @Operation(summary = "Danh sách hạng thành viên")
    public ResponseEntity<ApiResponse<List<MembershipTierResponse>>> getAllTiers() {
        List<MembershipTierResponse> tiers = membershipTierRepository
                .findByIsDeletedFalseOrderByTierLevelAsc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(tiers, "Danh sách hạng thành viên"));
    }

    @GetMapping("/active")
    @Operation(summary = "Danh sách hạng thành viên đang hoạt động")
    public ResponseEntity<ApiResponse<List<MembershipTierResponse>>> getActiveTiers() {
        List<MembershipTierResponse> tiers = membershipTierRepository
                .findByIsActiveTrueAndIsDeletedFalseOrderByTierLevelAsc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(tiers, "Danh sách hạng thành viên hoạt động"));
    }

    @PostMapping
    @Operation(summary = "Tạo hạng thành viên mới")
    public ResponseEntity<ApiResponse<MembershipTierResponse>> createTier(
            @Valid @RequestBody CreateMembershipTierRequest request) {
        MembershipTier tier = MembershipTier.builder()
                .name(request.getName())
                .tierLevel(request.getTierLevel())
                .minSpending(request.getMinSpending())
                .pointEarningRate(request.getPointEarningRate())
                .discountRate(request.getDiscountRate())
                .description(request.getDescription())
                .build();

        MembershipTier saved = membershipTierRepository.save(tier);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(mapToResponse(saved), "Tạo hạng thành viên thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật hạng thành viên")
    public ResponseEntity<ApiResponse<MembershipTierResponse>> updateTier(
            @PathVariable UUID id,
            @Valid @RequestBody CreateMembershipTierRequest request) {
        MembershipTier tier = membershipTierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hạng thành viên không tồn tại"));

        tier.setName(request.getName());
        tier.setTierLevel(request.getTierLevel());
        tier.setMinSpending(request.getMinSpending());
        tier.setPointEarningRate(request.getPointEarningRate());
        tier.setDiscountRate(request.getDiscountRate());
        tier.setDescription(request.getDescription());

        MembershipTier saved = membershipTierRepository.save(tier);
        return ResponseEntity.ok(ApiResponse.success(mapToResponse(saved), "Cập nhật hạng thành viên thành công"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xoá hạng thành viên (soft delete)")
    public ResponseEntity<ApiResponse<Void>> deleteTier(@PathVariable UUID id) {
        MembershipTier tier = membershipTierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hạng thành viên không tồn tại"));
        tier.setDeleted(true);
        membershipTierRepository.save(tier);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã xoá hạng thành viên"));
    }

    // ---- Helper ----

    private MembershipTierResponse mapToResponse(MembershipTier tier) {
        return MembershipTierResponse.builder()
                .id(tier.getId())
                .name(tier.getName())
                .tierLevel(tier.getTierLevel())
                .minSpending(tier.getMinSpending())
                .pointEarningRate(tier.getPointEarningRate())
                .discountRate(tier.getDiscountRate())
                .isActive(tier.isActive())
                .description(tier.getDescription())
                .createdAt(tier.getCreatedAt())
                .build();
    }
}
