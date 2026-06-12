package com.example.traphe_backend.listener;

import com.example.traphe_backend.entity.Promotion;
import com.example.traphe_backend.entity.UserVoucher;
import com.example.traphe_backend.enums.PromotionScope;
import com.example.traphe_backend.enums.UserVoucherStatus;
import com.example.traphe_backend.event.TierUpgradeEvent;
import com.example.traphe_backend.repository.PromotionRepository;
import com.example.traphe_backend.repository.UserVoucherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class TierUpgradeListener {

    private final PromotionRepository promotionRepository;
    private final UserVoucherRepository userVoucherRepository;

    @EventListener
    @Transactional
    public void handleTierUpgradeEvent(TierUpgradeEvent event) {
        log.info("Handling TierUpgradeEvent for user: {}, new tier: {}", event.getUser().getEmail(), event.getNewTier().getName());

        String promotionCode = "UPGRADE-" + event.getNewTier().getTierLevel();
        
        // Find or create a promotion template for this tier
        Promotion promotion = promotionRepository.findByCodeAndIsDeletedFalse(promotionCode)
                .orElseGet(() -> {
                    Promotion newPromo = Promotion.builder()
                            .code(promotionCode)
                            .name("Voucher Chúc Mừng Thăng Hạng " + event.getNewTier().getName())
                            .description("Tặng voucher 20% chúc mừng bạn đã đạt hạng " + event.getNewTier().getName())
                            .discountType(Promotion.DiscountType.PERCENTAGE)
                            .discountValue(new BigDecimal("20.00")) // 20% discount
                            .minOrderValue(BigDecimal.ZERO)
                            .maxDiscountAmount(new BigDecimal("50000.00")) // Max 50k
                            .usageLimit(10000) // Virtually unlimited total uses, but 1 per user
                            .perUserLimit(1)
                            .startDate(LocalDateTime.now())
                            .endDate(LocalDateTime.now().plusYears(10)) // Valid for 10 years
                            .scope(PromotionScope.PERSONAL)
                            .build();
                    return promotionRepository.save(newPromo);
                });

        // Check if user already got this tier's voucher
        boolean alreadyGot = userVoucherRepository.existsByUserIdAndPromotionId(event.getUser().getId(), promotion.getId());
        if (!alreadyGot) {
            UserVoucher userVoucher = UserVoucher.builder()
                    .user(event.getUser())
                    .promotion(promotion)
                    .status(UserVoucherStatus.AVAILABLE)
                    .source("TIER_UPGRADE")
                    .assignedAt(LocalDateTime.now())
                    .build();
            userVoucherRepository.save(userVoucher);
            log.info("Granted voucher {} to user {}", promotion.getCode(), event.getUser().getEmail());
        }
    }
}
