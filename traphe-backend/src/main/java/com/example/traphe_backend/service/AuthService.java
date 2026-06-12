package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.ChangePasswordRequest;
import com.example.traphe_backend.dto.request.ForgotPasswordRequest;
import com.example.traphe_backend.dto.request.LoginRequest;
import com.example.traphe_backend.dto.request.RefreshTokenRequest;
import com.example.traphe_backend.dto.request.RegisterRequest;
import com.example.traphe_backend.dto.request.ResendOtpRequest;
import com.example.traphe_backend.dto.request.ResetPasswordRequest;
import com.example.traphe_backend.dto.request.UpdateProfileRequest;
import com.example.traphe_backend.dto.request.VerifyOtpRequest;
import com.example.traphe_backend.dto.response.AuthResponse;
import com.example.traphe_backend.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

public interface AuthService {
    public AuthResponse register(RegisterRequest request);
    public AuthResponse login(LoginRequest request);
    public UserResponse getCurrentUser(String email);
    public AuthResponse refreshToken(RefreshTokenRequest request);
    public void logout(String refreshToken);
    public void changePassword(String email, ChangePasswordRequest request);
    public void forgotPassword(ForgotPasswordRequest request);
    public void resetPassword(ResetPasswordRequest request);
    public void verifyEmail(VerifyOtpRequest request);
    public void resendOtp(ResendOtpRequest request);
    public UserResponse updateProfile(String email, UpdateProfileRequest request, MultipartFile avatarFile);
}