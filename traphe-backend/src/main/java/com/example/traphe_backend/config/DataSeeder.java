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
import com.example.traphe_backend.entity.Ingredient;
import com.example.traphe_backend.entity.IngredientStock;
import com.example.traphe_backend.entity.Supplier;
import com.example.traphe_backend.entity.PurchaseOrder;
import com.example.traphe_backend.entity.PurchaseOrderItem;
import com.example.traphe_backend.entity.StockTransaction;
import com.example.traphe_backend.entity.Recipe;
import com.example.traphe_backend.entity.RecipeItem;
import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.entity.OrderItem;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.enums.PurchaseOrderStatus;
import com.example.traphe_backend.enums.StockTransactionType;
import com.example.traphe_backend.enums.StockReferenceType;
import com.example.traphe_backend.enums.OrderStatus;
import com.example.traphe_backend.enums.OrderType;
import com.example.traphe_backend.enums.PaymentMethod;
import com.example.traphe_backend.enums.PaymentStatus;
import com.example.traphe_backend.enums.BrewingStatus;
import com.example.traphe_backend.repository.IngredientRepository;
import com.example.traphe_backend.repository.IngredientStockRepository;
import com.example.traphe_backend.repository.SupplierRepository;
import com.example.traphe_backend.repository.PurchaseOrderRepository;
import com.example.traphe_backend.repository.PurchaseOrderItemRepository;
import com.example.traphe_backend.repository.StockTransactionRepository;
import com.example.traphe_backend.repository.RecipeRepository;
import com.example.traphe_backend.repository.RecipeItemRepository;
import com.example.traphe_backend.repository.OrderRepository;
import com.example.traphe_backend.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
@org.springframework.core.annotation.Order(1)
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("unused")
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

        private final IngredientRepository ingredientRepository;
        private final IngredientStockRepository ingredientStockRepository;
        private final SupplierRepository supplierRepository;
        private final PurchaseOrderRepository purchaseOrderRepository;
        private final PurchaseOrderItemRepository purchaseOrderItemRepository;
        private final StockTransactionRepository stockTransactionRepository;
        private final RecipeRepository recipeRepository;
        private final RecipeItemRepository recipeItemRepository;
        private final OrderRepository orderRepository;
        private final OrderItemRepository orderItemRepository;

        @Override
        @Transactional
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
                // Auto-assign staff to branch Q1 if needed
                assignStaffToBranchIfNeeded();

                // Seed advanced data (ingredients, recipes, stocks, orders)
                seedAdvancedData();
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
         * Auto-assign staff test accounts to Quận 1 branch if they don't have a branch
         * yet.
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
                String[] staffEmails = { "manager@traphe.vn", "cashier@traphe.vn", "barista@traphe.vn" };
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

        private static class RecipeItemConfig {
                Ingredient ingredient;
                double qty;

                RecipeItemConfig(Ingredient ingredient, double qty) {
                        this.ingredient = ingredient;
                        this.qty = qty;
                }
        }

        private static class PoItemConfig {
                Ingredient ingredient;
                double qty;
                double unitPrice;

                PoItemConfig(Ingredient ingredient, double qty, double unitPrice) {
                        this.ingredient = ingredient;
                        this.qty = qty;
                        this.unitPrice = unitPrice;
                }
        }

        private Ingredient getOrCreateIngredient(String name, String unit, double minAlert, String sku,
                        String barcode) {
                return ingredientRepository.findBySkuAndIsDeletedFalse(sku)
                                .orElseGet(() -> ingredientRepository.save(Ingredient.builder()
                                                .name(name)
                                                .unit(unit)
                                                .minStockAlert(BigDecimal.valueOf(minAlert))
                                                .sku(sku)
                                                .barcode(barcode)
                                                .isActive(true)
                                                .build()));
        }

        private void updateMenuItemDetails(String name, String desc, String imageUrl, BigDecimal basePrice) {
                menuItemRepository.findByNameAndIsDeletedFalse(name).ifPresent(item -> {
                        boolean changed = false;
                        if (item.getImageUrl() == null || item.getImageUrl().isEmpty()) {
                                item.setImageUrl(imageUrl);
                                changed = true;
                        }
                        if (item.getDescription() == null || item.getDescription().isEmpty()) {
                                item.setDescription(desc);
                                changed = true;
                        }
                        if (basePrice != null && item.getBasePrice() == null) {
                                item.setBasePrice(basePrice);
                                changed = true;
                        }
                        if (changed) {
                                menuItemRepository.save(item);
                        }
                });
        }

        private void createRecipeIfNotExists(MenuItem item, String size, String notes, List<RecipeItemConfig> configs) {
                boolean exists = (size == null)
                                ? recipeRepository.existsByMenuItemIdAndSizeIsNullAndIsDeletedFalse(item.getId())
                                : recipeRepository.existsByMenuItemIdAndSizeAndIsDeletedFalse(item.getId(), size);
                if (!exists) {
                        Recipe recipe = recipeRepository.save(Recipe.builder()
                                        .menuItem(item)
                                        .size(size)
                                        .notes(notes)
                                        .isActive(true)
                                        .build());

                        for (RecipeItemConfig cfg : configs) {
                                recipeItemRepository.save(RecipeItem.builder()
                                                .recipe(recipe)
                                                .ingredient(cfg.ingredient)
                                                .quantity(BigDecimal.valueOf(cfg.qty))
                                                .build());
                        }
                }
        }

        private void seedPurchaseOrderForBranch(Branch branch, Supplier supplier, List<PoItemConfig> items,
                        UUID creatorId) {
                List<IngredientStock> existingStocks = ingredientStockRepository.findByBranchId(branch.getId());
                java.util.Set<UUID> existingIngredientIds = new java.util.HashSet<>();
                for (IngredientStock s : existingStocks) {
                        existingIngredientIds.add(s.getIngredient().getId());
                }

                List<PoItemConfig> itemsToSeed = new java.util.ArrayList<>();
                for (PoItemConfig item : items) {
                        if (!existingIngredientIds.contains(item.ingredient.getId())) {
                                itemsToSeed.add(item);
                        }
                }

                if (itemsToSeed.isEmpty()) {
                        return; // All items in the list already have stock seeded
                }

                int nextSeq = 1;
                try {
                        nextSeq = purchaseOrderRepository.findMaxPoNumberSequence() + 1;
                } catch (Exception e) {
                        // Fallback
                }
                String poNumber = String.format("PO-%06d", nextSeq);

                PurchaseOrder po = purchaseOrderRepository.save(PurchaseOrder.builder()
                                .poNumber(poNumber)
                                .supplier(supplier)
                                .branch(branch)
                                .status(PurchaseOrderStatus.CLOSED)
                                .expectedDeliveryDate(LocalDate.now().minusDays(5))
                                .actualDeliveryDate(LocalDate.now().minusDays(5))
                                .note("Đơn nhập kho mẫu hệ thống tự động sinh khi khởi tạo")
                                .build());
                po.setCreatedAt(LocalDateTime.now().minusDays(5));
                po.setCreatedBy(creatorId);
                purchaseOrderRepository.save(po);

                BigDecimal total = BigDecimal.ZERO;
                for (PoItemConfig cfg : itemsToSeed) {
                        PurchaseOrderItem item = purchaseOrderItemRepository.save(PurchaseOrderItem.builder()
                                        .purchaseOrder(po)
                                        .ingredient(cfg.ingredient)
                                        .quantityOrdered(BigDecimal.valueOf(cfg.qty))
                                        .quantityReceived(BigDecimal.valueOf(cfg.qty))
                                        .unitPrice(BigDecimal.valueOf(cfg.unitPrice))
                                        .build());
                        total = total.add(item.getSubtotal());

                        // Update stock
                        IngredientStock stock = IngredientStock.builder()
                                        .branch(branch)
                                        .ingredient(cfg.ingredient)
                                        .quantityAvailable(BigDecimal.valueOf(cfg.qty))
                                        .lastUpdated(LocalDateTime.now().minusDays(5))
                                        .build();
                        ingredientStockRepository.save(stock);

                        // Save transaction
                        stockTransactionRepository.save(StockTransaction.builder()
                                        .branch(branch)
                                        .ingredient(cfg.ingredient)
                                        .type(StockTransactionType.IMPORT)
                                        .quantityChange(BigDecimal.valueOf(cfg.qty))
                                        .quantityBefore(BigDecimal.ZERO)
                                        .quantityAfter(BigDecimal.valueOf(cfg.qty))
                                        .referenceType(StockReferenceType.PURCHASE_ORDER)
                                        .referenceId(po.getId())
                                        .createdAt(LocalDateTime.now().minusDays(5))
                                        .createdBy(creatorId)
                                        .build());
                }

                po.setTotalAmount(total);
                purchaseOrderRepository.save(po);
        }

        private void seedAdjustmentForBranch(Branch branch, Ingredient ingredient, double changeQty, String reason,
                        UUID creatorId) {
                IngredientStock stock = ingredientStockRepository
                                .findByBranchIdAndIngredientId(branch.getId(), ingredient.getId())
                                .orElse(null);
                if (stock == null)
                        return;

                BigDecimal before = stock.getQuantityAvailable();
                BigDecimal change = BigDecimal.valueOf(changeQty);
                BigDecimal after = before.add(change);
                if (after.compareTo(BigDecimal.ZERO) < 0) {
                        after = BigDecimal.ZERO;
                        change = before.negate();
                }

                stock.setQuantityAvailable(after);
                stock.setLastUpdated(LocalDateTime.now().minusDays(2));
                ingredientStockRepository.save(stock);

                stockTransactionRepository.save(StockTransaction.builder()
                                .branch(branch)
                                .ingredient(ingredient)
                                .type(StockTransactionType.ADJUST)
                                .quantityChange(change)
                                .quantityBefore(before)
                                .quantityAfter(after)
                                .referenceType(StockReferenceType.MANUAL)
                                .reason(reason)
                                .createdAt(LocalDateTime.now().minusDays(2))
                                .createdBy(creatorId)
                                .build());
        }

        private void seedOrderForBranch(Branch branch, MenuItem item, int quantity, int minusDays, String sizeStr) {
                String orderNumber = "ORD-" + branch.getId().toString().substring(0, 4).toUpperCase() + "-"
                                + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();

                MenuItemSize itemSize = menuItemSizeRepository.findAll().stream()
                                .filter(s -> s.getMenuItem().getId().equals(item.getId())
                                                && s.getSizeName().equalsIgnoreCase(sizeStr))
                                .findFirst().orElse(null);

                BigDecimal price = (itemSize != null) ? itemSize.getSellingPrice()
                                : (item.getBasePrice() != null ? item.getBasePrice() : BigDecimal.valueOf(35000));
                BigDecimal subtotal = price.multiply(BigDecimal.valueOf(quantity));

                Order order = orderRepository.save(Order.builder()
                                .orderNumber(orderNumber)
                                .orderType(OrderType.DRINK_PICKUP)
                                .branch(branch)
                                .status(OrderStatus.COMPLETED)
                                .brewingStatus(BrewingStatus.COMPLETED)
                                .paymentMethod(PaymentMethod.CASH)
                                .paymentStatus(PaymentStatus.COMPLETED)
                                .subtotal(subtotal)
                                .finalAmount(subtotal)
                                .build());
                order.setCreatedAt(LocalDateTime.now().minusDays(minusDays));
                orderRepository.save(order);

                orderItemRepository.save(OrderItem.builder()
                                .order(order)
                                .menuItem(item)
                                .menuItemSize(itemSize)
                                .quantity(quantity)
                                .unitPrice(price)
                                .subtotal(subtotal)
                                .build());
        }

        private void seedAdvancedData() {
                log.info("========== Seeding Advanced F&B Data & Transactions ==========");

                // Find manager user
                User user = userRepository.findByEmail("manager@traphe.vn")
                                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));
                UUID creatorId = (user != null) ? user.getId() : null;

                // --- 1. Suppliers ---
                Supplier supDaiThinh = supplierRepository
                                .findByNameAndIsDeletedFalse("Nhà cung cấp Nguyên liệu trà sữa Đại Thịnh")
                                .orElseGet(() -> supplierRepository.save(Supplier.builder()
                                                .name("Nhà cung cấp Nguyên liệu trà sữa Đại Thịnh")
                                                .contactName("Nguyễn Văn A")
                                                .phone("0901234567")
                                                .email("daithinh@gmail.com")
                                                .address("123 Đường 3/2, Quận 10, TP. HCM")
                                                .build()));

                Supplier supCaoNguyen = supplierRepository
                                .findByNameAndIsDeletedFalse("Nhà cung cấp Trà & Cà phê Cao Nguyên")
                                .orElseGet(() -> supplierRepository.save(Supplier.builder()
                                                .name("Nhà cung cấp Trà & Cà phê Cao Nguyên")
                                                .contactName("Trần Thị B")
                                                .phone("0907654321")
                                                .email("caonguyen@gmail.com")
                                                .address("456 Lê Lợi, TP. Đà Lạt")
                                                .build()));

                Supplier supMienTay = supplierRepository
                                .findByNameAndIsDeletedFalse("Nhà cung cấp Trái cây tươi Miền Tây")
                                .orElseGet(() -> supplierRepository.save(Supplier.builder()
                                                .name("Nhà cung cấp Trái cây tươi Miền Tây")
                                                .contactName("Lê Văn C")
                                                .phone("0908889999")
                                                .email("mientayfresh@gmail.com")
                                                .address("789 Nguyễn Trung Trực, TP. Cần Thơ")
                                                .build()));

                // --- 2. Ingredients ---
                // Unit unit prices matches recipe unit (g, ml) to ensure logical cost
                // calculation.
                Ingredient ingBotTraSua = getOrCreateIngredient("Bột trà sữa", "g", 1000.0, "ING-MILK-POWDER",
                                "8930000000001");
                Ingredient ingSuaDac = getOrCreateIngredient("Sữa đặc", "ml", 1000.0, "ING-COND-MILK", "8930000000002");
                Ingredient ingBotKhoaiMon = getOrCreateIngredient("Bột khoai môn", "g", 1000.0, "ING-TARO-POWDER",
                                "8930000000003");
                Ingredient ingBotMatcha = getOrCreateIngredient("Bột matcha", "g", 1000.0, "ING-MATCHA",
                                "8930000000004");
                Ingredient ingHongTra = getOrCreateIngredient("Hồng trà", "g", 1000.0, "ING-BLACK-TEA",
                                "8930000000005");
                Ingredient ingTraLai = getOrCreateIngredient("Trà lài", "g", 1000.0, "ING-JASMINE-TEA",
                                "8930000000006");
                Ingredient ingSuaTuoi = getOrCreateIngredient("Sữa tươi", "ml", 2000.0, "ING-FRESH-MILK",
                                "8930000000007");
                Ingredient ingDuongNuoc = getOrCreateIngredient("Đường nước", "ml", 2000.0, "ING-SUGAR-SYRUP",
                                "8930000000008");
                Ingredient ingHatCaPhe = getOrCreateIngredient("Hạt cà phê", "g", 2000.0, "ING-COFFEE-BEANS",
                                "8930000000009");
                Ingredient ingNuocCotDua = getOrCreateIngredient("Nước cốt dừa", "ml", 1000.0, "ING-COCONUT-CREAM",
                                "8930000000010");
                Ingredient ingDaoNgam = getOrCreateIngredient("Đào ngâm", "g", 2000.0, "ING-PEACH-SLICE",
                                "8930000000011");
                Ingredient ingCamTuoi = getOrCreateIngredient("Cam tươi", "g", 2000.0, "ING-ORANGE", "8930000000012");
                Ingredient ingSaTuoi = getOrCreateIngredient("Sả tươi", "g", 1000.0, "ING-LEMONGRASS", "8930000000013");
                Ingredient ingDuaHau = getOrCreateIngredient("Dưa hấu tươi", "g", 3000.0, "ING-WATERMELON",
                                "8930000000014");

                // --- 3. Update active Menu Item Images & Descriptions ---
                updateMenuItemDetails("Trà Sữa Trà Đen",
                                "Trà sữa trà đen truyền thống đậm vị trà cùng sữa béo thơm ngon",
                                "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500",
                                BigDecimal.valueOf(35000));
                updateMenuItemDetails("Trà Sữa Matcha",
                                "Hương vị matcha Nhật Bản kết hợp cùng sữa tươi béo ngậy tuyệt hảo",
                                "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500",
                                BigDecimal.valueOf(40000));
                updateMenuItemDetails("Trà Sữa Khoai Môn",
                                "Trà sữa khoai môn bùi béo kết hợp màu tím bắt mắt dễ thương",
                                "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500",
                                BigDecimal.valueOf(38000));
                updateMenuItemDetails("Cà Phê Dừa",
                                "Cà phê phin Việt Nam hòa quyện nước cốt dừa đá xay mát lạnh cực ngon",
                                "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500",
                                BigDecimal.valueOf(45000));
                updateMenuItemDetails("Trà Đào Cam Sả",
                                "Trà đào thơm nồng kết hợp cam tươi mọng nước cùng sả thanh mát",
                                "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=500",
                                BigDecimal.valueOf(42000));

                // --- 4. Add new drinks if not present ---
                MenuCategory catCaPhe = menuCategoryRepository.findByNameAndIsDeletedFalse("Cà Phê & Trà").orElse(null);
                MenuItem matchaLatte = null;
                if (catCaPhe != null) {
                        matchaLatte = menuItemRepository.findByNameAndIsDeletedFalse("Matcha Latte").orElse(null);
                        if (matchaLatte == null) {
                                matchaLatte = menuItemRepository.save(MenuItem.builder()
                                                .name("Matcha Latte")
                                                .description("Bột matcha tinh khiết hòa quyện sữa tươi thơm béo ngọt ngào")
                                                .category(catCaPhe)
                                                .isDrink(true)
                                                .allowToppings(true)
                                                .preparationTime(5)
                                                .imageUrl("https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=500")
                                                .status(MenuItemStatus.ACTIVE)
                                                .basePrice(new BigDecimal("45000"))
                                                .build());
                                createSize(matchaLatte, "S", "45000", 1);
                                createSize(matchaLatte, "M", "50000", 2);
                                createSize(matchaLatte, "L", "55000", 3);

                                for (Branch branch : branchRepository.findAll()) {
                                        linkBranchMenu(branch, matchaLatte, true, null);
                                }
                        }
                }

                MenuCategory catSinhTo = menuCategoryRepository.findByNameAndIsDeletedFalse("Sinh Tố & Nước Ép")
                                .orElse(null);
                MenuItem duaHau = null;
                if (catSinhTo != null) {
                        duaHau = menuItemRepository.findByNameAndIsDeletedFalse("Nước Ép Dưa Hấu").orElse(null);
                        if (duaHau == null) {
                                duaHau = menuItemRepository.save(MenuItem.builder()
                                                .name("Nước Ép Dưa Hấu")
                                                .description("Dưa hấu tươi ép nguyên chất ngọt mát lạnh giải nhiệt mùa hè")
                                                .category(catSinhTo)
                                                .isDrink(true)
                                                .allowToppings(false)
                                                .preparationTime(4)
                                                .imageUrl("https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=500")
                                                .status(MenuItemStatus.ACTIVE)
                                                .basePrice(new BigDecimal("35000"))
                                                .build());
                                createSize(duaHau, "S", "35000", 1);
                                createSize(duaHau, "L", "45000", 2);

                                for (Branch branch : branchRepository.findAll()) {
                                        linkBranchMenu(branch, duaHau, true, null);
                                }
                        }
                }

                // --- 5. Recipes ---
                MenuItem traSuaTraDen = menuItemRepository.findByNameAndIsDeletedFalse("Trà Sữa Trà Đen").orElse(null);
                if (traSuaTraDen != null) {
                        createRecipeIfNotExists(traSuaTraDen, "S", "Công thức Trà Sữa Trà Đen Size S", List.of(
                                        new RecipeItemConfig(ingHongTra, 15),
                                        new RecipeItemConfig(ingSuaDac, 25),
                                        new RecipeItemConfig(ingBotTraSua, 12),
                                        new RecipeItemConfig(ingDuongNuoc, 15)));
                        createRecipeIfNotExists(traSuaTraDen, "M", "Công thức Trà Sữa Trà Đen Size M", List.of(
                                        new RecipeItemConfig(ingHongTra, 20),
                                        new RecipeItemConfig(ingSuaDac, 30),
                                        new RecipeItemConfig(ingBotTraSua, 15),
                                        new RecipeItemConfig(ingDuongNuoc, 20)));
                        createRecipeIfNotExists(traSuaTraDen, "L", "Công thức Trà Sữa Trà Đen Size L", List.of(
                                        new RecipeItemConfig(ingHongTra, 25),
                                        new RecipeItemConfig(ingSuaDac, 35),
                                        new RecipeItemConfig(ingBotTraSua, 18),
                                        new RecipeItemConfig(ingDuongNuoc, 25)));
                }

                MenuItem traSuaMatcha = menuItemRepository.findByNameAndIsDeletedFalse("Trà Sữa Matcha").orElse(null);
                if (traSuaMatcha != null) {
                        createRecipeIfNotExists(traSuaMatcha, "S", "Công thức Trà Sữa Matcha Size S", List.of(
                                        new RecipeItemConfig(ingBotMatcha, 8),
                                        new RecipeItemConfig(ingSuaTuoi, 120),
                                        new RecipeItemConfig(ingSuaDac, 20),
                                        new RecipeItemConfig(ingDuongNuoc, 15)));
                        createRecipeIfNotExists(traSuaMatcha, "M", "Công thức Trà Sữa Matcha Size M", List.of(
                                        new RecipeItemConfig(ingBotMatcha, 10),
                                        new RecipeItemConfig(ingSuaTuoi, 150),
                                        new RecipeItemConfig(ingSuaDac, 25),
                                        new RecipeItemConfig(ingDuongNuoc, 20)));
                        createRecipeIfNotExists(traSuaMatcha, "L", "Công thức Trà Sữa Matcha Size L", List.of(
                                        new RecipeItemConfig(ingBotMatcha, 12),
                                        new RecipeItemConfig(ingSuaTuoi, 180),
                                        new RecipeItemConfig(ingSuaDac, 30),
                                        new RecipeItemConfig(ingDuongNuoc, 25)));
                }

                MenuItem traSuaKhoaiMon = menuItemRepository.findByNameAndIsDeletedFalse("Trà Sữa Khoai Môn")
                                .orElse(null);
                if (traSuaKhoaiMon != null) {
                        createRecipeIfNotExists(traSuaKhoaiMon, "S", "Công thức Trà Sữa Khoai Môn Size S", List.of(
                                        new RecipeItemConfig(ingBotKhoaiMon, 12),
                                        new RecipeItemConfig(ingHongTra, 10),
                                        new RecipeItemConfig(ingSuaDac, 20),
                                        new RecipeItemConfig(ingDuongNuoc, 15)));
                        createRecipeIfNotExists(traSuaKhoaiMon, "M", "Công thức Trà Sữa Khoai Môn Size M", List.of(
                                        new RecipeItemConfig(ingBotKhoaiMon, 15),
                                        new RecipeItemConfig(ingHongTra, 15),
                                        new RecipeItemConfig(ingSuaDac, 25),
                                        new RecipeItemConfig(ingDuongNuoc, 20)));
                        createRecipeIfNotExists(traSuaKhoaiMon, "L", "Công thức Trà Sữa Khoai Môn Size L", List.of(
                                        new RecipeItemConfig(ingBotKhoaiMon, 18),
                                        new RecipeItemConfig(ingHongTra, 20),
                                        new RecipeItemConfig(ingSuaDac, 30),
                                        new RecipeItemConfig(ingDuongNuoc, 25)));
                }

                MenuItem caPheCoconut = menuItemRepository.findByNameAndIsDeletedFalse("Cà Phê Dừa").orElse(null);
                if (caPheCoconut != null) {
                        createRecipeIfNotExists(caPheCoconut, "S", "Công thức Cà Phê Dừa Size S", List.of(
                                        new RecipeItemConfig(ingHatCaPhe, 15),
                                        new RecipeItemConfig(ingNuocCotDua, 60),
                                        new RecipeItemConfig(ingSuaDac, 20)));
                        createRecipeIfNotExists(caPheCoconut, "L", "Công thức Cà Phê Dừa Size L", List.of(
                                        new RecipeItemConfig(ingHatCaPhe, 22),
                                        new RecipeItemConfig(ingNuocCotDua, 90),
                                        new RecipeItemConfig(ingSuaDac, 30)));
                }

                MenuItem traDaoCamSa = menuItemRepository.findByNameAndIsDeletedFalse("Trà Đào Cam Sả").orElse(null);
                if (traDaoCamSa != null) {
                        createRecipeIfNotExists(traDaoCamSa, "S", "Công thức Trà Đào Cam Sả Size S", List.of(
                                        new RecipeItemConfig(ingTraLai, 10),
                                        new RecipeItemConfig(ingDaoNgam, 30),
                                        new RecipeItemConfig(ingCamTuoi, 40),
                                        new RecipeItemConfig(ingSaTuoi, 10),
                                        new RecipeItemConfig(ingDuongNuoc, 15)));
                        createRecipeIfNotExists(traDaoCamSa, "L", "Công thức Trà Đào Cam Sả Size L", List.of(
                                        new RecipeItemConfig(ingTraLai, 15),
                                        new RecipeItemConfig(ingDaoNgam, 50),
                                        new RecipeItemConfig(ingCamTuoi, 60),
                                        new RecipeItemConfig(ingSaTuoi, 15),
                                        new RecipeItemConfig(ingDuongNuoc, 25)));
                }

                if (matchaLatte != null) {
                        createRecipeIfNotExists(matchaLatte, "S", "Công thức Matcha Latte Size S", List.of(
                                        new RecipeItemConfig(ingBotMatcha, 6),
                                        new RecipeItemConfig(ingSuaTuoi, 150),
                                        new RecipeItemConfig(ingDuongNuoc, 15)));
                        createRecipeIfNotExists(matchaLatte, "M", "Công thức Matcha Latte Size M", List.of(
                                        new RecipeItemConfig(ingBotMatcha, 8),
                                        new RecipeItemConfig(ingSuaTuoi, 180),
                                        new RecipeItemConfig(ingDuongNuoc, 20)));
                        createRecipeIfNotExists(matchaLatte, "L", "Công thức Matcha Latte Size L", List.of(
                                        new RecipeItemConfig(ingBotMatcha, 10),
                                        new RecipeItemConfig(ingSuaTuoi, 210),
                                        new RecipeItemConfig(ingDuongNuoc, 25)));
                }

                if (duaHau != null) {
                        createRecipeIfNotExists(duaHau, "S", "Công thức Nước Ép Dưa Hấu Size S", List.of(
                                        new RecipeItemConfig(ingDuaHau, 150),
                                        new RecipeItemConfig(ingDuongNuoc, 10)));
                        createRecipeIfNotExists(duaHau, "L", "Công thức Nước Ép Dưa Hấu Size L", List.of(
                                        new RecipeItemConfig(ingDuaHau, 220),
                                        new RecipeItemConfig(ingDuongNuoc, 15)));
                }

                // --- 6. Stock Levels, POs & Adjustments per Branch ---
                List<Branch> branches = branchRepository.findAll();
                for (Branch branch : branches) {
                        if (!branch.isActive())
                                continue;

                        // Simulation of Purchase Orders to establish stock
                        List<PoItemConfig> poItems = List.of(
                                        new PoItemConfig(ingBotTraSua, 20000, 150),
                                        new PoItemConfig(ingSuaDac, 15000, 80),
                                        new PoItemConfig(ingBotKhoaiMon, 500, 200), // LOW STOCK ALERT
                                        new PoItemConfig(ingBotMatcha, 400, 300), // LOW STOCK ALERT
                                        new PoItemConfig(ingHongTra, 15000, 120),
                                        new PoItemConfig(ingTraLai, 15000, 120),
                                        new PoItemConfig(ingSuaTuoi, 25000, 40),
                                        new PoItemConfig(ingDuongNuoc, 30000, 30),
                                        new PoItemConfig(ingHatCaPhe, 25000, 250),
                                        new PoItemConfig(ingNuocCotDua, 8000, 60),
                                        new PoItemConfig(ingDaoNgam, 1200, 100), // LOW STOCK ALERT
                                        new PoItemConfig(ingCamTuoi, 8000, 80),
                                        new PoItemConfig(ingSaTuoi, 350, 50), // LOW STOCK ALERT
                                        new PoItemConfig(ingDuaHau, 12000, 30));

                        // Seed PO and stock
                        seedPurchaseOrderForBranch(branch, supDaiThinh, poItems, creatorId);

                        // Seed a manual adjustment to show transaction log diversity
                        seedAdjustmentForBranch(branch, ingDuongNuoc, -500, "Hao hụt trong quá trình pha chế",
                                        creatorId);
                        seedAdjustmentForBranch(branch, ingHongTra, -200, "Cân chỉnh cuối tuần", creatorId);

                        // --- 7. Seed Sales Orders (distribute to branches) ---
                        // Check if this branch already has any sales orders
                        long orderCount = orderRepository.countOrdersByDateRangeAndBranch(
                                        LocalDateTime.now().minusDays(365),
                                        LocalDateTime.now().plusDays(1),
                                        branch.getId());
                        if (orderCount == 0) {
                                log.info("Seeding sample sales orders for branch '{}'", branch.getName());
                                if (traSuaTraDen != null) {
                                        seedOrderForBranch(branch, traSuaTraDen, 12, 1, "M");
                                        seedOrderForBranch(branch, traSuaTraDen, 8, 2, "L");
                                        seedOrderForBranch(branch, traSuaTraDen, 15, 3, "M");
                                        seedOrderForBranch(branch, traSuaTraDen, 10, 4, "S");
                                        seedOrderForBranch(branch, traSuaTraDen, 14, 5, "M");
                                }
                                if (traSuaMatcha != null && branch.getName().contains("Quận 1")) { // Matcha is active
                                                                                                   // in Q1
                                        seedOrderForBranch(branch, traSuaMatcha, 6, 1, "M");
                                        seedOrderForBranch(branch, traSuaMatcha, 5, 3, "L");
                                        seedOrderForBranch(branch, traSuaMatcha, 4, 4, "M");
                                }
                                if (traSuaKhoaiMon != null) {
                                        seedOrderForBranch(branch, traSuaKhoaiMon, 9, 1, "M");
                                        seedOrderForBranch(branch, traSuaKhoaiMon, 7, 2, "M");
                                        seedOrderForBranch(branch, traSuaKhoaiMon, 11, 4, "L");
                                }
                                if (caPheCoconut != null) {
                                        seedOrderForBranch(branch, caPheCoconut, 15, 1, "S");
                                        seedOrderForBranch(branch, caPheCoconut, 18, 2, "L");
                                        seedOrderForBranch(branch, caPheCoconut, 10, 3, "L");
                                        seedOrderForBranch(branch, caPheCoconut, 12, 5, "S");
                                }
                                if (traDaoCamSa != null) {
                                        seedOrderForBranch(branch, traDaoCamSa, 20, 1, "L");
                                        seedOrderForBranch(branch, traDaoCamSa, 16, 2, "L");
                                        seedOrderForBranch(branch, traDaoCamSa, 25, 3, "S");
                                        seedOrderForBranch(branch, traDaoCamSa, 14, 4, "L");
                                        seedOrderForBranch(branch, traDaoCamSa, 19, 5, "L");
                                }
                                if (matchaLatte != null) {
                                        seedOrderForBranch(branch, matchaLatte, 8, 1, "M");
                                        seedOrderForBranch(branch, matchaLatte, 10, 3, "L");
                                }
                                if (duaHau != null) {
                                        seedOrderForBranch(branch, duaHau, 22, 1, "L");
                                        seedOrderForBranch(branch, duaHau, 15, 2, "S");
                                        seedOrderForBranch(branch, duaHau, 18, 4, "L");
                                }
                        }
                }
                log.info("✅ Advanced F&B seeding complete.");
        }
}
