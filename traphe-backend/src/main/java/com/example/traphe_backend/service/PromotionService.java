package com.example.traphe_backend.service;

import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.entity.User;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface PromotionService {
    public record ItemInfo(UUID productId, UUID categoryId, BigDecimal quantity, BigDecimal unitPrice) {}

    public BigDecimal calculateDiscount(String code, BigDecimal orderAmount, User user);
    public BigDecimal calculateDiscount(String code, BigDecimal orderAmount, User user, List<ItemInfo> items);
    
    public BigDecimal applyPromotion(String code, Order order, User user);
    public BigDecimal applyPromotionForCombinedOrder(String code, Order primaryOrder, User user, BigDecimal combinedSubtotal);
    public void refundPromotionForOrder(Order order);
}