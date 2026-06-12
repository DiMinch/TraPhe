package com.example.traphe_backend.controller;

import com.example.traphe_backend.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Tag(name = "Payment Webhooks", description = "Callbacks and IPNs for VNPAY/MoMo")
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${app.vnpay.return-url}")
    private String vnpayRedirectUrl;

    // ==========================================
    // VNPAY: Return URL Callback (Client redirect)
    // ==========================================

    @GetMapping("/vnpay-callback")
    @Operation(summary = "VNPAY Redirect Callback")
    public void vnpayCallback(
            @RequestParam Map<String, String> allParams,
            HttpServletResponse response) throws IOException {
        log.info("Received VNPAY Callback: {}", allParams);

        String status = "failed";
        String responseCode = allParams.get("vnp_ResponseCode");
        if ("00".equals(responseCode)) {
            status = "success";
        }

        String orderId = allParams.get("vnp_TxnRef");

        // Redirect user to frontend return page
        String redirectTarget = vnpayRedirectUrl + "?status=" + status + "&orderId=" + orderId + "&gateway=vnpay";
        response.sendRedirect(redirectTarget);
    }

    // ==========================================
    // VNPAY: IPN Webhook (Server-to-Server)
    // ==========================================

    @GetMapping("/vnpay-ipn")
    @Operation(summary = "VNPAY IPN Webhook")
    public ResponseEntity<Map<String, String>> vnpayIpn(@RequestParam Map<String, String> allParams) {
        log.info("Received VNPAY IPN Webhook request: {}", allParams);

        Map<String, String> result = new HashMap<>();
        try {
            boolean processed = paymentService.processVnPayIpn(allParams);
            if (processed) {
                result.put("RspCode", "00");
                result.put("Message", "Confirm Success");
            } else {
                result.put("RspCode", "97");
                result.put("Message", "Invalid Checksum");
            }
        } catch (Exception e) {
            log.error("VNPAY IPN processing error", e);
            result.put("RspCode", "99");
            result.put("Message", "Input Required Required");
        }

        return ResponseEntity.ok(result);
    }

    // ==========================================
    // MoMo: IPN Webhook (Server-to-Server POST)
    // ==========================================

    @PostMapping("/momo-ipn")
    @Operation(summary = "MoMo IPN Webhook")
    public ResponseEntity<Map<String, Object>> momoIpn(@RequestBody Map<String, Object> body) {
        log.info("Received MoMo IPN Webhook request: {}", body);

        Map<String, Object> response = new HashMap<>();
        try {
            boolean processed = paymentService.processMoMoIpn(body);
            if (processed) {
                response.put("resultCode", 0);
                response.put("message", "Success");
            } else {
                response.put("resultCode", 99);
                response.put("message", "Verification Failed");
            }
        } catch (Exception e) {
            log.error("MoMo IPN processing error", e);
            response.put("resultCode", 99);
            response.put("message", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }
}
