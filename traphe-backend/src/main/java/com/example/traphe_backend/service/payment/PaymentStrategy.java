package com.example.traphe_backend.service.payment;

import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.enums.PaymentMethod;
import java.util.Map;

public interface PaymentStrategy {
    PaymentMethod getMethod();
    String createPaymentUrl(Order order, Map<String, Object> context);
}
