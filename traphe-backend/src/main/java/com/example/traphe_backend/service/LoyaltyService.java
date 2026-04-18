package com.example.traphe_backend.service;

import com.example.traphe_backend.entity.LoyaltyPoint;
import com.example.traphe_backend.entity.LoyaltyPointTransaction;
import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.enums.LoyaltyTransactionType;
import com.example.traphe_backend.repository.LoyaltyPointRepository;
import com.example.traphe_backend.repository.LoyaltyPointTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoyaltyService {

    private final LoyaltyPointRepository loyaltyPointRepository;
    private final LoyaltyPointTransactionRepository loyaltyPointTransactionRepository;

    @Transactional
    public void refundPointsForOrder(User user, Order order, int pointsToRefund) {
        if (pointsToRefund <= 0) return;

        // Fetch or create loyalty point
        LoyaltyPoint loyaltyPoint = loyaltyPointRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    LoyaltyPoint newRecord = LoyaltyPoint.builder()
                            .user(user)
                            .pointsAvailable(0)
                            .build();
                    return loyaltyPointRepository.save(newRecord);
                });

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

        log.info("Refunded {} loyalty points for user {} (Order: {})", pointsToRefund, user.getEmail(), order.getOrderNumber());
    }
}
