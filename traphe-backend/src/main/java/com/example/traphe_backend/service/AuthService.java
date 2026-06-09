package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.ChangePasswordRequest;
import com.example.traphe_backend.dto.request.ForgotPasswordRequest;
import com.example.traphe_backend.dto.request.LoginRequest;
import com.example.traphe_backend.dto.request.RefreshTokenRequest;
import com.example.traphe_backend.dto.request.RegisterRequest;
import com.example.traphe_backend.dto.request.ResendOtpRequest;
import com.example.traphe_backend.dto.request.ResetPasswordRequest;
import com.example.traphe_backend.dto.request.VerifyOtpRequest;
import com.example.traphe_backend.dto.response.AuthResponse;
import com.example.traphe_backend.dto.response.UserResponse;
import com.example.traphe_backend.entity.Role;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.enums.RoleName;
import com.example.traphe_backend.exception.EmailAlreadyExistsException;
import com.example.traphe_backend.exception.InvalidTokenException;
import com.example.traphe_backend.repository.RoleRepository;
import com.example.traphe_backend.repository.UserRepository;
import com.example.traphe_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final OtpService otpService;
    private final EmailService emailService;
    private final TokenBlacklistService tokenBlacklistService;

    // ======================== REGISTER ========================

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email đã được đăng ký.");
        }

        Role userRole = roleRepository.findByName(RoleName.ROLE_CUSTOMER)
                .orElseGet(() -> {
                    Role role = Role.builder().name(RoleName.ROLE_CUSTOMER).build();
                    return roleRepository.save(role);
                });

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .roles(Collections.singleton(userRole))
                .build();

        userRepository.save(user);

        // Generate email verification OTP
        String otp = otpService.generateAndSaveOtp(user.getEmail(), OtpService.OtpType.EMAIL_VERIFY);
        emailService.sendVerificationOtp(user.getEmail(), otp);

        // Return tokens immediately (user can login but isEmailVerified=false)
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(user))
                .build();
    }

    // ======================== LOGIN ========================

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email hoặc mật khẩu không chính xác."));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(user))
                .build();
    }

    // ======================== GET CURRENT USER (/me) ========================

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));
        return mapToUserResponse(user);
    }

    // ======================== REFRESH TOKEN ========================

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();

        // Validate it's a refresh token
        if (!jwtUtil.isRefreshToken(token)) {
            throw new InvalidTokenException("Token không phải refresh token.");
        }

        // Check blacklist
        if (tokenBlacklistService.isBlacklisted(token)) {
            throw new InvalidTokenException("Refresh token đã bị thu hồi.");
        }

        String userEmail = jwtUtil.extractUsername(token);

        if (userEmail != null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            if (jwtUtil.isTokenValid(token, userDetails)) {
                User user = userRepository.findByEmail(userEmail)
                        .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));

                String accessToken = jwtUtil.generateAccessToken(userDetails);

                return AuthResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(token) // keep the same refresh token
                        .user(mapToUserResponse(user))
                        .build();
            }
        }
        throw new InvalidTokenException("Refresh token không hợp lệ hoặc đã hết hạn.");
    }

    // ======================== LOGOUT ========================

    public void logout(String refreshToken) {
        try {
            long expirationMillis = jwtUtil.extractExpirationMillis(refreshToken);
            tokenBlacklistService.blacklist(refreshToken, expirationMillis);
            log.info("User logged out, refresh token blacklisted");
        } catch (Exception e) {
            log.warn("Logout — could not blacklist token: {}", e.getMessage());
            // Still consider logout successful from user perspective
        }
    }

    // ======================== CHANGE PASSWORD ========================

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không chính xác.");
        }

        // Prevent setting same password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới phải khác mật khẩu hiện tại.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user: {}", email);
    }

    // ======================== FORGOT PASSWORD ========================

    public void forgotPassword(ForgotPasswordRequest request) {
        // Always return success to prevent email enumeration attacks
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            String otp = otpService.generateAndSaveOtp(user.getEmail(), OtpService.OtpType.PASSWORD_RESET);
            emailService.sendPasswordResetOtp(user.getEmail(), otp);
            log.info("Password reset OTP sent to: {}", user.getEmail());
        });
    }

    // ======================== RESET PASSWORD ========================

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // Validate OTP
        boolean isValid = otpService.validateOtp(
                request.getEmail(),
                OtpService.OtpType.PASSWORD_RESET,
                request.getOtp()
        );

        if (!isValid) {
            throw new IllegalArgumentException("Mã OTP không hợp lệ hoặc đã hết hạn.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password reset successful for user: {}", request.getEmail());
    }

    // ======================== VERIFY EMAIL ========================

    @Transactional
    public void verifyEmail(VerifyOtpRequest request) {
        boolean isValid = otpService.validateOtp(
                request.getEmail(),
                OtpService.OtpType.EMAIL_VERIFY,
                request.getOtp()
        );

        if (!isValid) {
            throw new IllegalArgumentException("Mã OTP không hợp lệ hoặc đã hết hạn.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));

        user.setEmailVerified(true);
        userRepository.save(user);
        log.info("Email verified for user: {}", request.getEmail());
    }

    // ======================== RESEND OTP ========================

    public void resendOtp(ResendOtpRequest request) {
        OtpService.OtpType otpType;
        try {
            otpType = OtpService.OtpType.valueOf(request.getType());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Loại OTP không hợp lệ. Chấp nhận: EMAIL_VERIFY, PASSWORD_RESET");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));

        // Don't resend if already verified (for EMAIL_VERIFY type)
        if (otpType == OtpService.OtpType.EMAIL_VERIFY && user.isEmailVerified()) {
            throw new IllegalArgumentException("Email đã được xác thực.");
        }

        String otp = otpService.generateAndSaveOtp(user.getEmail(), otpType);

        if (otpType == OtpService.OtpType.EMAIL_VERIFY) {
            emailService.sendVerificationOtp(user.getEmail(), otp);
        } else {
            emailService.sendPasswordResetOtp(user.getEmail(), otp);
        }

        log.info("OTP resent to {} [{}]", user.getEmail(), otpType);
    }

    // ======================== HELPERS ========================

    private UserResponse mapToUserResponse(User user) {
        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .isEmailVerified(user.isEmailVerified())
                .roles(roles)
                .build();
    }
}
