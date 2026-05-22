package com.example.traphe_backend.service;

import com.example.traphe_backend.entity.LoyaltyPoint;
import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.entity.User;
import java.math.BigDecimal;

public interface LoyaltyService {
    public void earnPointsForOrder(User customer, Order order);
    public BigDecimal redeemPoints(User customer, Order order, int pointsToRedeem);
    public void refundPointsForOrder(User user, Order order, int pointsToRefund);
    public LoyaltyPoint getOrCreateLoyaltyPoint(User user);
}