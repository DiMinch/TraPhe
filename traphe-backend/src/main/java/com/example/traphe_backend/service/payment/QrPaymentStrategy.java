package com.example.traphe_backend.service.payment;

import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.enums.PaymentMethod;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class QrPaymentStrategy implements PaymentStrategy {
    @Override
    public PaymentMethod getMethod() {
        return PaymentMethod.QR;
    }

    @Override
    public String createPaymentUrl(Order order, Map<String, Object> context) {
        return "";
    }
}
