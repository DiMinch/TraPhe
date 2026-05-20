package com.example.traphe_backend.service;

import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.entity.PaymentTransaction;
import com.example.traphe_backend.enums.PaymentMethod;
import com.example.traphe_backend.enums.PaymentStatus;
import com.example.traphe_backend.enums.PaymentTransactionType;
import com.example.traphe_backend.repository.OrderRepository;
import com.example.traphe_backend.repository.PaymentTransactionRepository;
import com.example.traphe_backend.util.MoMoUtil;
import com.example.traphe_backend.util.VnPayUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderRepository orderRepository;

    @Value("${app.vnpay.tmn-code}")
    private String vnpayTmnCode;

    @Value("${app.vnpay.hash-secret}")
    private String vnpayHashSecret;

    @Value("${app.vnpay.url}")
    private String vnpayUrl;

    @Value("${app.vnpay.return-url}")
    private String vnpayReturnUrl;

    @Value("${app.momo.partner-code}")
    private String momoPartnerCode;

    @Value("${app.momo.access-key}")
    private String momoAccessKey;

    @Value("${app.momo.secret-key}")
    private String momoSecretKey;

    @Value("${app.momo.url}")
    private String momoUrl;

    @Value("${app.momo.return-url}")
    private String momoReturnUrl;

    @Value("${app.momo.ipn-url}")
    private String momoIpnUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // ==========================================
    // VNPAY: Create Payment URL
    // ==========================================

    public String createVnPayPaymentUrl(Order order, String ipAddress) {
        try {
            String vnp_Version = "2.1.0";
            String vnp_Command = "pay";
            String vnp_OrderInfo = "Thanh toan don hang TraPhe #" + order.getOrderNumber();
            String orderType = "other";
            String vnp_TxnRef = order.getId().toString();
            
            // Amount in cents (VND multiplied by 100)
            long amount = order.getFinalAmount().multiply(new BigDecimal("100")).longValue();

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", vnp_Version);
            vnp_Params.put("vnp_Command", vnp_Command);
            vnp_Params.put("vnp_TmnCode", vnpayTmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(amount));
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
            vnp_Params.put("vnp_OrderType", orderType);
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", vnpayReturnUrl);
            vnp_Params.put("vnp_IpAddr", ipAddress != null ? ipAddress : "127.0.0.1");

            // Timestamps in GMT+7
            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT-7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            // Sort & hash
            List<String> fieldNames = new java.util.ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            for (int i = 0; i < fieldNames.size(); i++) {
                String fieldName = fieldNames.get(i);
                String fieldValue = vnp_Params.get(fieldName);
                if (fieldValue != null && fieldValue.length() > 0) {
                    // Query string
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                    // Hash data
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                    if (i < fieldNames.size() - 1) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }

            String queryUrl = query.toString();
            String vnp_SecureHash = VnPayUtil.hmacSHA512(vnpayHashSecret, hashData.toString());
            queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

            return vnpayUrl + "?" + queryUrl;

        } catch (Exception e) {
            log.error("Failed to generate VNPAY Payment URL: {}", e.getMessage());
            return "";
        }
    }

    // ==========================================
    // MoMo: Create Payment URL
    // ==========================================

    public String createMoMoPaymentUrl(Order order) {
        try {
            String requestId = UUID.randomUUID().toString();
            String orderId = order.getId().toString();
            String orderInfo = "Thanh toan don hang TraPhe #" + order.getOrderNumber();
            long amount = order.getFinalAmount().longValue();
            String requestType = "captureWallet";
            String extraData = "";

            // AccessKey, Amount, ExtraData, IpnUrl, OrderId, OrderInfo, PartnerCode, RedirectUrl, RequestId, RequestType
            String rawSignature = "accessKey=" + momoAccessKey +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&ipnUrl=" + momoIpnUrl +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + momoPartnerCode +
                    "&redirectUrl=" + momoReturnUrl +
                    "&requestId=" + requestId +
                    "&requestType=" + requestType;

            String signature = MoMoUtil.hmacSHA256(momoSecretKey, rawSignature);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("partnerCode", momoPartnerCode);
            requestBody.put("partnerName", "TraPhe Coffee");
            requestBody.put("storeId", "TraPheStore");
            requestBody.put("requestId", requestId);
            requestBody.put("amount", amount);
            requestBody.put("orderId", orderId);
            requestBody.put("orderInfo", orderInfo);
            requestBody.put("redirectUrl", momoReturnUrl);
            requestBody.put("ipnUrl", momoIpnUrl);
            requestBody.put("lang", "vi");
            requestBody.put("extraData", extraData);
            requestBody.put("requestType", requestType);
            requestBody.put("signature", signature);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("Sending payload to MoMo sandbox gateway: {}", requestBody);
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(momoUrl, entity, (Class<Map<String, Object>>)(Class<?>)Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                if (body.containsKey("payUrl")) {
                    return (String) body.get("payUrl");
                }
                log.error("MoMo response did not contain payUrl: {}", body);
            }
            return "";

        } catch (Exception e) {
            log.error("Failed to generate MoMo Payment URL: {}", e.getMessage());
            return "";
        }
    }

    // ==========================================
    // Process Refund
    // ==========================================

    @Transactional
    public void processRefund(Order order, BigDecimal refundAmount) {
        if (refundAmount == null || refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

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

    // ==========================================
    // Webhook IPN Callback Handlers
    // ==========================================

    @Transactional
    public boolean processVnPayIpn(Map<String, String> params) {
        // 1. Verify Signature
        String vnp_SecureHash = params.get("vnp_SecureHash");
        if (vnp_SecureHash == null) return false;

        // Remove signature params to hash
        Map<String, String> hashParams = params.entrySet().stream()
                .filter(e -> !e.getKey().equals("vnp_SecureHash") && !e.getKey().equals("vnp_SecureHashType"))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        String calculatedHash = VnPayUtil.hashAllFields(hashParams, vnpayHashSecret);
        if (!vnp_SecureHash.equalsIgnoreCase(calculatedHash)) {
            log.warn("VNPAY IPN Signature verification failed. Calculated: {}, Got: {}", calculatedHash, vnp_SecureHash);
            return false;
        }

        // 2. Fetch Order
        String orderIdStr = params.get("vnp_TxnRef");
        if (orderIdStr == null) return false;

        UUID orderId = UUID.fromString(orderIdStr);
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            log.error("Order not found for VNPAY IPN: {}", orderId);
            return false;
        }

        // Check amount match (VNPAY sends cents, so multiply db amount by 100)
        long vnpAmount = Long.parseLong(params.get("vnp_Amount"));
        long expectedAmount = order.getFinalAmount().multiply(new BigDecimal("100")).longValue();
        if (vnpAmount != expectedAmount) {
            log.warn("VNPAY IPN Amount mismatch. Expected cents: {}, Got cents: {}", expectedAmount, vnpAmount);
            return false;
        }

        // Check current payment status
        if (order.getPaymentStatus() == PaymentStatus.COMPLETED) {
            log.info("Order {} already processed.", order.getOrderNumber());
            return true; // Already processed
        }

        // 3. Process payment status
        String responseCode = params.get("vnp_ResponseCode");
        if ("00".equals(responseCode)) {
            order.setPaymentStatus(PaymentStatus.COMPLETED);
            orderRepository.save(order);

            // Record transaction
            PaymentTransaction tx = PaymentTransaction.builder()
                    .order(order)
                    .type(PaymentTransactionType.PAYMENT)
                    .paymentMethod(PaymentMethod.VNPAY)
                    .amount(order.getFinalAmount())
                    .transactionId(params.get("vnp_TransactionNo"))
                    .description("Thanh toan VNPAY thanh cong")
                    .build();
            paymentTransactionRepository.save(tx);

            log.info("VNPAY Payment completed successfully for Order: {}", order.getOrderNumber());
        } else {
            order.setPaymentStatus(PaymentStatus.FAILED);
            orderRepository.save(order);
            log.warn("VNPAY Payment failed for Order: {} with response code: {}", order.getOrderNumber(), responseCode);
        }

        return true;
    }

    @Transactional
    public boolean processMoMoIpn(Map<String, Object> params) {
        // 1. Verify Signature
        String momoSignature = (String) params.get("signature");
        if (momoSignature == null) return false;

        // accessKey=xxx&amount=xxx&extraData=xxx&message=xxx&orderId=xxx&orderInfo=xxx&partnerCode=xxx&requestId=xxx&responseTime=xxx&resultCode=xxx&payType=xxx
        String rawSignature = "accessKey=" + momoAccessKey +
                "&amount=" + params.get("amount") +
                "&extraData=" + params.get("extraData") +
                "&message=" + params.get("message") +
                "&orderId=" + params.get("orderId") +
                "&orderInfo=" + params.get("orderInfo") +
                "&partnerCode=" + params.get("partnerCode") +
                "&requestId=" + params.get("requestId") +
                "&responseTime=" + params.get("responseTime") +
                "&resultCode=" + params.get("resultCode") +
                "&payType=" + params.get("payType");

        String calculatedHash = MoMoUtil.hmacSHA256(momoSecretKey, rawSignature);
        if (!momoSignature.equalsIgnoreCase(calculatedHash)) {
            log.warn("MoMo IPN Signature verification failed. Calculated: {}, Got: {}", calculatedHash, momoSignature);
            return false;
        }

        // 2. Fetch Order
        String orderIdStr = (String) params.get("orderId");
        if (orderIdStr == null) return false;

        UUID orderId = UUID.fromString(orderIdStr);
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            log.error("Order not found for MoMo IPN: {}", orderId);
            return false;
        }

        // Check amount match
        long momoAmount = ((Number) params.get("amount")).longValue();
        long expectedAmount = order.getFinalAmount().longValue();
        if (momoAmount != expectedAmount) {
            log.warn("MoMo IPN Amount mismatch. Expected: {}, Got: {}", expectedAmount, momoAmount);
            return false;
        }

        if (order.getPaymentStatus() == PaymentStatus.COMPLETED) {
            log.info("Order {} already processed.", order.getOrderNumber());
            return true;
        }

        // 3. Process payment status
        int resultCode = ((Number) params.get("resultCode")).intValue();
        if (resultCode == 0) {
            order.setPaymentStatus(PaymentStatus.COMPLETED);
            orderRepository.save(order);

            // Record transaction
            PaymentTransaction tx = PaymentTransaction.builder()
                    .order(order)
                    .type(PaymentTransactionType.PAYMENT)
                    .paymentMethod(PaymentMethod.MOMO)
                    .amount(order.getFinalAmount())
                    .transactionId(String.valueOf(params.get("transId")))
                    .description("Thanh toan MoMo thanh cong")
                    .build();
            paymentTransactionRepository.save(tx);

            log.info("MoMo Payment completed successfully for Order: {}", order.getOrderNumber());
        } else {
            order.setPaymentStatus(PaymentStatus.FAILED);
            orderRepository.save(order);
            log.warn("MoMo Payment failed for Order: {} with result code: {}", order.getOrderNumber(), resultCode);
        }

        return true;
    }
}
