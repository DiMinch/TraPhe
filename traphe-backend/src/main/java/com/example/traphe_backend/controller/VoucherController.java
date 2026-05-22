package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.entity.Promotion;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.entity.UserVoucher;
import com.example.traphe_backend.enums.UserVoucherStatus;
import com.example.traphe_backend.repository.UserRepository;
import com.example.traphe_backend.repository.UserVoucherRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Customer-facing Voucher endpoints.
 * Requires authentication — returns only the current user's personal vouchers.
 */
@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
@Tag(name = "Vouchers (Customer)", description = "Ví voucher cá nhân của khách hàng")
public class VoucherController {

    private final UserVoucherRepository userVoucherRepository;
    private final UserRepository userRepository;

    // ======================== DTO ========================

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MyVoucherResponse {
        private UUID id;                // UserVoucher ID
        private UUID promotionId;       // ID promotion gốc
        private String code;
        private String name;
        private String description;
        private String discountType;    // PERCENTAGE | FIXED_AMOUNT
        private BigDecimal discountValue;
        private BigDecimal minOrderValue;
        private BigDecimal maxDiscountAmount;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private String status;          // AVAILABLE | USED | EXPIRED
        private String source;          // LOYALTY_REDEEM | ADMIN_BATCH | EVENT
        private LocalDateTime assignedAt;
        private LocalDateTime usedAt;
    }

    // ======================== ENDPOINTS ========================

    /**
     * GET /api/vouchers/me — Danh sách voucher thuộc user hiện tại.
     * Mặc định trả về tất cả, có thể lọc theo trạng thái.
     */
    @GetMapping("/me")
    @Operation(summary = "Ví voucher của tôi",
            description = "Trả về danh sách voucher cá nhân (được tặng/đổi) của user đang đăng nhập.")
    public ResponseEntity<ApiResponse<List<MyVoucherResponse>>> getMyVouchers(
            Authentication auth,
            @RequestParam(required = false) UserVoucherStatus status) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserVoucher> vouchers;
        if (status != null) {
            vouchers = userVoucherRepository.findByUserIdAndStatusOrderByAssignedAtDesc(user.getId(), status);
        } else {
            vouchers = userVoucherRepository.findByUserIdOrderByAssignedAtDesc(user.getId());
        }

        // Auto-expire vouchers past their endDate
        LocalDateTime now = LocalDateTime.now();
        List<MyVoucherResponse> list = vouchers.stream()
                .map(uv -> {
                    // Check if promotion has expired but voucher status is still AVAILABLE
                    if (uv.getStatus() == UserVoucherStatus.AVAILABLE
                            && uv.getPromotion().getEndDate() != null
                            && now.isAfter(uv.getPromotion().getEndDate())) {
                        uv.setStatus(UserVoucherStatus.EXPIRED);
                        userVoucherRepository.save(uv);
                    }
                    return toResponse(uv);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(list, "Danh sách voucher cá nhân"));
    }

    // ---- Helper ----

    private MyVoucherResponse toResponse(UserVoucher uv) {
        Promotion p = uv.getPromotion();
        return MyVoucherResponse.builder()
                .id(uv.getId())
                .promotionId(p.getId())
                .code(p.getCode())
                .name(p.getName())
                .description(p.getDescription())
                .discountType(p.getDiscountType().name())
                .discountValue(p.getDiscountValue())
                .minOrderValue(p.getMinOrderValue())
                .maxDiscountAmount(p.getMaxDiscountAmount())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .status(uv.getStatus().name())
                .source(uv.getSource())
                .assignedAt(uv.getAssignedAt())
                .usedAt(uv.getUsedAt())
                .build();
    }
}
