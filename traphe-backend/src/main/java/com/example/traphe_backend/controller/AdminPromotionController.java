package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.entity.Promotion;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.repository.PromotionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/promotions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Promotions", description = "CRUD khuyến mãi / voucher (Chỉ Admin)")
public class AdminPromotionController {

    private final PromotionRepository promotionRepository;

    // ======================== DTOs ========================

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PromotionRequest {
        @NotBlank private String code;
        @NotBlank @Size(max = 200) private String name;
        @Size(max = 500) private String description;
        @NotNull private Promotion.DiscountType discountType;
        @NotNull @DecimalMin("0") private BigDecimal discountValue;
        private BigDecimal minOrderValue;
        private BigDecimal maxDiscountAmount;
        private Integer usageLimit;
        private int perUserLimit;
        @NotNull private LocalDateTime startDate;
        @NotNull private LocalDateTime endDate;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PromotionResponse {
        private UUID id;
        private String code;
        private String name;
        private String description;
        private String discountType;
        private BigDecimal discountValue;
        private BigDecimal minOrderValue;
        private BigDecimal maxDiscountAmount;
        private Integer usageLimit;
        private int usageCount;
        private int perUserLimit;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private boolean isActive;
        private LocalDateTime createdAt;
    }

    // ======================== ENDPOINTS ========================

    @GetMapping
    @Operation(summary = "Danh sách tất cả khuyến mãi")
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getAll() {
        List<PromotionResponse> list = promotionRepository.findByIsDeletedFalseOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list, "Danh sách khuyến mãi"));
    }

    @GetMapping("/active")
    @Operation(summary = "Danh sách khuyến mãi đang hoạt động")
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getActive() {
        LocalDateTime now = LocalDateTime.now();
        List<PromotionResponse> list = promotionRepository
                .findByIsActiveTrueAndIsDeletedFalseAndStartDateBeforeAndEndDateAfterOrderByCreatedAtDesc(now, now)
                .stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list, "Danh sách khuyến mãi đang hoạt động"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết khuyến mãi")
    public ResponseEntity<ApiResponse<PromotionResponse>> getById(@PathVariable UUID id) {
        Promotion p = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khuyến mãi không tồn tại"));
        return ResponseEntity.ok(ApiResponse.success(toResponse(p), "Chi tiết khuyến mãi"));
    }

    @PostMapping
    @Operation(summary = "Tạo khuyến mãi mới")
    public ResponseEntity<ApiResponse<PromotionResponse>> create(@Valid @RequestBody PromotionRequest req) {
        Promotion p = Promotion.builder()
                .code(req.getCode().toUpperCase())
                .name(req.getName())
                .description(req.getDescription())
                .discountType(req.getDiscountType())
                .discountValue(req.getDiscountValue())
                .minOrderValue(req.getMinOrderValue())
                .maxDiscountAmount(req.getMaxDiscountAmount())
                .usageLimit(req.getUsageLimit())
                .perUserLimit(req.getPerUserLimit() > 0 ? req.getPerUserLimit() : 1)
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .build();
        Promotion saved = promotionRepository.save(p);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toResponse(saved), "Tạo khuyến mãi thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật khuyến mãi")
    public ResponseEntity<ApiResponse<PromotionResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody PromotionRequest req) {
        Promotion p = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khuyến mãi không tồn tại"));
        p.setCode(req.getCode().toUpperCase());
        p.setName(req.getName());
        p.setDescription(req.getDescription());
        p.setDiscountType(req.getDiscountType());
        p.setDiscountValue(req.getDiscountValue());
        p.setMinOrderValue(req.getMinOrderValue());
        p.setMaxDiscountAmount(req.getMaxDiscountAmount());
        p.setUsageLimit(req.getUsageLimit());
        p.setPerUserLimit(req.getPerUserLimit() > 0 ? req.getPerUserLimit() : 1);
        p.setStartDate(req.getStartDate());
        p.setEndDate(req.getEndDate());
        Promotion saved = promotionRepository.save(p);
        return ResponseEntity.ok(ApiResponse.success(toResponse(saved), "Cập nhật khuyến mãi thành công"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xoá khuyến mãi (soft delete)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        Promotion p = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khuyến mãi không tồn tại"));
        p.setDeleted(true);
        promotionRepository.save(p);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã xoá khuyến mãi"));
    }

    @PostMapping("/{id}/toggle-status")
    @Operation(summary = "Bật/tắt trạng thái khuyến mãi")
    public ResponseEntity<ApiResponse<PromotionResponse>> toggleStatus(@PathVariable UUID id) {
        Promotion p = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khuyến mãi không tồn tại"));
        p.setActive(!p.isActive());
        Promotion saved = promotionRepository.save(p);
        return ResponseEntity.ok(ApiResponse.success(toResponse(saved),
                p.isActive() ? "Đã kích hoạt khuyến mãi" : "Đã tạm dừng khuyến mãi"));
    }

    // ---- Helper ----

    private PromotionResponse toResponse(Promotion p) {
        return PromotionResponse.builder()
                .id(p.getId())
                .code(p.getCode())
                .name(p.getName())
                .description(p.getDescription())
                .discountType(p.getDiscountType().name())
                .discountValue(p.getDiscountValue())
                .minOrderValue(p.getMinOrderValue())
                .maxDiscountAmount(p.getMaxDiscountAmount())
                .usageLimit(p.getUsageLimit())
                .usageCount(p.getUsageCount())
                .perUserLimit(p.getPerUserLimit())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .isActive(p.isActive())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
