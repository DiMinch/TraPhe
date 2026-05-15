package com.example.traphe_backend.service;

import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.entity.PaymentTransaction;
import com.example.traphe_backend.enums.PaymentTransactionType;
import com.example.traphe_backend.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentTransactionRepository paymentTransactionRepository;

    @Transactional
    public void processRefund(Order order, BigDecimal refundAmount) {
        if (refundAmount == null || refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        // Mock gateway call
        String gatewayTransactionId = "REFUND-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        log.info("Mock Gateway -> Processing refund of {} for order {}. Generated RxID: {}", refundAmount, order.getOrderNumber(), gatewayTransactionId);

        PaymentTransaction refundRecord = PaymentTransaction.builder()
                .order(order)
                .type(PaymentTransactionType.REFUND)
                .paymentMethod(order.getPaymentMethod())
                .amount(refundAmount)
                .transactionId(gatewayTransactionId)
                .description("Hoàn tiền đơn huỷ " + order.getOrderNumber())
                .build();

        paymentTransactionRepository.save(refundRecord);

        log.info("Saved refund payment transaction for order {}", order.getOrderNumber());
    }
}
