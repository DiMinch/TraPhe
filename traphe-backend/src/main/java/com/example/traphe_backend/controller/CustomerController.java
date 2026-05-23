package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.entity.LoyaltyPoint;
import com.example.traphe_backend.entity.MembershipTier;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.enums.RoleName;
import com.example.traphe_backend.repository.LoyaltyPointRepository;
import com.example.traphe_backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Staff-facing endpoint to list customers for POS customer selection.
 */
@Slf4j
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "Customer listing for staff (POS, Admin)")
public class CustomerController {

    private final UserRepository userRepository;
    private final LoyaltyPointRepository loyaltyPointRepository;
    private final com.example.traphe_backend.repository.UserVoucherRepository userVoucherRepository;

    // ======================== Response DTO ========================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerResponse {
        private UUID id;
        private String fullName;
        private String phone;
        private String email;
        private BigDecimal totalPurchase;
        private TierInfo tier;
        private LoyaltyPointInfo loyaltyPoint;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TierInfo {
        private UUID id;
        private String name;
        private int minPoint;
        private BigDecimal discountRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoyaltyPointInfo {
        private UUID id;
        private int totalPoints;
        private int pointsAvailable;
        private int pointsUsed;
    }

    // ======================== ENDPOINT ========================

    /**
     * GET /api/customers — Lists all users with ROLE_CUSTOMER.
     * Accessible by ADMIN, CASHIER, and BRANCH_MANAGER.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'BRANCH_MANAGER')")
    @Operation(summary = "List all customers",
            description = "Returns a list of all users with the CUSTOMER role, including their loyalty points and tier information.")
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> getAllCustomers() {
        List<User> customerUsers = userRepository.findAll().stream()
                .filter(u -> !u.isDeleted() && u.isActive())
                .filter(u -> u.getRoles().stream()
                        .anyMatch(r -> r.getName() == RoleName.ROLE_CUSTOMER))
                .collect(Collectors.toList());

        List<CustomerResponse> responses = customerUsers.stream()
                .map(this::toCustomerResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(responses, "Lấy danh sách khách hàng thành công."));
    }

    /**
     * GET /api/customers/{id}/vouchers — Lists vouchers for a specific customer.
     * Accessible by ADMIN, CASHIER, and BRANCH_MANAGER.
     */
    @GetMapping("/{id}/vouchers")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'BRANCH_MANAGER')")
    @Operation(summary = "Get customer's vouchers",
            description = "Returns a list of vouchers owned by the specified customer.")
    public ResponseEntity<ApiResponse<List<com.example.traphe_backend.controller.VoucherController.MyVoucherResponse>>> getCustomerVouchers(
            @org.springframework.web.bind.annotation.PathVariable UUID id,
            @org.springframework.web.bind.annotation.RequestParam(required = false) com.example.traphe_backend.enums.UserVoucherStatus status) {
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        List<com.example.traphe_backend.entity.UserVoucher> vouchers;
        if (status != null) {
            vouchers = userVoucherRepository.findByUserIdAndStatusOrderByAssignedAtDesc(user.getId(), status);
        } else {
            vouchers = userVoucherRepository.findByUserIdOrderByAssignedAtDesc(user.getId());
        }

        LocalDateTime now = LocalDateTime.now();
        List<com.example.traphe_backend.controller.VoucherController.MyVoucherResponse> list = vouchers.stream()
                .map(uv -> {
                    if (uv.getStatus() == com.example.traphe_backend.enums.UserVoucherStatus.AVAILABLE
                            && uv.getPromotion().getEndDate() != null
                            && now.isAfter(uv.getPromotion().getEndDate())) {
                        uv.setStatus(com.example.traphe_backend.enums.UserVoucherStatus.EXPIRED);
                        userVoucherRepository.save(uv);
                    }
                    com.example.traphe_backend.entity.Promotion p = uv.getPromotion();
                    return com.example.traphe_backend.controller.VoucherController.MyVoucherResponse.builder()
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
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(list, "Danh sách voucher cá nhân của khách hàng"));
    }

    // ---- Helpers ----

    private CustomerResponse toCustomerResponse(User user) {
        LoyaltyPoint lp = loyaltyPointRepository.findByUserId(user.getId()).orElse(null);
        MembershipTier mt = lp != null ? lp.getMembershipTier() : null;

        return CustomerResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .phone(user.getPhoneNumber())
                .email(user.getEmail())
                .totalPurchase(lp != null ? lp.getTotalSpending() : BigDecimal.ZERO)
                .tier(mt != null ? TierInfo.builder()
                        .id(mt.getId())
                        .name(mt.getName())
                        .minPoint(mt.getTierLevel())
                        .discountRate(mt.getDiscountRate())
                        .build() : null)
                .loyaltyPoint(lp != null ? LoyaltyPointInfo.builder()
                        .id(lp.getId())
                        .totalPoints(lp.getPointsAvailable()) // total = available for now
                        .pointsAvailable(lp.getPointsAvailable())
                        .pointsUsed(0)
                        .build() : null)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
