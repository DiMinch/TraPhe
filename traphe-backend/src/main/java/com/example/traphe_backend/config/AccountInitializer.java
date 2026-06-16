package com.example.traphe_backend.config;

import com.example.traphe_backend.entity.Role;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.entity.MembershipTier;
import com.example.traphe_backend.entity.LoyaltyReward;
import com.example.traphe_backend.enums.RoleName;
import com.example.traphe_backend.repository.RoleRepository;
import com.example.traphe_backend.repository.UserRepository;
import com.example.traphe_backend.repository.MembershipTierRepository;
import com.example.traphe_backend.repository.LoyaltyRewardRepository;
import com.example.traphe_backend.entity.Branch;
import com.example.traphe_backend.repository.BranchRepository;
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
@Order(2) // Run after DataSeeder
@RequiredArgsConstructor
@Slf4j
public class AccountInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MembershipTierRepository membershipTierRepository;
    private final com.example.traphe_backend.repository.LoyaltyPointRepository loyaltyPointRepository;
    private final com.example.traphe_backend.repository.SystemConfigRepository systemConfigRepository;
    private final LoyaltyRewardRepository loyaltyRewardRepository;
    private final BranchRepository branchRepository;

    private static final String DEFAULT_PASSWORD = "password123";

    @Override
    @Transactional
    public void run(String... args) {
        log.info("========== Initializing Roles, Tiers & Test Accounts ==========");

        // 1. Ensure all roles exist
        Map<RoleName, Role> roles = initRoles();

        // 2. Ensure default membership tiers exist
        initMembershipTiers();

        // Ensure default system configurations exist
        initSystemConfigs();

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

        // Ensure default loyalty rewards exist
        initLoyaltyRewards();

        // Ensure manager, cashier, barista have a branch assigned
        assignBranchToUserIfNull("manager@traphe.vn");
        assignBranchToUserIfNull("cashier@traphe.vn");
        assignBranchToUserIfNull("barista@traphe.vn");

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

    private void initSystemConfigs() {
        if (systemConfigRepository.count() == 0) {
            log.info("Seeding default system configurations...");

            systemConfigRepository.save(com.example.traphe_backend.entity.SystemConfig.builder()
                    .configKey("DEFAULT_INVENTORY_THRESHOLD")
                    .configValue("10.0")
                    .description("Ngưỡng cảnh báo tồn kho mặc định của nguyên liệu")
                    .build());

            systemConfigRepository.save(com.example.traphe_backend.entity.SystemConfig.builder()
                    .configKey("SHIPPING_BASE_FEE")
                    .configValue("15000.0")
                    .description("Phí giao hàng cơ bản cố định (đ)")
                    .build());

            systemConfigRepository.save(com.example.traphe_backend.entity.SystemConfig.builder()
                    .configKey("SHIPPING_PER_KM")
                    .configValue("5000.0")
                    .description("Phí giao hàng tăng thêm trên mỗi kilomet (đ/km)")
                    .build());

            systemConfigRepository.save(com.example.traphe_backend.entity.SystemConfig.builder()
                    .configKey("BRAND_NAME")
                    .configValue("TraPhe")
                    .description("Tên thương hiệu hệ thống")
                    .build());

            log.info("Default system configurations seeded successfully.");
        } else {
            log.info("System configurations already exist.");
        }
    }

    private void createAccountIfNotExists(String email, String fullName, Set<Role> roles) {
        if (userRepository.existsByEmail(email)) {
            log.info("Account already exists: {}", email);
            return;
        }

        Branch branch = null;
        boolean isBranchStaff = roles.stream().anyMatch(r -> 
            r.getName() == RoleName.ROLE_BRANCH_MANAGER ||
            r.getName() == RoleName.ROLE_CASHIER ||
            r.getName() == RoleName.ROLE_BARISTA
        );
        if (isBranchStaff) {
            branch = branchRepository.findAll().stream()
                    .filter(Branch::isActive)
                    .findFirst()
                    .orElse(null);
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                .fullName(fullName)
                .isEmailVerified(true) // Seed accounts are pre-verified
                .roles(roles)
                .branch(branch)
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

    private void assignBranchToUserIfNull(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            if (user.getBranch() == null) {
                branchRepository.findAll().stream()
                        .filter(Branch::isActive)
                        .findFirst()
                        .ifPresent(branch -> {
                            user.setBranch(branch);
                            userRepository.save(user);
                            log.info("Assigned user {} to branch {}", email, branch.getName());
                        });
            }
        });
    }

    private void initLoyaltyRewards() {
        if (loyaltyRewardRepository.count() == 0) {
            log.info("Seeding default loyalty rewards...");

            loyaltyRewardRepository.save(LoyaltyReward.builder()
                    .name("Free Upsize")
                    .points(200)
                    .description("Nâng cấp miễn phí nước uống cỡ vừa (M) lên cỡ lớn (L).")
                    .category("drink")
                    .isActive(true)
                    .build());

            loyaltyRewardRepository.save(LoyaltyReward.builder()
                    .name("Free Topping")
                    .points(150)
                    .description("Thêm trân châu đen, thạch dừa hoặc pudding miễn phí.")
                    .category("drink")
                    .isActive(true)
                    .build());

            loyaltyRewardRepository.save(LoyaltyReward.builder()
                    .name("Voucher Giảm 20k")
                    .points(300)
                    .description("Giảm giá 20,000đ áp dụng cho mọi đơn hàng.")
                    .category("voucher")
                    .discountValue(new BigDecimal("20000"))
                    .discountType("FIXED_AMOUNT")
                    .isActive(true)
                    .build());

            loyaltyRewardRepository.save(LoyaltyReward.builder()
                    .name("Voucher Giảm 50k")
                    .points(600)
                    .description("Giảm giá 50,000đ áp dụng cho đơn từ 100,000đ.")
                    .category("voucher")
                    .discountValue(new BigDecimal("50000"))
                    .discountType("FIXED_AMOUNT")
                    .isActive(true)
                    .build());

            loyaltyRewardRepository.save(LoyaltyReward.builder()
                    .name("Free Signature Drink")
                    .points(800)
                    .description("Nhận 1 ly Cà Phê Dừa hoặc Trà Đào Cam Sả miễn phí.")
                    .category("drink")
                    .isActive(true)
                    .build());

            loyaltyRewardRepository.save(LoyaltyReward.builder()
                    .name("Ly Sứ TraPhe")
                    .points(1500)
                    .description("Ly sứ TraPhe phiên bản giới hạn chế tác thủ công tinh xảo.")
                    .category("merchandise")
                    .isActive(true)
                    .build());

            log.info("Default loyalty rewards seeded successfully.");
        } else {
            log.info("Loyalty rewards already exist.");
        }
    }
}
