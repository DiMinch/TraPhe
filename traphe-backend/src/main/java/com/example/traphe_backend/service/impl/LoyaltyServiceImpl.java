package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.service.LoyaltyService;

import com.example.traphe_backend.entity.LoyaltyPoint;
import com.example.traphe_backend.entity.LoyaltyPointTransaction;
import com.example.traphe_backend.entity.MembershipTier;
import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.enums.LoyaltyTransactionType;
import com.example.traphe_backend.repository.LoyaltyPointRepository;
import com.example.traphe_backend.repository.LoyaltyPointTransactionRepository;
import com.example.traphe_backend.repository.MembershipTierRepository;
import com.example.traphe_backend.event.TierUpgradeEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoyaltyServiceImpl implements LoyaltyService {

        private final LoyaltyPointRepository loyaltyPointRepository;
        private final LoyaltyPointTransactionRepository loyaltyPointTransactionRepository;
        private final MembershipTierRepository membershipTierRepository;
        private final ApplicationEventPublisher eventPublisher;

        private static final BigDecimal POINT_UNIT = new BigDecimal("1000"); // 1 point per 1,000 VND (base rate)

        // ======================== EARN POINTS ========================

        /**
         * Tích điểm khi đơn hàng COMPLETED.
         * Công thức: points = (finalAmount / 1000) × pointEarningRate
         * Đồng thời cộng dồn totalSpending và kiểm tra nâng hạng.
         */
        @Transactional
        public void earnPointsForOrder(User customer, Order order) {
                if (customer == null || order.getFinalAmount() == null)
                        return;
                if (order.getFinalAmount().compareTo(BigDecimal.ZERO) <= 0)
                        return;

                // Use PESSIMISTIC_WRITE lock to prevent race conditions
                LoyaltyPoint loyaltyPoint = getOrCreateLoyaltyPointForUpdate(customer);

                // Determine earning rate from membership tier
                BigDecimal earningRate = BigDecimal.ONE; // Default base rate
                if (loyaltyPoint.getMembershipTier() != null) {
                        earningRate = loyaltyPoint.getMembershipTier().getPointEarningRate();
                }

                // Calculate points earned
                int pointsEarned = order.getFinalAmount()
                                .divide(POINT_UNIT, 0, RoundingMode.DOWN)
                                .multiply(earningRate)
                                .intValue();

                if (pointsEarned <= 0)
                        return;

                // Update points
                loyaltyPoint.setPointsAvailable(loyaltyPoint.getPointsAvailable() + pointsEarned);

                // Update total spending
                BigDecimal newTotalSpending = loyaltyPoint.getTotalSpending().add(order.getFinalAmount());
                loyaltyPoint.setTotalSpending(newTotalSpending);

                loyaltyPointRepository.save(loyaltyPoint);

                // Record transaction
                LoyaltyPointTransaction transaction = LoyaltyPointTransaction.builder()
                                .user(customer)
                                .order(order)
                                .type(LoyaltyTransactionType.EARN)
                                .points(pointsEarned)
                                .description("Tích " + pointsEarned + " điểm từ đơn " + order.getOrderNumber()
                                                + " (" + order.getFinalAmount() + " VND)")
                                .build();
                loyaltyPointTransactionRepository.save(transaction);

                log.info("User {} earned {} loyalty points from order {} (rate: {}x)",
                                customer.getEmail(), pointsEarned, order.getOrderNumber(), earningRate);

                // Check tier upgrade
                checkAndUpgradeTier(loyaltyPoint, customer);
        }

        // ======================== REDEEM POINTS ========================

        /**
         * Tiêu điểm tại Checkout.
         * Quy đổi: 1 điểm = 1,000 VND.
         * 
         * @return Số tiền được giảm (VND)
         */
        @Transactional
        public BigDecimal redeemPoints(User customer, Order order, int pointsToRedeem) {
                if (pointsToRedeem <= 0)
                        return BigDecimal.ZERO;

                // Use PESSIMISTIC_WRITE lock to prevent race conditions (e.g. double spend)
                LoyaltyPoint loyaltyPoint = getOrCreateLoyaltyPointForUpdate(customer);

                if (loyaltyPoint.getPointsAvailable() < pointsToRedeem) {
                        throw new IllegalArgumentException(
                                        "Không đủ điểm. Hiện có: " + loyaltyPoint.getPointsAvailable()
                                                         + ", yêu cầu: " + pointsToRedeem);
                }

                // Deduct points
                loyaltyPoint.setPointsAvailable(loyaltyPoint.getPointsAvailable() - pointsToRedeem);
                loyaltyPointRepository.save(loyaltyPoint);

                // Record transaction
                BigDecimal discountAmount = BigDecimal.valueOf(pointsToRedeem).multiply(POINT_UNIT);

                LoyaltyPointTransaction transaction = LoyaltyPointTransaction.builder()
                                .user(customer)
                                .order(order)
                                .type(LoyaltyTransactionType.REDEEM)
                                .points(-pointsToRedeem)
                                .description("Đổi " + pointsToRedeem + " điểm = giảm " + discountAmount
                                                + " VND trên đơn " + order.getOrderNumber())
                                .build();
                loyaltyPointTransactionRepository.save(transaction);

                log.info("User {} redeemed {} points for {} VND discount on order {}",
                                customer.getEmail(), pointsToRedeem, discountAmount, order.getOrderNumber());

                return discountAmount;
        }

        // ======================== REFUND POINTS ========================

        @Transactional
        public void refundPointsForOrder(User user, Order order, int pointsToRefund) {
                if (pointsToRefund <= 0)
                        return;

                // Use PESSIMISTIC_WRITE lock to prevent race conditions
                LoyaltyPoint loyaltyPoint = getOrCreateLoyaltyPointForUpdate(user);

                // Update points
                loyaltyPoint.setPointsAvailable(loyaltyPoint.getPointsAvailable() + pointsToRefund);
                loyaltyPointRepository.save(loyaltyPoint);

                // Record transaction
                LoyaltyPointTransaction transaction = LoyaltyPointTransaction.builder()
                                .user(user)
                                .order(order)
                                .type(LoyaltyTransactionType.REFUND)
                                .points(pointsToRefund)
                                .description("Hoàn " + pointsToRefund + " điểm từ đơn huỷ " + order.getOrderNumber())
                                .build();
                loyaltyPointTransactionRepository.save(transaction);

                log.info("Refunded {} loyalty points for user {} (Order: {})", pointsToRefund, user.getEmail(),
                                order.getOrderNumber());
        }

        // ======================== TIER MANAGEMENT ========================

        /**
         * Kiểm tra và nâng hạng thành viên dựa trên tổng chi tiêu.
         */
        private void checkAndUpgradeTier(LoyaltyPoint loyaltyPoint, User customer) {
                MembershipTier currentTier = loyaltyPoint.getMembershipTier();

                membershipTierRepository
                                .findFirstByIsActiveTrueAndIsDeletedFalseAndMinSpendingLessThanEqualOrderByTierLevelDesc(
                                                loyaltyPoint.getTotalSpending())
                                .ifPresent(eligibleTier -> {
                                         if (currentTier == null
                                                         || eligibleTier.getTierLevel() > currentTier.getTierLevel()) {
                                                 loyaltyPoint.setMembershipTier(eligibleTier);
                                                 loyaltyPointRepository.save(loyaltyPoint);

                                                 log.info("🎉 User {} upgraded to tier '{}' (total spending: {} VND)",
                                                                 customer.getEmail(), eligibleTier.getName(),
                                                                 loyaltyPoint.getTotalSpending());
                                                 eventPublisher.publishEvent(new TierUpgradeEvent(this, customer, eligibleTier));
                                         }
                                });
        }

        public LoyaltyPoint getOrCreateLoyaltyPoint(User user) {
                LoyaltyPoint lp = loyaltyPointRepository.findByUserId(user.getId()).orElse(null);
                if (lp == null) {
                        // Find lowest tier (if any) as default
                        MembershipTier defaultTier = membershipTierRepository
                                        .findByIsActiveTrueAndIsDeletedFalseOrderByTierLevelAsc()
                                        .stream().findFirst().orElse(null);

                        LoyaltyPoint newRecord = LoyaltyPoint.builder()
                                        .user(user)
                                        .pointsAvailable(0)
                                        .totalSpending(BigDecimal.ZERO)
                                        .membershipTier(defaultTier)
                                        .build();
                        return loyaltyPointRepository.save(newRecord);
                }

                if (lp.getMembershipTier() == null) {
                        MembershipTier defaultTier = membershipTierRepository
                                        .findByIsActiveTrueAndIsDeletedFalseOrderByTierLevelAsc()
                                        .stream().findFirst().orElse(null);
                        if (defaultTier != null) {
                                lp.setMembershipTier(defaultTier);
                                lp = loyaltyPointRepository.save(lp);
                        }
                }
                return lp;
        }

        private LoyaltyPoint getOrCreateLoyaltyPointForUpdate(User user) {
                LoyaltyPoint lp = loyaltyPointRepository.findByUserIdForUpdate(user.getId()).orElse(null);
                if (lp == null) {
                        // Fallback to standard creation (which saves it under transaction)
                        return getOrCreateLoyaltyPoint(user);
                }

                if (lp.getMembershipTier() == null) {
                        MembershipTier defaultTier = membershipTierRepository
                                        .findByIsActiveTrueAndIsDeletedFalseOrderByTierLevelAsc()
                                        .stream().findFirst().orElse(null);
                        if (defaultTier != null) {
                                lp.setMembershipTier(defaultTier);
                                lp = loyaltyPointRepository.save(lp);
                        }
                }
                return lp;
        }
}
