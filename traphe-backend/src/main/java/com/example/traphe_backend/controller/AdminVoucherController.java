package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.entity.Promotion;
import com.example.traphe_backend.enums.PromotionScope;
import com.example.traphe_backend.repository.PromotionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin/vouchers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Vouchers", description = "Quản lý đợt phát hành Voucher batch (Chỉ Admin)")
public class AdminVoucherController {

    private final PromotionRepository promotionRepository;

    @Data
    @NoArgsConstructor
    public static class VoucherBatchRequest {
        @NotBlank private String batchName;
        @NotBlank private String prefix;
        @Min(1) private int quantity;
        @NotNull private Promotion.DiscountType discountType;
        @NotNull @DecimalMin("0") private BigDecimal discountValue;
        private BigDecimal minOrderValue;
        private BigDecimal maxDiscount;
        @NotNull private LocalDateTime startDate;
        @NotNull private LocalDateTime endDate;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class VoucherBatchResponse {
        private String batchName;
        private String prefix;
        private int quantity;
        private List<String> codes;
    }

    @PostMapping("/batch")
    @Operation(summary = "Tạo batch voucher", description = "Tạo tự động hàng loạt mã voucher dùng 1 lần")
    public ResponseEntity<ApiResponse<VoucherBatchResponse>> createBatch(@Valid @RequestBody VoucherBatchRequest req) {
        List<Promotion> generatedPromotions = new ArrayList<>();
        List<String> codes = new ArrayList<>();

        for (int i = 0; i < req.getQuantity(); i++) {
            String code = req.getPrefix().toUpperCase() + "-" + generateRandomSuffix();
            codes.add(code);

            Promotion p = Promotion.builder()
                    .code(code)
                    .name(req.getBatchName() + " (" + (i + 1) + ")")
                    .description("Voucher thuộc đợt: " + req.getBatchName())
                    .discountType(req.getDiscountType())
                    .discountValue(req.getDiscountValue())
                    .minOrderValue(req.getMinOrderValue())
                    .maxDiscountAmount(req.getMaxDiscount())
                    .usageLimit(1) // Mỗi mã chỉ dùng 1 lần
                    .perUserLimit(1)
                    .startDate(req.getStartDate())
                    .endDate(req.getEndDate())
                    .scope(PromotionScope.PERSONAL) // Ẩn khỏi public endpoint
                    .build();
            generatedPromotions.add(p);
        }

        promotionRepository.saveAll(generatedPromotions);

        VoucherBatchResponse response = VoucherBatchResponse.builder()
                .batchName(req.getBatchName())
                .prefix(req.getPrefix())
                .quantity(req.getQuantity())
                .codes(codes)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response, "Đã tạo batch voucher thành công"));
    }

    private String generateRandomSuffix() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 5; i++) {
            int index = (int) (Math.random() * chars.length());
            sb.append(chars.charAt(index));
        }
        return sb.toString();
    }
}
