package com.example.traphe_backend.config;

import com.example.traphe_backend.entity.Role;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.enums.RoleName;
import com.example.traphe_backend.repository.RoleRepository;
import com.example.traphe_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Set;

/**
 * Initializes default Roles and test Accounts on application startup.
 * Only creates accounts if they don't already exist (safe for re-runs).
 *
 * <p>Test accounts (password for all: "password123"):</p>
 * <ul>
 *   <li>admin@traphe.vn — ADMIN</li>
 *   <li>manager@traphe.vn — BRANCH_MANAGER</li>
 *   <li>cashier@traphe.vn — CASHIER</li>
 *   <li>barista@traphe.vn — BARISTA</li>
 *   <li>customer@traphe.vn — CUSTOMER</li>
 * </ul>
 */
@Component
@Order(1) // Run before DataSeeder
@RequiredArgsConstructor
@Slf4j
public class AccountInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String DEFAULT_PASSWORD = "password123";

    @Override
    @Transactional
    public void run(String... args) {
        log.info("========== Initializing Roles & Test Accounts ==========");

        // 1. Ensure all roles exist
        Map<RoleName, Role> roles = initRoles();

        // 2. Create test accounts
        createAccountIfNotExists("admin@traphe.vn", "Admin TraPhe",
                Set.of(roles.get(RoleName.ROLE_ADMIN)));

        createAccountIfNotExists("manager@traphe.vn", "Branch Manager",
                Set.of(roles.get(RoleName.ROLE_BRANCH_MANAGER)));

        createAccountIfNotExists("cashier@traphe.vn", "Cashier Test",
                Set.of(roles.get(RoleName.ROLE_CASHIER)));

        createAccountIfNotExists("barista@traphe.vn", "Barista Test",
                Set.of(roles.get(RoleName.ROLE_BARISTA)));

        createAccountIfNotExists("customer@traphe.vn", "Khách hàng Test",
                Set.of(roles.get(RoleName.ROLE_CUSTOMER)));

        log.info("========== Account Initialization Complete ==========");
    }

    private Map<RoleName, Role> initRoles() {
        Map<RoleName, Role> roleMap = new java.util.EnumMap<>(RoleName.class);

        for (RoleName roleName : RoleName.values()) {
            Role role = roleRepository.findByName(roleName)
                    .orElseGet(() -> {
                        log.info("Creating role: {}", roleName);
                        return roleRepository.save(Role.builder().name(roleName).build());
                    });
            roleMap.put(roleName, role);
        }

        log.info("All {} roles initialized", roleMap.size());
        return roleMap;
    }

    private void createAccountIfNotExists(String email, String fullName, Set<Role> roles) {
        if (userRepository.existsByEmail(email)) {
            log.info("Account already exists: {}", email);
            return;
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                .fullName(fullName)
                .isEmailVerified(true) // Seed accounts are pre-verified
                .roles(roles)
                .build();

        userRepository.save(user);

        String roleNames = roles.stream()
                .map(r -> r.getName().name())
                .reduce((a, b) -> a + ", " + b)
                .orElse("");

        log.info("Created test account: {} [{}]", email, roleNames);
    }
}
