package com.example.traphe_backend.config;

import com.example.traphe_backend.entity.Role;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.entity.MembershipTier;
import com.example.traphe_backend.enums.RoleName;
import com.example.traphe_backend.repository.RoleRepository;
import com.example.traphe_backend.repository.UserRepository;
import com.example.traphe_backend.repository.MembershipTierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Set;

/**
 * Initializes default Roles, Membership Tiers, and test Accounts on application startup.
 * Only creates accounts and tiers if they don't already exist (safe for re-runs).
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
    private final MembershipTierRepository membershipTierRepository;
    private final com.example.traphe_backend.repository.LoyaltyPointRepository loyaltyPointRepository;

    private static final String DEFAULT_PASSWORD = "password123";

    @Override
    @Transactional
    public void run(String... args) {
        log.info("========== Initializing Roles, Tiers & Test Accounts ==========");

        // 1. Ensure all roles exist
        Map<RoleName, Role> roles = initRoles();

        // 2. Ensure default membership tiers exist
        initMembershipTiers();

        // 3. Create test accounts
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

        userRepository.findByEmail("customer@traphe.vn").ifPresent(customerUser -> {
            com.example.traphe_backend.entity.LoyaltyPoint lp = loyaltyPointRepository.findByUserId(customerUser.getId()).orElse(null);
            if (lp == null) {
                MembershipTier defaultTier = membershipTierRepository
                        .findByIsActiveTrueAndIsDeletedFalseOrderByTierLevelAsc()
                        .stream().findFirst().orElse(null);
                loyaltyPointRepository.save(com.example.traphe_backend.entity.LoyaltyPoint.builder()
                        .user(customerUser)
                        .pointsAvailable(100)
                        .totalSpending(BigDecimal.ZERO)
                        .membershipTier(defaultTier)
                        .build());
                log.info("Initialized 100 loyalty points for existing customer@traphe.vn");
            } else if (lp.getPointsAvailable() < 100) {
                lp.setPointsAvailable(100);
                loyaltyPointRepository.save(lp);
                log.info("Updated loyalty points to 100 for existing customer@traphe.vn");
            }
        });

        log.info("========== Account & Tier Initialization Complete ==========");
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

    private void initMembershipTiers() {
        if (membershipTierRepository.count() == 0) {
            log.info("Seeding default membership tiers...");

            membershipTierRepository.save(MembershipTier.builder()
                    .name("Bronze")
                    .tierLevel(1)
                    .minSpending(BigDecimal.ZERO)
                    .pointEarningRate(BigDecimal.valueOf(1.00))
                    .discountRate(BigDecimal.ZERO)
                    .isActive(true)
                    .description("Thành viên Đồng - Tích luỹ 1 điểm cho mỗi 1,000đ chi tiêu")
                    .build());

            membershipTierRepository.save(MembershipTier.builder()
                    .name("Silver")
                    .tierLevel(2)
                    .minSpending(BigDecimal.valueOf(1000000)) // 1,000,000 VND
                    .pointEarningRate(BigDecimal.valueOf(1.20))
                    .discountRate(BigDecimal.valueOf(3.00)) // 3% discount
                    .isActive(true)
                    .description("Thành viên Bạc - Giảm 3% và tích luỹ 1.2x điểm")
                    .build());

            membershipTierRepository.save(MembershipTier.builder()
                    .name("Gold")
                    .tierLevel(3)
                    .minSpending(BigDecimal.valueOf(5000000)) // 5,000,000 VND
                    .pointEarningRate(BigDecimal.valueOf(1.50))
                    .discountRate(BigDecimal.valueOf(5.00)) // 5% discount
                    .isActive(true)
                    .description("Thành viên Vàng - Giảm 5% và tích luỹ 1.5x điểm")
                    .build());

            membershipTierRepository.save(MembershipTier.builder()
                    .name("Platinum")
                    .tierLevel(4)
                    .minSpending(BigDecimal.valueOf(15000000)) // 15,000,000 VND
                    .pointEarningRate(BigDecimal.valueOf(2.00))
                    .discountRate(BigDecimal.valueOf(10.00)) // 10% discount
                    .isActive(true)
                    .description("Thành viên Bạch Kim - Giảm 10% và tích luỹ 2.0x điểm")
                    .build());

            log.info("Default membership tiers seeded successfully.");
        } else {
            log.info("Membership tiers already exist.");
        }
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

        User savedUser = userRepository.save(user);

        if ("customer@traphe.vn".equals(email)) {
            MembershipTier defaultTier = membershipTierRepository
                    .findByIsActiveTrueAndIsDeletedFalseOrderByTierLevelAsc()
                    .stream().findFirst().orElse(null);
            loyaltyPointRepository.save(com.example.traphe_backend.entity.LoyaltyPoint.builder()
                    .user(savedUser)
                    .pointsAvailable(100)
                    .totalSpending(BigDecimal.ZERO)
                    .membershipTier(defaultTier)
                    .build());
            log.info("Seeded 100 loyalty points for customer@traphe.vn");
        }

        String roleNames = roles.stream()
                .map(r -> r.getName().name())
                .reduce((a, b) -> a + ", " + b)
                .orElse("");

        log.info("Created test account: {} [{}]", email, roleNames);
    }
}
