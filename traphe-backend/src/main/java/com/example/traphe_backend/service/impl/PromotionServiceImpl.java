package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.service.PromotionService;

import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.entity.Promotion;
import com.example.traphe_backend.entity.PromotionUsage;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.repository.PromotionRepository;
import com.example.traphe_backend.repository.PromotionUsageRepository;
import com.example.traphe_backend.repository.UserVoucherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final PromotionUsageRepository promotionUsageRepository;
    private final UserVoucherRepository userVoucherRepository;

    /**
     * Validate và tính toán số tiền giảm giá cho mã khuyến mãi.
     *
     * @param code         Mã voucher/promotion
     * @param orderAmount  Tổng tiền đơn hàng (subtotal)
     * @param user         Khách hàng đang sử dụng
     * @return Số tiền giảm giá (VND)
     */
    public BigDecimal calculateDiscount(String code, BigDecimal orderAmount, User user) {
        Promotion promotion = promotionRepository.findByCodeAndIsDeletedFalse(code)
                .orElseThrow(() -> new ResourceNotFoundException("Mã khuyến mãi '" + code + "' không tồn tại"));

        validatePromotion(promotion, orderAmount, user);

        return computeDiscountAmount(promotion, orderAmount);
    }

    /**
     * Áp dụng mã khuyến mãi lên đơn hàng.
     * Ghi nhận usage, tăng usage_count, và trả về số tiền giảm.
     */
    @Transactional
    public BigDecimal applyPromotion(String code, Order order, User user) {
        Promotion promotion = promotionRepository.findByCodeAndIsDeletedFalse(code)
                .orElseThrow(() -> new ResourceNotFoundException("Mã khuyến mãi '" + code + "' không tồn tại"));

        validatePromotion(promotion, order.getSubtotal(), user);

        BigDecimal discountAmount = computeDiscountAmount(promotion, order.getSubtotal());

        // Increment usage count (with implicit optimistic locking via BaseEntity version if available)
        promotion.setUsageCount(promotion.getUsageCount() + 1);
        promotionRepository.save(promotion);

        // Record usage
        PromotionUsage usage = PromotionUsage.builder()
                .promotion(promotion)
                .user(user)
                .order(order)
                .discountApplied(discountAmount)
                .build();
        promotionUsageRepository.save(usage);

        log.info("Applied promotion '{}' on order {} — discount {} VND for user {}",
                code, order.getOrderNumber(), discountAmount, user.getEmail());

        return discountAmount;
    }

    /**
     * Áp dụng mã khuyến mãi lên nhiều đơn hàng cùng lúc (Combined Checkout).
     * @param code Mã voucher/promotion
     * @param primaryOrder Đơn hàng chính (để ghi nhận usage)
     * @param user Khách hàng đang sử dụng
     * @param combinedSubtotal Tổng tiền của các đơn hàng gộp lại
     * @return Số tiền giảm giá (VND)
     */
    @Transactional
    public BigDecimal applyPromotionForCombinedOrder(String code, Order primaryOrder, User user, BigDecimal combinedSubtotal) {
        Promotion promotion = promotionRepository.findByCodeAndIsDeletedFalse(code)
                .orElseThrow(() -> new ResourceNotFoundException("Mã khuyến mãi '" + code + "' không tồn tại"));

        validatePromotion(promotion, combinedSubtotal, user);

        BigDecimal discountAmount = computeDiscountAmount(promotion, combinedSubtotal);

        // Increment usage count
        promotion.setUsageCount(promotion.getUsageCount() + 1);
        promotionRepository.save(promotion);

        // Record usage
        PromotionUsage usage = PromotionUsage.builder()
                .promotion(promotion)
                .user(user)
                .order(primaryOrder)
                .discountApplied(discountAmount)
                .build();
        promotionUsageRepository.save(usage);

        log.info("Applied promotion '{}' on combined order (recorded on {}) — discount {} VND for user {}",
                code, primaryOrder.getOrderNumber(), discountAmount, user.getEmail());

        return discountAmount;
    }

    // ======================== VALIDATION ========================

    private void validatePromotion(Promotion promotion, BigDecimal orderAmount, User user) {
        // 1. Kiểm tra active
        if (!promotion.isActive()) {
            throw new IllegalArgumentException("Mã khuyến mãi '" + promotion.getCode() + "' đã bị vô hiệu hoá.");
        }

        // 2. Kiểm tra thời hạn
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(promotion.getStartDate())) {
            throw new IllegalArgumentException("Mã khuyến mãi '" + promotion.getCode() + "' chưa đến ngày hiệu lực.");
        }
        if (now.isAfter(promotion.getEndDate())) {
            throw new IllegalArgumentException("Mã khuyến mãi '" + promotion.getCode() + "' đã hết hạn.");
        }

        // 3. Kiểm tra giới hạn tổng
        if (promotion.getUsageLimit() != null && promotion.getUsageCount() >= promotion.getUsageLimit()) {
            throw new IllegalArgumentException("Mã khuyến mãi '" + promotion.getCode() + "' đã hết lượt sử dụng.");
        }

        // 4. Kiểm tra giới hạn per user
        if (user == null) {
            throw new IllegalArgumentException("Bạn cần đăng nhập để sử dụng mã khuyến mãi.");
        }
        long userUsageCount = promotionUsageRepository.countByPromotionIdAndUserId(
                promotion.getId(), user.getId());
        if (userUsageCount >= promotion.getPerUserLimit()) {
            throw new IllegalArgumentException("Bạn đã sử dụng mã '" + promotion.getCode() + "' đủ " + promotion.getPerUserLimit() + " lần.");
        }

        // 5. Kiểm tra giá trị đơn hàng tối thiểu
        if (promotion.getMinOrderValue() != null
                && orderAmount.compareTo(promotion.getMinOrderValue()) < 0) {
            throw new IllegalArgumentException(
                    "Đơn hàng cần tối thiểu " + promotion.getMinOrderValue() + " VND để sử dụng mã '" + promotion.getCode() + "'.");
        }
    }

    // ======================== CALCULATION ========================

    private BigDecimal computeDiscountAmount(Promotion promotion, BigDecimal orderAmount) {
        BigDecimal discount;

        if (promotion.getDiscountType() == Promotion.DiscountType.PERCENTAGE) {
            // percentage / 100 * orderAmount
            discount = promotion.getDiscountValue()
                    .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)
                    .multiply(orderAmount)
                    .setScale(0, RoundingMode.DOWN);

            // Cap at maxDiscountAmount
            if (promotion.getMaxDiscountAmount() != null
                    && discount.compareTo(promotion.getMaxDiscountAmount()) > 0) {
                discount = promotion.getMaxDiscountAmount();
            }
        } else {
            // FIXED_AMOUNT
            discount = promotion.getDiscountValue();
        }

        // Discount cannot exceed order amount
        if (discount.compareTo(orderAmount) > 0) {
            discount = orderAmount;
        }

        return discount;
    }

    @Transactional
    public void refundPromotionForOrder(Order order) {
        promotionUsageRepository.findByOrderId(order.getId()).ifPresent(usage -> {
            Promotion promotion = usage.getPromotion();
            if (promotion.getUsageCount() > 0) {
                promotion.setUsageCount(promotion.getUsageCount() - 1);
                promotionRepository.save(promotion);
            }
            
            // Re-activate UserVoucher if this was a personal voucher
            if (usage.getUser() != null) {
                userVoucherRepository.findByUserIdAndPromotionId(usage.getUser().getId(), promotion.getId())
                    .ifPresent(voucher -> {
                        if (voucher.getStatus() == com.example.traphe_backend.enums.UserVoucherStatus.USED) {
                            voucher.setStatus(com.example.traphe_backend.enums.UserVoucherStatus.AVAILABLE);
                            voucher.setUsedAt(null);
                            userVoucherRepository.save(voucher);
                            log.info("Order {} cancelled — Reactivated UserVoucher for user {}", order.getOrderNumber(), usage.getUser().getEmail());
                        }
                    });
            }

            promotionUsageRepository.delete(usage);
            log.info("Order {} cancelled — Refunded promotion {}", order.getOrderNumber(), promotion.getCode());
        });
    }
}
