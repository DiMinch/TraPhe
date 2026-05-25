package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.entity.Promotion;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.enums.PromotionScope;
import com.example.traphe_backend.repository.PromotionRepository;
import com.example.traphe_backend.repository.UserRepository;
import com.example.traphe_backend.service.PromotionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Public Promotion endpoints for customers / storefront.
 * No authentication required — returns only active, non-deleted, PUBLIC-scope promotions.
 */
@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
@Tag(name = "Promotions (Public)", description = "Danh sách khuyến mãi dành cho khách hàng (public)")
public class PromotionController {

    private final PromotionRepository promotionRepository;
    private final PromotionService promotionService;
    private final UserRepository userRepository;

    // ======================== DTO ========================

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PublicPromotionResponse {
        private UUID id;
        private String code;
        private String name;
        private String description;
        private String discountType;
        private BigDecimal discountValue;
        private BigDecimal minOrderValue;
        private BigDecimal maxDiscountAmount;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
    }

    // ======================== ENDPOINTS ========================

    /**
     * GET /api/promotions/active — Danh sách khuyến mãi CÔNG KHAI đang hoạt động.
     * Chỉ trả về scope=PUBLIC, ẩn voucher cá nhân (PERSONAL).
     */
    @GetMapping("/active")
    @Operation(summary = "Danh sách khuyến mãi đang hoạt động (Public)",
            description = "Trả về khuyến mãi PUBLIC đang hoạt động, không yêu cầu đăng nhập. Voucher cá nhân bị ẩn.")
    public ResponseEntity<ApiResponse<List<PublicPromotionResponse>>> getActivePromotions() {
        LocalDateTime now = LocalDateTime.now();
        List<PublicPromotionResponse> list = promotionRepository
                .findByIsActiveTrueAndIsDeletedFalseAndScopeAndStartDateBeforeAndEndDateAfterOrderByCreatedAtDesc(
                        PromotionScope.PUBLIC, now, now)
                .stream()
                .map(this::toPublicResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list, "Danh sách khuyến mãi đang hoạt động"));
    }

    @PostMapping("/calculate")
    @Operation(summary = "Tính toán giảm giá", description = "Kiểm tra và tính số tiền giảm giá cho một mã khuyến mãi.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateDiscount(
            @RequestBody Map<String, Object> req,
            Authentication auth
    ) {
        String code = (String) req.get("code");
        if (code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException("Mã khuyến mãi không được trống.");
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        java.util.List<PromotionService.ItemInfo> itemInfos = new java.util.ArrayList<>();
        if (req.containsKey("items") && req.get("items") instanceof List) {
            List<?> items = (List<?>) req.get("items");
            for (Object itemObj : items) {
                if (itemObj instanceof Map) {
                    Map<?, ?> item = (Map<?, ?>) itemObj;
                    Object qtyObj = item.get("quantity");
                    Object priceObj = item.get("unitPrice");
                    Object productObj = item.get("productId");
                    Object categoryObj = item.get("categoryId");
                    if (qtyObj != null && priceObj != null) {
                        BigDecimal quantity = new BigDecimal(qtyObj.toString());
                        BigDecimal unitPrice = new BigDecimal(priceObj.toString());
                        subtotal = subtotal.add(quantity.multiply(unitPrice));
                        
                        UUID productId = null;
                        if (productObj != null) {
                            try { productId = UUID.fromString(productObj.toString()); } catch(Exception ignore) {}
                        }
                        UUID categoryId = null;
                        if (categoryObj != null) {
                            try { categoryId = UUID.fromString(categoryObj.toString()); } catch(Exception ignore) {}
                        }
                        itemInfos.add(new PromotionService.ItemInfo(productId, categoryId, quantity, unitPrice));
                    }
                }
            }
        } else if (req.containsKey("subtotal") && req.get("subtotal") != null) {
            subtotal = new BigDecimal(req.get("subtotal").toString());
        }

        User user = null;
        if (auth != null) {
            user = userRepository.findByEmail(auth.getName()).orElse(null);
        } else if (req.containsKey("customerId") && req.get("customerId") != null) {
            try {
                UUID customerId = UUID.fromString(req.get("customerId").toString());
                user = userRepository.findById(customerId).orElse(null);
            } catch (Exception e) {
                // Ignore
            }
        }

        // Look up the promotion to get its ID
        Promotion promotion = promotionRepository.findByCodeAndIsDeletedFalse(code)
                .orElseThrow(() -> new com.example.traphe_backend.exception.ResourceNotFoundException("Mã khuyến mãi '" + code + "' không tồn tại"));

        BigDecimal discount = promotionService.calculateDiscount(code, subtotal, user, itemInfos);

        Map<String, Object> data = Map.of(
            "discountAmount", discount,
            "finalAmount", subtotal.subtract(discount),
            "promotionId", promotion.getId().toString()
        );
        return ResponseEntity.ok(ApiResponse.success(data, "Tính giảm giá thành công"));
    }

    // ---- Helper ----

    private PublicPromotionResponse toPublicResponse(Promotion p) {
        return PublicPromotionResponse.builder()
                .id(p.getId())
                .code(p.getCode())
                .name(p.getName())
                .description(p.getDescription())
                .discountType(p.getDiscountType().name())
                .discountValue(p.getDiscountValue())
                .minOrderValue(p.getMinOrderValue())
                .maxDiscountAmount(p.getMaxDiscountAmount())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .build();
    }
}
