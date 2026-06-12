package com.example.traphe_backend.service;

public interface OtpService {
    public enum OtpType {
        EMAIL_VERIFY,
        PASSWORD_RESET
    }

    public String generateAndSaveOtp(String email, OtpType type);
    public boolean validateOtp(String email, OtpType type, String otp);
}