package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.LoginRequest;
import com.example.traphe_backend.dto.request.RefreshTokenRequest;
import com.example.traphe_backend.dto.request.RegisterRequest;
import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.AuthResponse;
import com.example.traphe_backend.service.AuthService;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
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

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest servletRequest
    ) {
        Bucket bucket = resolveGeneralAuthBucket(getClientIP(servletRequest));
        if (bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(authService.register(request), "User registered successfully"));
        }
        
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(ApiResponse.error("Too many registration requests. Please try again later."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest
    ) {
        Bucket bucket = resolveLoginBucket(getClientIP(servletRequest));
        if (bucket.tryConsume(1)) {
            return ResponseEntity.ok(ApiResponse.success(authService.login(request), "Login successful"));
        }

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(ApiResponse.error("Too many login attempts. Please try again after 15 minutes."));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request,
            HttpServletRequest servletRequest
    ) {
        Bucket bucket = resolveGeneralAuthBucket(getClientIP(servletRequest));
        if (bucket.tryConsume(1)) {
            return ResponseEntity.ok(ApiResponse.success(authService.refreshToken(request), "Token refreshed"));
        }

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(ApiResponse.error("Too many requests. Please try again later."));
    }
}
