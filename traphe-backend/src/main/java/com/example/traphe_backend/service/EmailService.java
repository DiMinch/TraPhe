package com.example.traphe_backend.service;

public interface EmailService {
    public void sendVerificationOtp(String toEmail, String otp);
    public void sendPasswordResetOtp(String toEmail, String otp);
}