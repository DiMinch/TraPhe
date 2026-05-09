package com.example.traphe_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.concurrent.TimeUnit;

/**
 * Token Blacklist Service — uses Redis to invalidate refresh tokens.
 * Stores a hash of the token with TTL matching the token's remaining validity.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final String BLACKLIST_PREFIX = "blacklist:";

    /**
     * Blacklist a refresh token. TTL = remaining time until expiry.
     *
     * @param token            the raw refresh token
     * @param expirationMillis the token's expiration timestamp in milliseconds
     */
    public void blacklist(String token, long expirationMillis) {
        String key = buildKey(token);
        long ttlMillis = expirationMillis - System.currentTimeMillis();

        if (ttlMillis > 0) {
            redisTemplate.opsForValue().set(key, "revoked", ttlMillis, TimeUnit.MILLISECONDS);
            log.info("Token blacklisted, TTL={}ms", ttlMillis);
        }
    }

    /**
     * Check if a token is blacklisted.
     */
    public boolean isBlacklisted(String token) {
        String key = buildKey(token);
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    /**
     * Build a Redis key from the token hash (don't store raw tokens).
     */
    private String buildKey(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return BLACKLIST_PREFIX + Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is always available in Java
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
