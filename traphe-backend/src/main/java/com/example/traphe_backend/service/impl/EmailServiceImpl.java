package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.service.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Email Service — sends OTP emails via configured SMTP (Mailtrap sandbox).
 * When MAIL_USERNAME is empty, OTP is logged to console only (dev mode).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    /**
     * Send email verification OTP.
     */
    @Override
    @Async("virtualThreadExecutor")
    public void sendVerificationOtp(String toEmail, String otp) {
        String subject = "[TraPhe] Xác thực email của bạn";
        String body = String.format(
                "Chào bạn,\n\n" +
                "Mã OTP xác thực email của bạn là: %s\n\n" +
                "Mã có hiệu lực trong 5 phút.\n\n" +
                "Nếu bạn không yêu cầu xác thực này, hãy bỏ qua email này.\n\n" +
                "Trân trọng,\nĐội ngũ TraPhe",
                otp
        );
        sendEmail(toEmail, subject, body);
    }

    /**
     * Send password reset OTP.
     */
    @Override
    @Async("virtualThreadExecutor")
    public void sendPasswordResetOtp(String toEmail, String otp) {
        String subject = "[TraPhe] Đặt lại mật khẩu";
        String body = String.format(
                "Chào bạn,\n\n" +
                "Mã OTP để đặt lại mật khẩu của bạn là: %s\n\n" +
                "Mã có hiệu lực trong 5 phút.\n\n" +
                "Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.\n\n" +
                "Trân trọng,\nĐội ngũ TraPhe",
                otp
        );
        sendEmail(toEmail, subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        if (fromEmail == null || fromEmail.isBlank()) {
            // Dev mode — log to console instead of sending
            log.warn("===== EMAIL (DEV MODE — not actually sent) =====");
            log.warn("To: {}", to);
            log.warn("Subject: {}", subject);
            log.warn("Body:\n{}", body);
            log.warn("=================================================");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            // Don't throw — OTP is already in Redis, user can retry
        }
    }
}
