package com.example.traphe_backend.service;

import com.example.traphe_backend.entity.LoyaltyPoint;
import com.example.traphe_backend.entity.LoyaltyPointTransaction;
import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.entity.User;
import java.math.BigDecimal;
import java.util.List;

public interface LoyaltyService {
    public void earnPointsForOrder(User customer, Order order);
    public BigDecimal redeemPoints(User customer, Order order, int pointsToRedeem);
    public void refundPointsForOrder(User user, Order order, int pointsToRefund);
    public LoyaltyPoint getOrCreateLoyaltyPoint(User user);

    /**
     * Get transaction history for a user, ordered newest first.
     */
    public List<LoyaltyPointTransaction> getTransactionsForUser(User user);
    /**
     * Redeem loyalty points for a reward voucher.
     * Business logic extracted from controller to service layer.
     */
    public RedeemRewardResult redeemReward(User user, String rewardId, String rewardName,
            int pointsCost, String rewardDescription, BigDecimal discountValue, String discountType);

    /**
     * Simple DTO for redeem reward results.
     */
    public record RedeemRewardResult(String voucherCode, String rewardName, int pointsDeducted, int remainingPoints) {}
}