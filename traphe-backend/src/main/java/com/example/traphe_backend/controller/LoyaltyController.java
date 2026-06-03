package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.entity.LoyaltyPointTransaction;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.repository.LoyaltyPointTransactionRepository;
import com.example.traphe_backend.repository.UserRepository;
import com.example.traphe_backend.service.LoyaltyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.traphe_backend.annotation.Idempotent;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Customer-facing Loyalty endpoints.
 * Requires authentication — returns only the current user's loyalty data.
 */
@Slf4j
@RestController
@RequestMapping("/api/loyalty")
@RequiredArgsConstructor
@Tag(name = "Loyalty (Customer)", description = "Loyalty points, transaction history & reward redemption")
public class LoyaltyController {

    private final LoyaltyPointTransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final LoyaltyService loyaltyService;

    // ======================== DTOs ========================

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LoyaltyTransactionResponse {
        private UUID id;
        private String type;          // EARN, REDEEM, REFUND
        private int points;
        private String description;
        private String orderId;
        private String orderNumber;
        private LocalDateTime createdAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RedeemRewardRequest {
        @NotBlank private String rewardId;
        @NotBlank private String rewardName;
        @NotNull @Min(1) private Integer pointsCost;
        private String rewardDescription;
        /** Nếu phần thưởng là voucher, đây là giá trị giảm */
        private BigDecimal discountValue;
        /** PERCENTAGE hoặc FIXED_AMOUNT */
        private String discountType;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RedeemRewardResponse {
        private String voucherCode;
        private String rewardName;
        private int pointsDeducted;
        private int remainingPoints;
    }

    // ======================== ENDPOINTS ========================

    /**
     * GET /api/loyalty/me/transactions — Lịch sử giao dịch điểm của user hiện tại.
     */
    @GetMapping("/me/transactions")
    @Operation(summary = "Lịch sử giao dịch điểm (Customer)",
            description = "Trả về lịch sử tích/tiêu/hoàn điểm của user đang đăng nhập, sắp xếp mới nhất trước.")
    public ResponseEntity<ApiResponse<List<LoyaltyTransactionResponse>>> getMyTransactions(
            Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<LoyaltyTransactionResponse> list = transactionRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toTransactionResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(list, "Lịch sử giao dịch điểm"));
    }

    /**
     * POST /api/loyalty/redeem — Đổi điểm tích luỹ lấy phần thưởng (voucher).
     * Delegates to LoyaltyService.redeemReward() — @Transactional is on the service layer.
     */
    @PostMapping("/redeem")
    @Idempotent
    @Operation(summary = "Đổi điểm lấy phần thưởng",
            description = "Trừ điểm tích luỹ, tạo voucher cá nhân và gán cho user.")
    public ResponseEntity<ApiResponse<RedeemRewardResponse>> redeemReward(
            @Valid @RequestBody RedeemRewardRequest request,
            Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        LoyaltyService.RedeemRewardResult result = loyaltyService.redeemReward(
                user,
                request.getRewardId(),
                request.getRewardName(),
                request.getPointsCost(),
                request.getRewardDescription(),
                request.getDiscountValue(),
                request.getDiscountType()
        );

        RedeemRewardResponse response = RedeemRewardResponse.builder()
                .voucherCode(result.voucherCode())
                .rewardName(result.rewardName())
                .pointsDeducted(result.pointsDeducted())
                .remainingPoints(result.remainingPoints())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response,
                "Đổi thưởng thành công! Mã voucher: " + result.voucherCode()));
    }

    // ---- Helpers ----

    private LoyaltyTransactionResponse toTransactionResponse(LoyaltyPointTransaction tx) {
        return LoyaltyTransactionResponse.builder()
                .id(tx.getId())
                .type(tx.getType().name())
                .points(tx.getPoints())
                .description(tx.getDescription())
                .orderId(tx.getOrder() != null ? tx.getOrder().getId().toString() : null)
                .orderNumber(tx.getOrder() != null ? tx.getOrder().getOrderNumber() : "System")
                .createdAt(tx.getCreatedAt())
                .build();
    }
}

