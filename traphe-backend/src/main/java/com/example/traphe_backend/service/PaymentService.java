package com.example.traphe_backend.service;

import com.example.traphe_backend.entity.Order;
import java.math.BigDecimal;
import java.util.Map;

public interface PaymentService {
    public String createPaymentUrl(Order order, Map<String, Object> context);
    @Deprecated
    public String createVnPayPaymentUrl(Order order, String ipAddress);
    @Deprecated
    public String createMoMoPaymentUrl(Order order);
    public void processRefund(Order order, BigDecimal refundAmount);
    public boolean processVnPayIpn(Map<String, String> params);
    public boolean processMoMoIpn(Map<String, Object> params);
}