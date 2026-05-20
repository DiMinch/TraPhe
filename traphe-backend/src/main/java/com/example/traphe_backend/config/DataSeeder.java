package com.example.traphe_backend.config;

import com.example.traphe_backend.entity.Branch;
import com.example.traphe_backend.entity.BranchMenuItem;
import com.example.traphe_backend.entity.MenuCategory;
import com.example.traphe_backend.entity.MenuItem;
import com.example.traphe_backend.entity.MenuItemOptionGroup;
import com.example.traphe_backend.entity.MenuItemSize;
import com.example.traphe_backend.entity.MenuItemTopping;
import com.example.traphe_backend.entity.OptionGroup;
import com.example.traphe_backend.entity.OptionValue;
import com.example.traphe_backend.entity.Topping;
import com.example.traphe_backend.enums.MenuItemStatus;
import com.example.traphe_backend.enums.OptionGroupType;
import com.example.traphe_backend.repository.BranchMenuItemRepository;
import com.example.traphe_backend.repository.BranchRepository;
import com.example.traphe_backend.repository.MenuCategoryRepository;
import com.example.traphe_backend.repository.MenuItemOptionGroupRepository;
import com.example.traphe_backend.repository.MenuItemRepository;
import com.example.traphe_backend.repository.MenuItemSizeRepository;
import com.example.traphe_backend.repository.MenuItemToppingRepository;
import com.example.traphe_backend.repository.OptionGroupRepository;
import com.example.traphe_backend.repository.OptionValueRepository;
import com.example.traphe_backend.repository.ToppingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final BranchRepository branchRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final MenuItemSizeRepository menuItemSizeRepository;
    private final OptionGroupRepository optionGroupRepository;
    private final OptionValueRepository optionValueRepository;
    private final MenuItemOptionGroupRepository menuItemOptionGroupRepository;
    private final ToppingRepository toppingRepository;
    private final MenuItemToppingRepository menuItemToppingRepository;
    private final BranchMenuItemRepository branchMenuItemRepository;

    @Override
    @Transactional
    @SuppressWarnings("unused")
    public void run(String... args) {
        if (branchRepository.count() > 0) {
            log.info("Data already seeded, skipping...");
            return;
        }

        log.info("========== Seeding TraPhe sample data ==========");

        // ==================== BRANCHES ====================
        Branch branchQ1 = branchRepository.save(Branch.builder()
                .name("TraPhe - Quận 1")
                .address("123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM")
                .lat(new BigDecimal("10.7737353"))
                .lng(new BigDecimal("106.7020200"))
                .phone("028-1234-5678")
                .isActive(true)
                .build());

        Branch branchQ3 = branchRepository.save(Branch.builder()
                .name("TraPhe - Quận 3")
                .address("456 Võ Văn Tần, Phường 5, Quận 3, TP.HCM")
                .lat(new BigDecimal("10.7765140"))
                .lng(new BigDecimal("106.6867871"))
                .phone("028-2345-6789")
                .isActive(true)
                .build());

        Branch branchTD = branchRepository.save(Branch.builder()
                .name("TraPhe - Thủ Đức (Đóng cửa)")
                .address("789 Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức, TP.HCM")
                .lat(new BigDecimal("10.8503580"))
                .lng(new BigDecimal("106.7586440"))
                .phone("028-3456-7890")
                .isActive(false) // ❌ Inactive — for testing error case
                .build());

        log.info("✅ Branches seeded: {} active, {} inactive", 2, 1);

        // ==================== MENU CATEGORIES ====================
        MenuCategory catTraSua = menuCategoryRepository.save(MenuCategory.builder()
                .name("Trà Sữa").isDrinkCategory(true).displayOrder(1).build());
        MenuCategory catCaPhe = menuCategoryRepository.save(MenuCategory.builder()
                .name("Cà Phê & Trà").isDrinkCategory(true).displayOrder(2).build());
        MenuCategory catSinhTo = menuCategoryRepository.save(MenuCategory.builder()
                .name("Sinh Tố & Nước Ép").isDrinkCategory(true).displayOrder(3).build());

        // ==================== OPTION GROUPS ====================
        OptionGroup grpSugar = optionGroupRepository.save(OptionGroup.builder()
                .name("Mức đường").type(OptionGroupType.SUGAR).isRequired(true).displayOrder(1).build());
        OptionGroup grpIce = optionGroupRepository.save(OptionGroup.builder()
                .name("Mức đá").type(OptionGroupType.ICE).isRequired(true).displayOrder(2).build());
        OptionGroup grpTemp = optionGroupRepository.save(OptionGroup.builder()
                .name("Nhiệt độ").type(OptionGroupType.TEMPERATURE).isRequired(false).displayOrder(3).build());

        // ==================== OPTION VALUES ====================
        // --- Sugar levels ---
        OptionValue sugarNone = createOptionValue(grpSugar, "Không đường", false, 1);
        OptionValue sugarLess = createOptionValue(grpSugar, "Ít đường", false, 2);
        OptionValue sugarNormal = createOptionValue(grpSugar, "Bình thường", true, 3);
        OptionValue sugarMore = createOptionValue(grpSugar, "Nhiều đường", false, 4);

        // --- Ice levels ---
        OptionValue iceNone = createOptionValue(grpIce, "Không đá", false, 1);
        OptionValue iceLess = createOptionValue(grpIce, "Ít đá", false, 2);
        OptionValue iceNormal = createOptionValue(grpIce, "Đá bình thường", true, 3);

        // --- Temperature ---
        OptionValue tempHot = createOptionValue(grpTemp, "Nóng", false, 1);
        OptionValue tempCold = createOptionValue(grpTemp, "Lạnh", true, 2);

        log.info("✅ Option groups: {} groups, {} values", 3, optionValueRepository.count());

        // ==================== TOPPINGS ====================
        Topping topTranChauDen = createTopping("Trân châu đen", "8000");
        Topping topTranChauTrang = createTopping("Trân châu trắng", "8000");
        Topping topPudding = createTopping("Pudding", "10000");
        Topping topThachDua = createTopping("Thạch dừa", "7000");
        Topping topKemCheese = createTopping("Kem cheese", "12000");
        Topping topThachCaPhe = createTopping("Thạch cà phê", "8000");
        Topping topDaoMieng = createTopping("Đào miếng", "10000");
        Topping topUnavailable = toppingRepository.save(Topping.builder()
                .name("Trân châu hoàng kim (Hết hàng)")
                .extraPrice(new BigDecimal("15000"))
                .isAvailable(false) // ❌ Unavailable — for testing error case
                .build());

        log.info("✅ Toppings seeded: {} available, {} unavailable", 7, 1);

        // ==================== MENU ITEMS ====================

        // --- Trà Sữa Trà Đen ---
        MenuItem traSuaTraDen = menuItemRepository.save(MenuItem.builder()
                .name("Trà Sữa Trà Đen")
                .description("Trà sữa trà đen truyền thống với hương vị đậm đà")
                .category(catTraSua).isDrink(true).allowToppings(true)
                .preparationTime(5).status(MenuItemStatus.ACTIVE)
                .build());

        createSize(traSuaTraDen, "S", "35000", 1);
        createSize(traSuaTraDen, "M", "40000", 2);
        createSize(traSuaTraDen, "L", "45000", 3);

        linkOptionGroups(traSuaTraDen, grpSugar, grpIce);
        linkToppings(traSuaTraDen, topTranChauDen, topTranChauTrang, topPudding, topThachDua);

        // --- Trà Sữa Matcha ---
        MenuItem traSuaMatcha = menuItemRepository.save(MenuItem.builder()
                .name("Trà Sữa Matcha")
                .description("Trà sữa matcha Nhật Bản thơm ngon")
                .category(catTraSua).isDrink(true).allowToppings(true)
                .preparationTime(7).status(MenuItemStatus.ACTIVE)
                .build());

        createSize(traSuaMatcha, "S", "40000", 1);
        createSize(traSuaMatcha, "M", "45000", 2);
        createSize(traSuaMatcha, "L", "50000", 3);

        linkOptionGroups(traSuaMatcha, grpSugar, grpIce);
        linkToppings(traSuaMatcha, topTranChauDen, topKemCheese, topPudding);

        // --- Trà Sữa Khoai Môn ---
        MenuItem traSuaKhoaiMon = menuItemRepository.save(MenuItem.builder()
                .name("Trà Sữa Khoai Môn")
                .description("Trà sữa khoai môn béo ngậy")
                .category(catTraSua).isDrink(true).allowToppings(true)
                .preparationTime(5).status(MenuItemStatus.ACTIVE)
                .build());

        createSize(traSuaKhoaiMon, "S", "38000", 1);
        createSize(traSuaKhoaiMon, "M", "43000", 2);
        createSize(traSuaKhoaiMon, "L", "48000", 3);

        linkOptionGroups(traSuaKhoaiMon, grpSugar, grpIce);
        linkToppings(traSuaKhoaiMon, topTranChauDen, topTranChauTrang);

        // --- Cà Phê Dừa ---
        MenuItem caPheCoconut = menuItemRepository.save(MenuItem.builder()
                .name("Cà Phê Dừa")
                .description("Cà phê phin truyền thống kết hợp kem dừa béo ngậy")
                .category(catCaPhe).isDrink(true).allowToppings(true)
                .preparationTime(8).status(MenuItemStatus.ACTIVE)
                .build());

        createSize(caPheCoconut, "S", "45000", 1);
        createSize(caPheCoconut, "L", "55000", 2);

        linkOptionGroups(caPheCoconut, grpSugar, grpIce, grpTemp);
        linkToppings(caPheCoconut, topThachCaPhe, topPudding);

        // --- Trà Đào Cam Sả ---
        MenuItem traDaoCamSa = menuItemRepository.save(MenuItem.builder()
                .name("Trà Đào Cam Sả")
                .description("Trà đào thơm mát kết hợp cam và sả")
                .category(catCaPhe).isDrink(true).allowToppings(true)
                .preparationTime(5).status(MenuItemStatus.ACTIVE)
                .build());

        createSize(traDaoCamSa, "S", "42000", 1);
        createSize(traDaoCamSa, "L", "50000", 2);

        linkOptionGroups(traDaoCamSa, grpSugar, grpIce);
        linkToppings(traDaoCamSa, topDaoMieng, topThachDua);

        // --- Sinh Tố Xoài (HIDDEN — for testing) ---
        MenuItem sinToXoai = menuItemRepository.save(MenuItem.builder()
                .name("Sinh Tố Xoài")
                .description("Sinh tố xoài tươi mát lạnh")
                .category(catSinhTo).isDrink(true).allowToppings(false)
                .preparationTime(5)
                .status(MenuItemStatus.HIDDEN) // ❌ Hidden — for testing error case
                .basePrice(new BigDecimal("40000"))
                .build());

        log.info("✅ Menu items seeded: {} active, {} hidden", 5, 1);

        // ==================== BRANCH MENU ITEMS ====================
        // Quận 1 — has all active items
        linkBranchMenu(branchQ1, traSuaTraDen, true, null);
        linkBranchMenu(branchQ1, traSuaMatcha, true, null);
        linkBranchMenu(branchQ1, traSuaKhoaiMon, true, null);
        linkBranchMenu(branchQ1, caPheCoconut, true, null);
        linkBranchMenu(branchQ1, traDaoCamSa, true, null);

        // Quận 3 — has most items, but Matcha is unavailable at this branch
        linkBranchMenu(branchQ3, traSuaTraDen, true, null);
        linkBranchMenu(branchQ3, traSuaMatcha, false, "Hết nguyên liệu matcha"); // ❌ Unavailable
        linkBranchMenu(branchQ3, traSuaKhoaiMon, true, null);
        linkBranchMenu(branchQ3, caPheCoconut, true, "52000"); // Custom price at Q3!
        linkBranchMenu(branchQ3, traDaoCamSa, true, null);

        log.info("✅ Branch menu items seeded: Q1={} items, Q3={} items", 5, 5);

        // ========== Summary ==========
        log.info("===========================================");
        log.info("TraPhe sample data seeded successfully!");
        log.info("  Branches:     {} ({} active + {} inactive)", 3, 2, 1);
        log.info("  Menu items:   {} ({} active + {} hidden)", 6, 5, 1);
        log.info("  Sizes:        {}", menuItemSizeRepository.count());
        log.info("  Option groups: {} ({} values total)", 3, optionValueRepository.count());
        log.info("  Toppings:     {} ({} available)", toppingRepository.count(), 7);
        log.info("===========================================");
    }

    // ---- Helper methods ----

    private OptionValue createOptionValue(OptionGroup group, String label, boolean isDefault, int sortOrder) {
        return optionValueRepository.save(OptionValue.builder()
                .optionGroup(group).label(label).isDefault(isDefault).sortOrder(sortOrder).build());
    }

    private Topping createTopping(String name, String price) {
        return toppingRepository.save(Topping.builder()
                .name(name).extraPrice(new BigDecimal(price)).isAvailable(true).build());
    }

    private void createSize(MenuItem item, String sizeName, String price, int displayOrder) {
        menuItemSizeRepository.save(MenuItemSize.builder()
                .menuItem(item).sizeName(sizeName)
                .sellingPrice(new BigDecimal(price)).displayOrder(displayOrder).build());
    }

    private void linkOptionGroups(MenuItem item, OptionGroup... groups) {
        for (OptionGroup group : groups) {
            menuItemOptionGroupRepository.save(MenuItemOptionGroup.builder()
                    .menuItem(item).optionGroup(group).build());
        }
    }

    private void linkToppings(MenuItem item, Topping... toppings) {
        for (Topping topping : toppings) {
            menuItemToppingRepository.save(MenuItemTopping.builder()
                    .menuItem(item).topping(topping).build());
        }
    }

    private void linkBranchMenu(Branch branch, MenuItem item, boolean available, String customPriceOrReason) {
        BranchMenuItem.BranchMenuItemBuilder builder = BranchMenuItem.builder()
                .branch(branch).menuItem(item).isAvailable(available);

        if (!available && customPriceOrReason != null) {
            builder.unavailableReason(customPriceOrReason);
        } else if (available && customPriceOrReason != null) {
            builder.customPrice(new BigDecimal(customPriceOrReason));
        }

        branchMenuItemRepository.save(builder.build());
    }
}
