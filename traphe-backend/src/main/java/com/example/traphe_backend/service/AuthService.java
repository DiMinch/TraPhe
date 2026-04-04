package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.LoginRequest;
import com.example.traphe_backend.dto.request.RefreshTokenRequest;
import com.example.traphe_backend.dto.request.RegisterRequest;
import com.example.traphe_backend.dto.response.AuthResponse;
import com.example.traphe_backend.dto.response.UserResponse;
import com.example.traphe_backend.entity.Role;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.enums.RoleName;
import com.example.traphe_backend.exception.EmailAlreadyExistsException;
import com.example.traphe_backend.repository.RoleRepository;
import com.example.traphe_backend.repository.UserRepository;
import com.example.traphe_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
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
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email is already registered");
        }

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseGet(() -> {
                    Role role = Role.builder().name(RoleName.ROLE_USER).build();
                    return roleRepository.save(role);
                });

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Collections.singleton(userRole))
                .build();
                
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(user))
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        String userEmail = jwtUtil.extractUsername(token);

        if (userEmail != null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            
            if (jwtUtil.isTokenValid(token, userDetails)) {
                User user = userRepository.findByEmail(userEmail)
                        .orElseThrow(() -> new IllegalArgumentException("User not found"));

                String accessToken = jwtUtil.generateAccessToken(userDetails);
                
                return AuthResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(token) // keep the same refresh token
                        .user(mapToUserResponse(user))
                        .build();
            }
        }
        throw new IllegalArgumentException("Invalid refresh token");
    }

    private UserResponse mapToUserResponse(User user) {
        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .roles(roles)
                .build();
    }
}
