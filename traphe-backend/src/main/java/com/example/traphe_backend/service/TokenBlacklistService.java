package com.example.traphe_backend.service;

public interface TokenBlacklistService {
    public void blacklist(String token, long expirationMillis);
    public boolean isBlacklisted(String token);
}