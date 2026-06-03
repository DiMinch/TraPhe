package com.example.traphe_backend;

import com.example.traphe_backend.entity.Branch;
import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.enums.PaymentMethod;
import com.example.traphe_backend.enums.PaymentStatus;
import com.example.traphe_backend.repository.OrderRepository;
import com.example.traphe_backend.repository.PaymentTransactionRepository;
import com.example.traphe_backend.service.impl.PaymentServiceImpl;
import com.example.traphe_backend.util.MoMoUtil;
import com.example.traphe_backend.util.VnPayUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class PaymentServiceTest {

    @InjectMocks
    private PaymentServiceImpl paymentService;

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @Mock
    private OrderRepository orderRepository;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);

        // Inject configuration values manually for unit testing
        ReflectionTestUtils.setField(paymentService, "vnpayTmnCode", "DEMOV210");
        ReflectionTestUtils.setField(paymentService, "vnpayHashSecret", "TEST_SECRET_KEY_123");
        ReflectionTestUtils.setField(paymentService, "vnpayUrl", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        ReflectionTestUtils.setField(paymentService, "vnpayReturnUrl", "http://localhost:5173/order/payment-callback");

        ReflectionTestUtils.setField(paymentService, "momoPartnerCode", "MOMO");
        ReflectionTestUtils.setField(paymentService, "momoAccessKey", "ACCESS_KEY");
        ReflectionTestUtils.setField(paymentService, "momoSecretKey", "SECRET_KEY");
        ReflectionTestUtils.setField(paymentService, "momoUrl", "https://test-payment.momo.vn/v2/gateway/api/create");
        ReflectionTestUtils.setField(paymentService, "momoReturnUrl", "http://localhost:5173/order/payment-callback");
        ReflectionTestUtils.setField(paymentService, "momoIpnUrl", "http://localhost:8080/api/payment/momo-ipn");
    }

    @Test
    public void testVnPayUrlGeneration() {
        Branch branch = new Branch();
        branch.setName("Chi nhanh Test");

        Order order = Order.builder()
                .orderNumber("TP-20260520-1111")
                .finalAmount(new BigDecimal("150000")) // 150,000 VND
                .paymentMethod(PaymentMethod.VNPAY)
                .paymentStatus(PaymentStatus.PENDING)
                .branch(branch)
                .build();
        order.setId(UUID.randomUUID());

        String payUrl = paymentService.createVnPayPaymentUrl(order, "127.0.0.1");

        assertNotNull(payUrl);
        assertTrue(payUrl.startsWith("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"));
        assertTrue(payUrl.contains("vnp_TmnCode=DEMOV210"));
        assertTrue(payUrl.contains("vnp_Amount=15000000")); // Cent-based: 150000 * 100
        assertTrue(payUrl.contains("vnp_SecureHash="));
    }

    @Test
    public void testVnPayHashAlgorithm() {
        String secret = "SECRET";
        Map<String, String> fields = new HashMap<>();
        fields.put("vnp_Version", "2.1.0");
        fields.put("vnp_Command", "pay");
        fields.put("vnp_TmnCode", "DEMOV210");

        String hash = VnPayUtil.hashAllFields(fields, secret);
        assertNotNull(hash);
        assertFalse(hash.isEmpty());
    }

    @Test
    public void testMoMoSignatureCreation() {
        String key = "SECRET";
        String rawData = "accessKey=KEY&amount=1000&partnerCode=MOMO";
        String signature = MoMoUtil.hmacSHA256(key, rawData);
        assertNotNull(signature);
        assertFalse(signature.isEmpty());
    }
}
