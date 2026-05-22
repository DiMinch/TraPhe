package com.example.traphe_backend.service;

import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.entity.User;
import java.math.BigDecimal;

public interface PromotionService {
    public BigDecimal calculateDiscount(String code, BigDecimal orderAmount, User user);
    public BigDecimal applyPromotion(String code, Order order, User user);
    public BigDecimal applyPromotionForCombinedOrder(String code, Order primaryOrder, User user, BigDecimal combinedSubtotal);
    public void refundPromotionForOrder(Order order);
}