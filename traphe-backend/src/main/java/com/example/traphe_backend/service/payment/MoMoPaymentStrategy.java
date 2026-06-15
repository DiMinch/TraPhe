package com.example.traphe_backend.service.payment;

import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.enums.PaymentMethod;
import com.example.traphe_backend.util.MoMoUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
public class MoMoPaymentStrategy implements PaymentStrategy {

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

    @Override
    public PaymentMethod getMethod() {
        return PaymentMethod.MOMO;
    }

    @Override
    public String createPaymentUrl(Order order, Map<String, Object> context) {
        try {
            String requestId = UUID.randomUUID().toString();
            String orderId = order.getId().toString();
            String orderInfo = "Thanh toan don hang TraPhe #" + order.getOrderNumber();
            long amount = order.getFinalAmount().longValue();
            String requestType = "captureWallet";
            String extraData = "";

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
}
