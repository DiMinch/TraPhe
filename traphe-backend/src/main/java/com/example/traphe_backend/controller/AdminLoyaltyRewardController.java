package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.entity.LoyaltyReward;
import com.example.traphe_backend.repository.LoyaltyRewardRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/loyalty/rewards")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
@Tag(name = "Admin Loyalty Rewards", description = "Quản lý danh mục quà đổi điểm (Admin/Manager)")
public class AdminLoyaltyRewardController {

    private final LoyaltyRewardRepository loyaltyRewardRepository;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoyaltyRewardResponse {
        private UUID id;
        private String name;
        private String type; // DRINK, VOUCHER, MERCHANDISE
        private int pointsRequired;
        private String description;
        private int stock;
        private boolean isActive;
        private BigDecimal discountValue;
        private String discountType;
        private String imageUrl;
    }

    @Data
    @NoArgsConstructor
    public static class LoyaltyRewardRequest {
        @NotBlank private String name;
        @NotBlank private String type; // DRINK, VOUCHER, MERCHANDISE
        @NotNull private Integer pointsRequired;
        private String description;
        private int stock; // dummy or ignored
        private boolean isActive = true;
        private BigDecimal discountValue;
        private String discountType;
        private String imageUrl;
    }

    @GetMapping
    @Operation(summary = "Lấy tất cả quà đổi điểm", description = "Trả về danh sách tất cả các quà tặng (kể cả đã ẩn)")
    public ResponseEntity<ApiResponse<List<LoyaltyRewardResponse>>> getAllRewards() {
        List<LoyaltyRewardResponse> list = loyaltyRewardRepository.findAllByIsDeletedFalse()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list, "Danh sách quà tặng retrieved"));
    }

    @PostMapping
    @Operation(summary = "Thêm quà đổi điểm mới")
    public ResponseEntity<ApiResponse<LoyaltyRewardResponse>> createReward(@Valid @RequestBody LoyaltyRewardRequest req) {
        String dbCategory = req.getType().toLowerCase(); // standardise to lowercase "drink", "voucher", "merchandise"
        
        LoyaltyReward reward = LoyaltyReward.builder()
                .name(req.getName())
                .points(req.getPointsRequired())
                .description(req.getDescription())
                .category(dbCategory)
                .discountValue(req.getDiscountValue())
                .discountType(req.getDiscountType())
                .imageUrl(req.getImageUrl())
                .isActive(req.isActive())
                .build();
        
        LoyaltyReward saved = loyaltyRewardRepository.save(reward);
        return ResponseEntity.ok(ApiResponse.success(toResponse(saved), "Đã tạo quà tặng đổi điểm mới"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin quà đổi điểm")
    public ResponseEntity<ApiResponse<LoyaltyRewardResponse>> updateReward(
            @PathVariable UUID id,
            @Valid @RequestBody LoyaltyRewardRequest req) {
        
        LoyaltyReward reward = loyaltyRewardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy quà tặng với ID: " + id));
        
        reward.setName(req.getName());
        reward.setPoints(req.getPointsRequired());
        reward.setDescription(req.getDescription());
        reward.setCategory(req.getType().toLowerCase());
        reward.setDiscountValue(req.getDiscountValue());
        reward.setDiscountType(req.getDiscountType());
        reward.setImageUrl(req.getImageUrl());
        reward.setActive(req.isActive());
        
        LoyaltyReward saved = loyaltyRewardRepository.save(reward);
        return ResponseEntity.ok(ApiResponse.success(toResponse(saved), "Cập nhật quà tặng thành công"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa quà đổi điểm (Soft delete)")
    public ResponseEntity<ApiResponse<Void>> deleteReward(@PathVariable UUID id) {
        LoyaltyReward reward = loyaltyRewardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy quà tặng với ID: " + id));
        
        reward.setDeleted(true);
        reward.setDeletedAt(java.time.LocalDateTime.now());
        loyaltyRewardRepository.save(reward);
        
        return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa quà tặng thành công"));
    }

    private LoyaltyRewardResponse toResponse(LoyaltyReward r) {
        String type = r.getCategory() != null ? r.getCategory().toUpperCase() : "DRINK";
        return LoyaltyRewardResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .type(type)
                .pointsRequired(r.getPoints())
                .description(r.getDescription())
                .stock(999) // default stock to 999 since DB doesn't have stock
                .isActive(r.isActive())
                .discountValue(r.getDiscountValue())
                .discountType(r.getDiscountType())
                .imageUrl(r.getImageUrl())
                .build();
    }
}
