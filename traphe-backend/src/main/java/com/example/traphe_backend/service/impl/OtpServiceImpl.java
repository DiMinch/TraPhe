package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.service.OtpService;
import com.example.traphe_backend.service.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

/**
 * OTP Service — stores OTP codes in Redis with TTL.
 * Key format: otp:{type}:{email}
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OtpServiceImpl implements OtpService {

    private final RedisTemplate<String, String> redisTemplate;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.otp.expiration:300}")
    private int otpExpirationSeconds;

    @Value("${app.otp.length:6}")
    private int otpLength;

    private static final String OTP_PREFIX = "otp:";


    /**
     * Generate a random OTP code, save in Redis, and return the code.
     */
    public String generateAndSaveOtp(String email, OtpType type) {
        String otp = generateOtp();
        String key = buildKey(type, email);

        redisTemplate.opsForValue().set(key, otp, otpExpirationSeconds, TimeUnit.SECONDS);
        log.info("OTP generated for {} [{}]: {}", email, type, otp);

        return otp;
    }

    /**
     * Validate the OTP. If valid, delete from Redis (single use) and return true.
     */
    public boolean validateOtp(String email, OtpType type, String otp) {
        String key = buildKey(type, email);
        String storedOtp = redisTemplate.opsForValue().get(key);

        if (storedOtp != null && storedOtp.equals(otp)) {
            redisTemplate.delete(key); // OTP is single-use
            return true;
        }
        return false;
    }

    private String generateOtp() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            sb.append(secureRandom.nextInt(10));
        }
        return sb.toString();
    }

    private String buildKey(OtpType type, String email) {
        return OTP_PREFIX + type.name() + ":" + email.toLowerCase();
    }
}
