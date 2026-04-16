package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.ChangePasswordRequest;
import com.example.traphe_backend.dto.request.ForgotPasswordRequest;
import com.example.traphe_backend.dto.request.LoginRequest;
import com.example.traphe_backend.dto.request.LogoutRequest;
import com.example.traphe_backend.dto.request.RefreshTokenRequest;
import com.example.traphe_backend.dto.request.RegisterRequest;
import com.example.traphe_backend.dto.request.ResendOtpRequest;
import com.example.traphe_backend.dto.request.ResetPasswordRequest;
import com.example.traphe_backend.dto.request.VerifyOtpRequest;
import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.AuthResponse;
import com.example.traphe_backend.dto.response.UserResponse;
import com.example.traphe_backend.service.AuthService;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // In-memory buckets for rate limiting based on IP Address
    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> generalAuthBuckets = new ConcurrentHashMap<>();

    // ======================== REGISTER ========================

    /**
     * POST /api/auth/register — Đăng ký tài khoản mới.
     * Trả về tokens ngay sau đăng ký. OTP xác thực email được gửi qua email.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest servletRequest
    ) {
        Bucket bucket = resolveGeneralAuthBucket(getClientIP(servletRequest));
        if (bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(
                            authService.register(request),
                            "Đăng ký thành công. Vui lòng kiểm tra email để xác thực OTP."
                    ));
        }

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(ApiResponse.error("Quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau."));
    }

    // ======================== LOGIN ========================

    /**
     * POST /api/auth/login — Đăng nhập bằng email + mật khẩu.
     * Trả về accessToken (15 phút) và refreshToken (7 ngày).
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest
    ) {
        Bucket bucket = resolveLoginBucket(getClientIP(servletRequest));
        if (bucket.tryConsume(1)) {
            return ResponseEntity.ok(ApiResponse.success(
                    authService.login(request),
                    "Đăng nhập thành công."
            ));
        }

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(ApiResponse.error("Quá nhiều lần đăng nhập. Vui lòng thử lại sau 15 phút."));
    }

    // ======================== GET CURRENT USER ========================

    /**
     * GET /api/auth/me — Lấy thông tin user hiện tại.
     * Yêu cầu JWT access token.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        UserResponse user = authService.getCurrentUser(email);
        return ResponseEntity.ok(ApiResponse.success(user, "Lấy thông tin thành công."));
    }

    // ======================== REFRESH TOKEN ========================

    /**
     * POST /api/auth/refresh — Làm mới access token bằng refresh token.
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request,
            HttpServletRequest servletRequest
    ) {
        Bucket bucket = resolveGeneralAuthBucket(getClientIP(servletRequest));
        if (bucket.tryConsume(1)) {
            return ResponseEntity.ok(ApiResponse.success(
                    authService.refreshToken(request),
                    "Token đã được làm mới."
            ));
        }

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(ApiResponse.error("Quá nhiều yêu cầu. Vui lòng thử lại sau."));
    }

    // ======================== LOGOUT ========================

    /**
     * POST /api/auth/logout — Đăng xuất và thu hồi refresh token.
     * Refresh token sẽ được thêm vào blacklist trong Redis.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody LogoutRequest request
    ) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(null, "Đăng xuất thành công."));
    }

    // ======================== CHANGE PASSWORD ========================

    /**
     * PUT /api/auth/change-password — Đổi mật khẩu khi đã đăng nhập.
     * Yêu cầu mật khẩu hiện tại + mật khẩu mới.
     */
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        authService.changePassword(email, request);
        return ResponseEntity.ok(ApiResponse.success(null, "Đổi mật khẩu thành công."));
    }

    // ======================== FORGOT PASSWORD ========================

    /**
     * POST /api/auth/forgot-password — Gửi OTP đặt lại mật khẩu qua email.
     * Luôn trả về 200 để tránh email enumeration.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest servletRequest
    ) {
        Bucket bucket = resolveGeneralAuthBucket(getClientIP(servletRequest));
        if (bucket.tryConsume(1)) {
            authService.forgotPassword(request);
            return ResponseEntity.ok(ApiResponse.success(
                    null,
                    "Nếu email tồn tại, mã OTP đã được gửi."
            ));
        }

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(ApiResponse.error("Quá nhiều yêu cầu. Vui lòng thử lại sau."));
    }

    // ======================== RESET PASSWORD ========================

    /**
     * POST /api/auth/reset-password — Đặt lại mật khẩu bằng OTP.
     * Yêu cầu email + OTP + mật khẩu mới.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request,
            HttpServletRequest servletRequest
    ) {
        Bucket bucket = resolveGeneralAuthBucket(getClientIP(servletRequest));
        if (bucket.tryConsume(1)) {
            authService.resetPassword(request);
            return ResponseEntity.ok(ApiResponse.success(
                    null,
                    "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."
            ));
        }

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(ApiResponse.error("Quá nhiều yêu cầu. Vui lòng thử lại sau."));
    }

    // ======================== VERIFY EMAIL ========================

    /**
     * POST /api/auth/verify-email — Xác thực email bằng OTP.
     * OTP được gửi tự động khi đăng ký.
     */
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(
            @Valid @RequestBody VerifyOtpRequest request,
            HttpServletRequest servletRequest
    ) {
        Bucket bucket = resolveGeneralAuthBucket(getClientIP(servletRequest));
        if (bucket.tryConsume(1)) {
            authService.verifyEmail(request);
            return ResponseEntity.ok(ApiResponse.success(
                    null,
                    "Email đã được xác thực thành công."
            ));
        }

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(ApiResponse.error("Quá nhiều yêu cầu. Vui lòng thử lại sau."));
    }

    // ======================== RESEND OTP ========================

    /**
     * POST /api/auth/resend-otp — Gửi lại mã OTP.
     * Hỗ trợ type: EMAIL_VERIFY, PASSWORD_RESET.
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(
            @Valid @RequestBody ResendOtpRequest request,
            HttpServletRequest servletRequest
    ) {
        Bucket bucket = resolveGeneralAuthBucket(getClientIP(servletRequest));
        if (bucket.tryConsume(1)) {
            authService.resendOtp(request);
            return ResponseEntity.ok(ApiResponse.success(
                    null,
                    "Mã OTP đã được gửi lại."
            ));
        }

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(ApiResponse.error("Quá nhiều yêu cầu. Vui lòng thử lại sau."));
    }

    // ======================== RATE LIMITING HELPERS ========================

    private Bucket resolveLoginBucket(String ip) {
        return loginBuckets.computeIfAbsent(ip, this::newLoginBucket);
    }

    private Bucket resolveGeneralAuthBucket(String ip) {
        return generalAuthBuckets.computeIfAbsent(ip, this::newGeneralAuthBucket);
    }

    // 5 attempts per 15 minutes for login
    private Bucket newLoginBucket(String ip) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(5)
                .refillGreedy(5, Duration.ofMinutes(15))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    // 10 attempts per minute for other auth endpoints
    private Bucket newGeneralAuthBucket(String ip) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(10)
                .refillGreedy(10, Duration.ofMinutes(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
