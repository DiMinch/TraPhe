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
        private final com.example.traphe_backend.repository.UserRepository userRepository;

        @Override
        @Transactional
        @SuppressWarnings("unused")
        public void run(String... args) {
                // Fix old categories isDrinkCategory field if they exist
                menuCategoryRepository.findAll().forEach(cat -> {
                        log.info("Category check: name='{}', isDrinkCategory={}", cat.getName(), cat.isDrinkCategory());
                        if ("Trà Sữa".equals(cat.getName()) || "Cà Phê & Trà".equals(cat.getName())
                                        || "Sinh Tố & Nước Ép".equals(cat.getName())) {
                                if (!cat.isDrinkCategory()) {
                                        log.info("UPDATING isDrinkCategory to true for category '{}'", cat.getName());
                                        cat.setDrinkCategory(true);
                                        menuCategoryRepository.save(cat);
                                }
                        }
                });

                if (branchRepository.count() == 0) {
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
                                        .name("Mức đường").type(OptionGroupType.SUGAR).isRequired(true).displayOrder(1)
                                        .build());
                        OptionGroup grpIce = optionGroupRepository.save(OptionGroup.builder()
                                        .name("Mức đá").type(OptionGroupType.ICE).isRequired(true).displayOrder(2)
                                        .build());
                        OptionGroup grpTemp = optionGroupRepository.save(OptionGroup.builder()
                                        .name("Nhiệt độ").type(OptionGroupType.TEMPERATURE).isRequired(false)
                                        .displayOrder(3).build());

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
                }

                // ==================== MERCHANDISE SEEDING ====================
                if (menuCategoryRepository.findAll().stream().noneMatch(cat -> "Coffee Beans".equals(cat.getName()))) {
                        log.info("Seeding Merchandise categories & items...");
                        MenuCategory catCoffeeBeans = menuCategoryRepository.save(MenuCategory.builder()
                                        .name("Coffee Beans").isDrinkCategory(false).displayOrder(4).build());
                        MenuCategory catPremiumTea = menuCategoryRepository.save(MenuCategory.builder()
                                        .name("Premium Tea").isDrinkCategory(false).displayOrder(5).build());
                        MenuCategory catGiftSets = menuCategoryRepository.save(MenuCategory.builder()
                                        .name("Gift Sets").isDrinkCategory(false).displayOrder(6).build());
                        MenuCategory catCombos = menuCategoryRepository.save(MenuCategory.builder()
                                        .name("Combos").isDrinkCategory(false).displayOrder(7).build());
                        MenuCategory catBrewingGear = menuCategoryRepository.save(MenuCategory.builder()
                                        .name("Brewing Gear").isDrinkCategory(false).displayOrder(8).build());

                        // 1. Heritage Robusta Blend (Price: 250000, Category: Coffee Beans)
                        MenuItem robustaBeans = menuItemRepository.save(MenuItem.builder()
                                        .name("Heritage Robusta Blend")
                                        .description("Our signature dark roast with bold chocolate and subtle nutty notes. Sourced from the highlands.")
                                        .category(catCoffeeBeans).isDrink(false).allowToppings(false)
                                        .preparationTime(0).status(MenuItemStatus.ACTIVE)
                                        .basePrice(new BigDecimal("250000"))
                                        .imageUrl("https://lh3.googleusercontent.com/aida-public/AB6AXuDNLGQym2sE--xUV5eKh4hjYg0WMwJwSpFdaaNdNvObf7aECBeYlWMs47KaPu8N2BsXXMOTf70UrddDMKrrF2uoK_H9KiSVfkV8SK8ZmwXezYUE2Ko8F9h9XQf9GB_fOzYdbCExqS6gIYuUkzEE4AqAO82PWpX6t7lBl8Q6inv0gh2_V-p4wNWOjnc26MBYOLerQV5HfOuRcyG3Y7j6EHPQHlbHPX3c_cfP8FhlGbRJ943HTa2LJD0fGDvmJvW_ZmvMM5JEgv-PWtA")
                                        .build());

                        // 2. Imperial Lotus Tea (Price: 420000, Category: Premium Tea)
                        MenuItem lotusTea = menuItemRepository.save(MenuItem.builder()
                                        .name("Imperial Lotus Tea")
                                        .description("Delicate green tea meticulously infused with the fragrance of fresh lotus blossoms. A refined experience.")
                                        .category(catPremiumTea).isDrink(false).allowToppings(false)
                                        .preparationTime(0).status(MenuItemStatus.ACTIVE)
                                        .basePrice(new BigDecimal("420000"))
                                        .imageUrl("https://lh3.googleusercontent.com/aida-public/AB6AXuC7HHrEuKakXgsx0XXwY58sqG_zXOA1blmeJlIPeXneogC5kefd6Lh-5GQLbd9y8loUonXLzh6XIOuVV0QusAyJFfhiL6GH_my5LbPZtrPtSlklTYi46RYZLl8JGJusbSICA_BvQacdpOPLpBWSzsSLAmPb21juJD5u_ATCCwzq5Df-4v6evZ6nfGk9H_2wnl1AWU-dKK2t62oy8X1Gnh8oPRlXzCGwnF3cstZjkePZ3iNJwn_RLQHwKzvAw2y9npy6uCxbLgc_0QQ")
                                        .build());

                        // 3. Artisan Phin Filter (Price: 150000, Category: Brewing Gear)
                        MenuItem phinFilter = menuItemRepository.save(MenuItem.builder()
                                        .name("Artisan Phin Filter")
                                        .description("High-grade stainless steel Phin filter for the authentic slow-drip Vietnamese coffee experience at home.")
                                        .category(catBrewingGear).isDrink(false).allowToppings(false)
                                        .preparationTime(0).status(MenuItemStatus.ACTIVE)
                                        .basePrice(new BigDecimal("150000"))
                                        .imageUrl("https://lh3.googleusercontent.com/aida-public/AB6AXuBOMbVNHImwMKE_BA1GVndQpdqSX1WDyUaUcc-6QrfKP5MOBeU_EXjwc6O3Uw-2d2NrK3VRkBNfLzIR--7oT-KouZ55KyvsUrB7HusEVgIi_tGQD27AcE18aqkhLC51RNFGoEbV4VIYU_uPV_2Z8Ng7RpGhc5q5zRtxFkApaLRlfc1VlmMi2rSNTSfOcvQsqEMhmRRE2CrRj3q9DRSIbNWB7JmVAThDR64xW-w5AWcF9UKG5pGUCwyRnZSCcIqyxxDh4JaQsOrb65Y")
                                        .build());

                        // 4. The Explorer's Kit (Price: 680000, Category: Gift Sets)
                        MenuItem explorerKit = menuItemRepository.save(MenuItem.builder()
                                        .name("The Explorer's Kit")
                                        .description("A curated selection of our top three single-origin roasts. Perfect for gifting or discovering your new favorite.")
                                        .category(catGiftSets).isDrink(false).allowToppings(false)
                                        .preparationTime(0).status(MenuItemStatus.ACTIVE)
                                        .basePrice(new BigDecimal("680000"))
                                        .imageUrl("https://lh3.googleusercontent.com/aida-public/AB6AXuDlbiE1OgZvhusvN3QwPfv5SaS3pUr6p89WKlWDsE39J8R9QpDyBdHeWbO2jJ1AzuaP0VH2oxuclkUGp9oX1GrkabQ3BTsYBK3qhFdMdxV1Lj63Oyyv4EsPwAXbx6Ergt1eOmSZH8cN-yYdgWdyjImgNFKx3YqBdDVYEYAzjC8QGWvG1UYkF88nLme4A1bhfOIxi0SHyQ5SmZirCKGIW-k9Yvv76gy6RwgU4RfD0f7AwaoGJHhR4BSnVFawOm6a9wN3YL93ZxCC5fo")
                                        .build());

                        // 5. Da Lat Arabica (Price: 280000, Category: Coffee Beans)
                        MenuItem arabicaBeans = menuItemRepository.save(MenuItem.builder()
                                        .name("Da Lat Arabica")
                                        .description("A bright, medium roast with floral notes and a clean, citrusy finish. Cultivated in the cool mist of Da Lat.")
                                        .category(catCoffeeBeans).isDrink(false).allowToppings(false)
                                        .preparationTime(0).status(MenuItemStatus.ACTIVE)
                                        .basePrice(new BigDecimal("280000"))
                                        .imageUrl("https://lh3.googleusercontent.com/aida-public/AB6AXuBJa12pK6LoZxvgzxSaEHTN5MuuNmobka2AP4WitQauczz6quZ1SX-nM60pUtXcFPr9zK8Yh1WGPaXYhp6qNBywdxthVzIrcCtv4-EZQCPIVNsM4Q067oaPTSfjsTad5Hlg_Js7oT_5f6U9wrvSbYiXx6rXxRMG8DnFHiP1J0lCfqT67GB-jm93VPHLj9ZhQJB_OSg5dfXiBOUP0p5MDhVFvpIA3jmicLubG5e_EngZ9q-g-2LNywxe9mc3hRkotk592XGuZLZnSXQ")
                                        .build());

                        // 6. Highland Oolong (Price: 350000, Category: Premium Tea)
                        MenuItem oolongTea = menuItemRepository.save(MenuItem.builder()
                                        .name("Highland Oolong")
                                        .description("Premium semi-oxidized tea leaves offering a complex profile of roasted nuts and sweet orchids.")
                                        .category(catPremiumTea).isDrink(false).allowToppings(false)
                                        .preparationTime(0).status(MenuItemStatus.ACTIVE)
                                        .basePrice(new BigDecimal("350000"))
                                        .imageUrl("https://lh3.googleusercontent.com/aida-public/AB6AXuClx18lOW_TF9oKAeH5ZiE_PjXipq4K7Ecd4Jn45HNcuPuhQVmjTCO-Zb1mfK_32Ga_Qa6EAEqUe_wfrLZKFEOmCt_YqaaMd13-oR7KNUrI00IueqMVurp6mPuwmJikXA8cP0b2qZj3v6ELg9GT11GSTcyuymU3BPKcyhrfAWGe9K4s4TLClWKNazBQAoRQ3CNAbBMRBbmOjCK-VfI2RBxXQNU22x7lhLNL--z2BbwghRecPlJgSNsHVUROg9AVXQISM1s5RRpPXrI")
                                        .build());

                        // 7. Artisan Ceramic Mug (Price: 220000, Category: Brewing Gear)
                        MenuItem ceramicMug = menuItemRepository.save(MenuItem.builder()
                                        .name("Artisan Ceramic Mug")
                                        .description("Handcrafted by local artisans. Each mug features a unique glaze, designed to retain heat perfectly.")
                                        .category(catBrewingGear).isDrink(false).allowToppings(false)
                                        .preparationTime(0).status(MenuItemStatus.ACTIVE)
                                        .basePrice(new BigDecimal("220000"))
                                        .imageUrl("https://lh3.googleusercontent.com/aida-public/AB6AXuATDRN1LpMhKz0mO0Mg6RsZ6bZOXuNq2vyCgYZW37uaOp6tTN52X4iiPQxsOijQkWz3UkBOpA2RUO6jcY62ctZErUgbCta9OP4J5gWZ-HDLAdE02mU8vqzjOg91F9rPcCChVD4YWswenJnSfOlyHnqc1w4AUtZVghkPnmhi2s0Bfv5GVE4lr3rJhXpHXMEUcxACA0T7A5lyEDt6q_OEavpflUE0KesqcYMHA5uez3lPhjZNlgT7qxo4GcprkKTDjYUAMMlTk924dXg")
                                        .build());

                        // 8. The Authentic Combo (Price: 380000, Category: Combos)
                        MenuItem authenticCombo = menuItemRepository.save(MenuItem.builder()
                                        .name("The Authentic Combo")
                                        .description("Everything you need: Robusta beans, a Phin filter, and premium sweetened condensed milk. Start brewing instantly.")
                                        .category(catCombos).isDrink(false).allowToppings(false)
                                        .preparationTime(0).status(MenuItemStatus.ACTIVE)
                                        .basePrice(new BigDecimal("380000"))
                                        .imageUrl("https://lh3.googleusercontent.com/aida-public/AB6AXuDCVK21d2kD1lZFcmmI_-htpGflGhFwveGcW89v0qzV_OPVa1wUYtB9O5q0VKb6RtdYhlzgP_tHirBP5NQy_cFSi5N-mhFvmaOontDeeXQFiaOM3yqnyoJF1fBcLbXKzUXgf4PssaQHozWTZh3OKNncZycXavp7fw_xb8bDoPGiXyCBHiNhRFU4RT_JqtnVfVvOmNA9hTynY06QRF5XVy2gYRmgvDkG1lHyIRm7g1uLLfjDsTELkMJOsuGkfXuqK4ZfZoxlxi_Xlm0")
                                        .build());

                        Branch branchQ1 = branchRepository.findAll().stream()
                                        .filter(b -> b.getName().contains("Quận 1")).findFirst().orElse(null);
                        Branch branchQ3 = branchRepository.findAll().stream()
                                        .filter(b -> b.getName().contains("Quận 3")).findFirst().orElse(null);

                        if (branchQ1 != null) {
                                linkBranchMenu(branchQ1, robustaBeans, true, null);
                                linkBranchMenu(branchQ1, lotusTea, true, null);
                                linkBranchMenu(branchQ1, phinFilter, true, null);
                                linkBranchMenu(branchQ1, explorerKit, true, null);
                                linkBranchMenu(branchQ1, arabicaBeans, true, null);
                                linkBranchMenu(branchQ1, oolongTea, true, null);
                                linkBranchMenu(branchQ1, ceramicMug, true, null);
                                linkBranchMenu(branchQ1, authenticCombo, true, null);
                        }
                        if (branchQ3 != null) {
                                linkBranchMenu(branchQ3, robustaBeans, true, null);
                                linkBranchMenu(branchQ3, lotusTea, true, null);
                                linkBranchMenu(branchQ3, phinFilter, true, null);
                                linkBranchMenu(branchQ3, explorerKit, true, null);
                                linkBranchMenu(branchQ3, arabicaBeans, true, null);
                                linkBranchMenu(branchQ3, oolongTea, true, null);
                                linkBranchMenu(branchQ3, ceramicMug, true, null);
                                linkBranchMenu(branchQ3, authenticCombo, true, null);
                        }
                        log.info("✅ Merchandise categories & items seeded successfully!");
                }

                // ========== Assign staff to branches if unassigned ==========
                assignStaffToBranchIfNeeded();

                // ========== Summary ==========
                log.info("===========================================");
                log.info("TraPhe sample data seeded successfully!");
                log.info("  Branches:     {} ({} active + {} inactive)", 3, 2, 1);
                log.info("  Menu items:   {} ({} active + {} hidden)", 6, 5, 1);
                log.info("  Sizes:        {}", menuItemSizeRepository.count());
                log.info("  Option groups: {} ({} values total)", 3, optionValueRepository.count());
                log.info("  Toppings:     {} ({} available)", toppingRepository.count(), 7);
                log.info("===========================================");

                // ==================== PROMOTIONS ====================
                // DISABLED: promotions data already seeded; Supabase has a persistent lock on
                // this table.
                // Uncomment and run once if promotions table is empty.
                /*
                 * try {
                 * if (promotionRepository.count() == 0) {
                 * log.info("========== Seeding TraPhe promotions ==========");
                 * java.time.LocalDateTime now = java.time.LocalDateTime.now();
                 * 
                 * promotionRepository.save(Promotion.builder()
                 * .code("TRAPHE20K")
                 * .name("Giảm 20,000₫ đơn từ 100K")
                 * .description("Áp dụng cho đơn hàng từ 100,000₫. Mỗi tài khoản sử dụng 1 lần."
                 * )
                 * .discountType(Promotion.DiscountType.FIXED_AMOUNT)
                 * .discountValue(new BigDecimal("20000"))
                 * .minOrderValue(new BigDecimal("100000"))
                 * .usageLimit(500)
                 * .perUserLimit(1)
                 * .startDate(now.minusDays(5))
                 * .endDate(now.plusMonths(2))
                 * .scope(com.example.traphe_backend.enums.PromotionScope.PUBLIC)
                 * .build());
                 * 
                 * promotionRepository.save(Promotion.builder()
                 * .code("SUMMER15")
                 * .name("Summer 15% Off")
                 * .description("Enjoy 15% off on all orders this summer. Max discount 50,000₫."
                 * )
                 * .discountType(Promotion.DiscountType.PERCENTAGE)
                 * .discountValue(new BigDecimal("15"))
                 * .maxDiscountAmount(new BigDecimal("50000"))
                 * .usageLimit(1000)
                 * .perUserLimit(2)
                 * .startDate(now.minusDays(1))
                 * .endDate(now.plusMonths(3))
                 * .scope(com.example.traphe_backend.enums.PromotionScope.PUBLIC)
                 * .build());
                 * 
                 * promotionRepository.save(Promotion.builder()
                 * .code("NEWMEMBER")
                 * .name("Welcome Gift — Giảm 30K")
                 * .description("Dành cho khách hàng mới đăng ký. Đơn tối thiểu 80,000₫.")
                 * .discountType(Promotion.DiscountType.FIXED_AMOUNT)
                 * .discountValue(new BigDecimal("30000"))
                 * .minOrderValue(new BigDecimal("80000"))
                 * .usageLimit(null)
                 * .perUserLimit(1)
                 * .startDate(now.minusDays(10))
                 * .endDate(now.plusMonths(6))
                 * .scope(com.example.traphe_backend.enums.PromotionScope.PUBLIC)
                 * .build());
                 * 
                 * log.info("  Promotions seeded: 3 (PUBLIC)");
                 * log.info("===========================================");
                 * }
                 * } catch (Exception e) {
                 * log.warn("Skipped promotion seeding due to error: {}", e.getMessage());
                 * }
                 */
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

        /**
         * Auto-assign staff test accounts to Quận 1 branch if they don't have a branch yet.
         * This ensures Branch Manager and other staff can function correctly.
         */
        private void assignStaffToBranchIfNeeded() {
                Branch branchQ1 = branchRepository.findAll().stream()
                        .filter(b -> b.getName().contains("Quận 1"))
                        .findFirst().orElse(null);

                if (branchQ1 == null) {
                        log.warn("Quận 1 branch not found — skipping staff branch assignment.");
                        return;
                }

                // Assign staff accounts that have no branch
                String[] staffEmails = {"manager@traphe.vn", "cashier@traphe.vn", "barista@traphe.vn"};
                for (String email : staffEmails) {
                        userRepository.findByEmail(email).ifPresent(user -> {
                                if (user.getBranch() == null) {
                                        user.setBranch(branchQ1);
                                        userRepository.save(user);
                                        log.info("✅ Assigned {} to branch '{}'", email, branchQ1.getName());
                                }
                        });
                }
        }
}
