package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.service.ReportService;
import com.example.traphe_backend.dto.response.report.*;
import com.example.traphe_backend.dto.response.report.InventoryReportResponse.InventoryReportItem;
import com.example.traphe_backend.dto.response.report.InventoryReportResponse.FastMovingItem;
import com.example.traphe_backend.dto.response.report.RevenueReportResponse.RevenueByPeriod;
import com.example.traphe_backend.dto.response.report.RevenueReportResponse.RevenueByType;
import com.example.traphe_backend.dto.response.report.RevenueReportResponse.ComparisonData;
import com.example.traphe_backend.dto.response.report.RevenueReportResponse.RevenueByBranch;
import com.example.traphe_backend.entity.*;
import com.example.traphe_backend.enums.OrderStatus;
import com.example.traphe_backend.enums.OrderType;
import com.example.traphe_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Element;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final BranchMenuItemRepository branchMenuItemRepository;
    private final LoyaltyPointTransactionRepository loyaltyPointTransactionRepository;
    private final LoyaltyPointRepository loyaltyPointRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeItemRepository recipeItemRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final MenuItemSizeRepository menuItemSizeRepository;
    private final IngredientStockRepository ingredientStockRepository;
    private final Executor taskExecutor;

    public ReportServiceImpl(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            BranchMenuItemRepository branchMenuItemRepository,
            LoyaltyPointTransactionRepository loyaltyPointTransactionRepository,
            LoyaltyPointRepository loyaltyPointRepository,
            RecipeRepository recipeRepository,
            RecipeItemRepository recipeItemRepository,
            PurchaseOrderItemRepository purchaseOrderItemRepository,
            MenuItemSizeRepository menuItemSizeRepository,
            IngredientStockRepository ingredientStockRepository,
            @Qualifier("taskExecutor") Executor taskExecutor) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.branchMenuItemRepository = branchMenuItemRepository;
        this.loyaltyPointTransactionRepository = loyaltyPointTransactionRepository;
        this.loyaltyPointRepository = loyaltyPointRepository;
        this.recipeRepository = recipeRepository;
        this.recipeItemRepository = recipeItemRepository;
        this.purchaseOrderItemRepository = purchaseOrderItemRepository;
        this.menuItemSizeRepository = menuItemSizeRepository;
        this.ingredientStockRepository = ingredientStockRepository;
        this.taskExecutor = taskExecutor;
    }

    private LocalDateTime[] getRange(String period, LocalDate start, LocalDate end) {
        LocalDateTime currentStart;
        LocalDateTime currentEnd;
        if (start != null && end != null) {
            currentStart = start.atStartOfDay();
            currentEnd = end.atTime(23, 59, 59);
        } else {
            LocalDateTime[] range = getDateRange(period != null ? period : "day");
            currentStart = range[0];
            currentEnd = range[1];
        }
        return new LocalDateTime[]{currentStart, currentEnd};
    }

    private LocalDateTime[] getDateRange(String period) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate;
        LocalDateTime endDate = now;

        switch (period.toLowerCase()) {
            case "day":
                startDate = now.toLocalDate().atStartOfDay();
                break;
            case "week":
                startDate = now.minusDays(7).toLocalDate().atStartOfDay();
                break;
            case "month":
                startDate = now.minusMonths(1).toLocalDate().atStartOfDay();
                break;
            case "year":
                startDate = now.minusYears(1).toLocalDate().atStartOfDay();
                break;
            default:
                startDate = now.toLocalDate().atStartOfDay();
        }
        return new LocalDateTime[]{startDate, endDate};
    }

    private String formatByGroup(LocalDateTime dt, String groupBy) {
        if (groupBy == null) groupBy = "DAY";
        switch (groupBy.toUpperCase()) {
            case "MONTH":
                return dt.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM"));
            case "YEAR":
                return dt.format(java.time.format.DateTimeFormatter.ofPattern("yyyy"));
            case "WEEK":
                java.time.temporal.WeekFields weekFields = java.time.temporal.WeekFields.of(Locale.getDefault());
                int week = dt.get(weekFields.weekOfWeekBasedYear());
                int year = dt.get(weekFields.weekBasedYear());
                return String.format("%d-W%02d", year, week);
            case "DAY":
            default:
                return dt.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        }
    }

    @Override
    public RevenueReportResponse getRevenueReport(String period, LocalDate startDate, LocalDate endDate, String groupBy, UUID branchId) {
        LocalDateTime[] currentRange = getRange(period, startDate, endDate);
        LocalDateTime currentStart = currentRange[0];
        LocalDateTime currentEnd = currentRange[1];

        Duration duration = Duration.between(currentStart, currentEnd);
        LocalDateTime previousStart = currentStart.minus(duration);
        LocalDateTime previousEnd = currentStart.minusNanos(1);

        // Fetch current and previous orders concurrently using CompletableFuture
        // Use findAllWithBranchByDateRangeAndBranch to eager-load Branch (avoids LazyInitializationException)
        CompletableFuture<List<Order>> currentOrdersFuture = CompletableFuture.supplyAsync(
                () -> orderRepository.findAllWithBranchByDateRangeAndBranch(currentStart, currentEnd, branchId), taskExecutor);
        CompletableFuture<List<Order>> previousOrdersFuture = CompletableFuture.supplyAsync(
                () -> orderRepository.findAllWithBranchByDateRangeAndBranch(previousStart, previousEnd, branchId), taskExecutor);

        List<Order> currentOrders = currentOrdersFuture.join();
        List<Order> previousOrders = previousOrdersFuture.join();

        BigDecimal totalRevenue = currentOrders.stream()
                .map(Order::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long totalOrders = currentOrders.size();

        // Breakdown by period
        Map<String, List<Order>> groupedByPeriod = currentOrders.stream()
                .collect(Collectors.groupingBy(o -> formatByGroup(o.getCreatedAt(), groupBy)));
        List<RevenueByPeriod> breakdown = groupedByPeriod.entrySet().stream()
                .map(entry -> RevenueByPeriod.builder()
                        .period(entry.getKey())
                        .revenue(entry.getValue().stream().map(Order::getFinalAmount).reduce(BigDecimal.ZERO, BigDecimal::add))
                        .orderCount(entry.getValue().size())
                        .build())
                .sorted(Comparator.comparing(RevenueByPeriod::getPeriod))
                .collect(Collectors.toList());

        // Breakdown by Order Type
        Map<OrderType, List<Order>> groupedByType = currentOrders.stream()
                .collect(Collectors.groupingBy(Order::getOrderType));
        List<RevenueByType> byOrderType = groupedByType.entrySet().stream()
                .map(entry -> RevenueByType.builder()
                        .orderType(entry.getKey().name())
                        .revenue(entry.getValue().stream().map(Order::getFinalAmount).reduce(BigDecimal.ZERO, BigDecimal::add))
                        .orderCount(entry.getValue().size())
                        .build())
                .collect(Collectors.toList());

        // Breakdown by Branch
        Map<Branch, List<Order>> groupedByBranch = currentOrders.stream()
                .collect(Collectors.groupingBy(Order::getBranch));
        List<RevenueByBranch> byBranch = groupedByBranch.entrySet().stream()
                .map(entry -> RevenueByBranch.builder()
                        .branchId(entry.getKey().getId())
                        .branchName(entry.getKey().getName())
                        .revenue(entry.getValue().stream().map(Order::getFinalAmount).reduce(BigDecimal.ZERO, BigDecimal::add))
                        .orderCount(entry.getValue().size())
                        .build())
                .collect(Collectors.toList());

        // Comparison Data
        BigDecimal prevRev = previousOrders.stream()
                .map(Order::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal difference = totalRevenue.subtract(prevRev);
        double percentageChange = 0.0;
        if (prevRev.compareTo(BigDecimal.ZERO) > 0) {
            percentageChange = difference.multiply(BigDecimal.valueOf(100))
                    .divide(prevRev, 2, java.math.RoundingMode.HALF_UP).doubleValue();
        } else if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
            percentageChange = 100.0;
        }
        ComparisonData comparison = ComparisonData.builder()
                .previousRevenue(prevRev)
                .difference(difference)
                .percentageChange(percentageChange)
                .build();

        return RevenueReportResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .periodStart(currentStart)
                .periodEnd(currentEnd)
                .periodType(period != null ? period : "CUSTOM")
                .breakdown(breakdown)
                .byOrderType(byOrderType)
                .byBranch(byBranch)
                .comparison(comparison)
                .build();
    }

    @Override
    public TopProductsReportResponse getTopProductsReport(String period, LocalDate startDate, LocalDate endDate, String sortBy, int limit, UUID branchId) {
        LocalDateTime[] currentRange = getRange(period, startDate, endDate);
        LocalDateTime currentStart = currentRange[0];
        LocalDateTime currentEnd = currentRange[1];

        // Fetch top products (1000 items maximum to sort in memory)
        List<TopProductResponse> list = orderItemRepository.findTopProducts(currentStart, currentEnd, branchId, PageRequest.of(0, 1000));
        
        if ("REVENUE".equalsIgnoreCase(sortBy)) {
            list.sort((a, b) -> b.getTotalRevenueGenerated().compareTo(a.getTotalRevenueGenerated()));
        } else {
            list.sort((a, b) -> Long.compare(b.getTotalQuantitySold(), a.getTotalQuantitySold()));
        }

        List<TopProductsReportResponse.TopProduct> topProducts = new ArrayList<>();
        int rank = 1;
        for (TopProductResponse item : list) {
            if (rank > limit) break;
            topProducts.add(TopProductsReportResponse.TopProduct.builder()
                    .rank(rank++)
                    .productVariantId(item.getMenuItemId().toString())
                    .productName(item.getProductName())
                    .variantName("")
                    .sku("")
                    .quantitySold(item.getTotalQuantitySold())
                    .totalRevenue(item.getTotalRevenueGenerated().doubleValue())
                    .build());
        }

        return TopProductsReportResponse.builder()
                .topProducts(topProducts)
                .build();
    }

    private BigDecimal calculateUnitCost(OrderItem oi, Map<String, Recipe> recipeMap, Map<UUID, List<RecipeItem>> itemsByRecipeId, Map<UUID, BigDecimal> ingredientPrices) {
        MenuItem mi = oi.getMenuItem();
        String sizeName = oi.getMenuItemSize() != null ? oi.getMenuItemSize().getSizeName() : null;

        Recipe recipe = null;
        if (sizeName != null) {
            recipe = recipeMap.get(mi.getId().toString() + "_" + sizeName.toUpperCase());
        }
        if (recipe == null) {
            recipe = recipeMap.get(mi.getId().toString() + "_GENERAL");
        }

        if (recipe != null) {
            List<RecipeItem> riList = itemsByRecipeId.get(recipe.getId());
            if (riList != null && !riList.isEmpty()) {
                BigDecimal totalRecipeCost = BigDecimal.ZERO;
                for (RecipeItem ri : riList) {
                    BigDecimal qty = ri.getQuantity();
                    BigDecimal price = ingredientPrices.getOrDefault(ri.getIngredient().getId(), BigDecimal.valueOf(100));
                    totalRecipeCost = totalRecipeCost.add(qty.multiply(price));
                }
                return totalRecipeCost;
            }
        }

        if (mi.getIngredient() != null) {
            return ingredientPrices.getOrDefault(mi.getIngredient().getId(), BigDecimal.valueOf(100));
        }

        BigDecimal price = oi.getUnitPrice() != null ? oi.getUnitPrice() : BigDecimal.ZERO;
        return price.multiply(BigDecimal.valueOf(0.4));
    }

    private double getMenuItemAvailableStock(MenuItem mi, String sizeName, Map<String, Recipe> recipeMap, Map<UUID, List<RecipeItem>> itemsByRecipeId, Map<UUID, BigDecimal> ingredientStockMap, boolean isAvailableBmi) {
        Recipe recipe = null;
        if (sizeName != null) {
            recipe = recipeMap.get(mi.getId().toString() + "_" + sizeName.toUpperCase());
        }
        if (recipe == null) {
            recipe = recipeMap.get(mi.getId().toString() + "_GENERAL");
        }

        if (recipe != null) {
            List<RecipeItem> riList = itemsByRecipeId.get(recipe.getId());
            if (riList != null && !riList.isEmpty()) {
                double minAvail = Double.MAX_VALUE;
                for (RecipeItem ri : riList) {
                    BigDecimal qtyInStock = ingredientStockMap.getOrDefault(ri.getIngredient().getId(), BigDecimal.ZERO);
                    double riQty = ri.getQuantity().doubleValue();
                    if (riQty > 0) {
                        double avail = qtyInStock.doubleValue() / riQty;
                        if (avail < minAvail) {
                            minAvail = avail;
                        }
                    }
                }
                return minAvail == Double.MAX_VALUE ? 0.0 : Math.round(minAvail * 10.0) / 10.0;
            }
        }

        if (mi.getIngredient() != null) {
            BigDecimal qtyInStock = ingredientStockMap.getOrDefault(mi.getIngredient().getId(), BigDecimal.ZERO);
            return qtyInStock.doubleValue();
        }

        return isAvailableBmi ? 50.0 : 0.0;
    }

    @Override
    public ProfitReportResponse getProfitReport(LocalDate startDate, LocalDate endDate, UUID branchId) {
        LocalDateTime[] currentRange = getRange(null, startDate, endDate);
        LocalDateTime currentStart = currentRange[0];
        LocalDateTime currentEnd = currentRange[1];

        // Fetch db calls concurrently
        CompletableFuture<List<OrderItem>> orderItemsFuture = CompletableFuture.supplyAsync(
                () -> orderItemRepository.findAllByDateRangeAndBranch(currentStart, currentEnd, branchId), taskExecutor);
        CompletableFuture<List<Recipe>> recipesFuture = CompletableFuture.supplyAsync(
                () -> recipeRepository.findAll(), taskExecutor);
        CompletableFuture<List<RecipeItem>> recipeItemsFuture = CompletableFuture.supplyAsync(
                () -> recipeItemRepository.findAll(), taskExecutor);
        CompletableFuture<List<PurchaseOrderItem>> poisFuture = CompletableFuture.supplyAsync(
                () -> purchaseOrderItemRepository.findAllWithPurchaseOrder(), taskExecutor);

        List<OrderItem> items = orderItemsFuture.join();
        List<Recipe> recipes = recipesFuture.join();
        List<RecipeItem> recipeItems = recipeItemsFuture.join();
        List<PurchaseOrderItem> pois = poisFuture.join();

        Map<UUID, BigDecimal> ingredientPrices = new HashMap<>();
        pois.stream()
                .sorted(Comparator.comparing(poi -> poi.getPurchaseOrder().getCreatedAt() != null ? poi.getPurchaseOrder().getCreatedAt() : LocalDateTime.MIN))
                .forEach(poi -> {
                    if (poi.getIngredient() != null) {
                        ingredientPrices.put(poi.getIngredient().getId(), poi.getUnitPrice());
                    }
                });

        Map<UUID, List<RecipeItem>> itemsByRecipeId = recipeItems.stream()
                .filter(ri -> ri.getRecipe() != null)
                .collect(Collectors.groupingBy(ri -> ri.getRecipe().getId()));

        Map<String, Recipe> recipeMap = new HashMap<>();
        for (Recipe r : recipes) {
            if (r.getMenuItem() == null || r.isDeleted() || !r.isActive()) continue;
            String sizeKey = r.getSize() != null ? r.getSize().toUpperCase() : "GENERAL";
            recipeMap.put(r.getMenuItem().getId().toString() + "_" + sizeKey, r);
        }

        Map<String, List<OrderItem>> grouped = items.stream().collect(
                Collectors.groupingBy(oi -> oi.getMenuItem().getId().toString() + "_" + (oi.getMenuItemSize() != null ? oi.getMenuItemSize().getSizeName() : "DEFAULT"))
        );

        List<ProfitReportResponse.ProductProfit> details = new ArrayList<>();
        BigDecimal totalCostAll = BigDecimal.ZERO;
        BigDecimal totalRevenueAll = BigDecimal.ZERO;

        for (Map.Entry<String, List<OrderItem>> entry : grouped.entrySet()) {
            List<OrderItem> list = entry.getValue();
            OrderItem first = list.get(0);
            MenuItem mi = first.getMenuItem();
            String sizeName = first.getMenuItemSize() != null ? first.getMenuItemSize().getSizeName() : "";

            long quantitySold = list.stream().mapToLong(OrderItem::getQuantity).sum();
            BigDecimal revenue = list.stream().map(OrderItem::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal cost = BigDecimal.ZERO;
            for (OrderItem oi : list) {
                BigDecimal baseCost = calculateUnitCost(oi, recipeMap, itemsByRecipeId, ingredientPrices);
                BigDecimal toppingCost = BigDecimal.ZERO;
                if (oi.getSelectedToppings() != null) {
                    for (OrderItemTopping oit : oi.getSelectedToppings()) {
                        BigDecimal tPrice = oit.getPriceAtOrder() != null ? oit.getPriceAtOrder() : BigDecimal.ZERO;
                        toppingCost = toppingCost.add(tPrice.multiply(BigDecimal.valueOf(oit.getQuantity())).multiply(BigDecimal.valueOf(0.4)));
                    }
                }
                cost = cost.add(baseCost.add(toppingCost).multiply(BigDecimal.valueOf(oi.getQuantity())));
            }

            totalCostAll = totalCostAll.add(cost);
            totalRevenueAll = totalRevenueAll.add(revenue);

            BigDecimal profit = revenue.subtract(cost);
            double margin = 0.0;
            if (revenue.compareTo(BigDecimal.ZERO) > 0) {
                margin = profit.multiply(BigDecimal.valueOf(100)).divide(revenue, 2, java.math.RoundingMode.HALF_UP).doubleValue();
            }

            String skuStr = mi.getIngredient() != null && mi.getIngredient().getSku() != null ? mi.getIngredient().getSku() : "";

            details.add(ProfitReportResponse.ProductProfit.builder()
                    .productVariantId(entry.getKey())
                    .productName(mi.getName())
                    .variantName(sizeName)
                    .sku(skuStr)
                    .quantitySold(quantitySold)
                    .revenue(revenue)
                    .cost(cost)
                    .grossProfit(profit)
                    .profitMargin(margin)
                    .build());
        }

        BigDecimal grossProfitAll = totalRevenueAll.subtract(totalCostAll);
        double profitMarginAll = 0.0;
        if (totalRevenueAll.compareTo(BigDecimal.ZERO) > 0) {
            profitMarginAll = grossProfitAll.multiply(BigDecimal.valueOf(100)).divide(totalRevenueAll, 2, java.math.RoundingMode.HALF_UP).doubleValue();
        }

        return ProfitReportResponse.builder()
                .totalRevenue(totalRevenueAll)
                .totalCost(totalCostAll)
                .grossProfit(grossProfitAll)
                .profitMargin(profitMarginAll)
                .details(details)
                .build();
    }

    @Override
    public List<StockForecastResponse> getStockForecast(UUID branchId) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(30);
        LocalDateTime endDate = LocalDateTime.now();

        List<OrderItem> lastMonthItems = orderItemRepository.findAllByDateRangeAndBranch(startDate, endDate, branchId);

        Map<UUID, Long> itemSales = lastMonthItems.stream()
                .collect(Collectors.groupingBy(oi -> oi.getMenuItem().getId(), Collectors.summingLong(OrderItem::getQuantity)));

        List<BranchMenuItem> bmis = branchId == null ? branchMenuItemRepository.findAll() : branchMenuItemRepository.findByBranchId(branchId);


        List<StockForecastResponse> forecastList = new ArrayList<>();
        for (BranchMenuItem bmi : bmis) {
            MenuItem mi = bmi.getMenuItem();
            if (mi.isDeleted()) continue;

            long totalSales = itemSales.getOrDefault(mi.getId(), 0L);
            double avgDailySales = totalSales / 30.0;
            double projectedDemand = avgDailySales * 7;

            forecastList.add(StockForecastResponse.builder()
                    .menuItemId(mi.getId())
                    .productName(mi.getName())
                    .averageDailySales(Math.round(avgDailySales * 100.0) / 100.0)
                    .projected7DayDemand((int) Math.ceil(projectedDemand))
                    .build());
        }

        return forecastList;
    }

    @Override
    public LoyaltyStatsResponse getLoyaltyStats() {
        CompletableFuture<Long> issuedFuture = CompletableFuture.supplyAsync(
                () -> loyaltyPointTransactionRepository.sumPointsByType(com.example.traphe_backend.enums.LoyaltyTransactionType.EARN), taskExecutor);
        CompletableFuture<Long> redeemedFuture = CompletableFuture.supplyAsync(
                () -> loyaltyPointTransactionRepository.sumPointsByType(com.example.traphe_backend.enums.LoyaltyTransactionType.REDEEM), taskExecutor);
        CompletableFuture<Long> activeUsersFuture = CompletableFuture.supplyAsync(
                () -> loyaltyPointTransactionRepository.countActiveLoyaltyUsers(), taskExecutor);
        CompletableFuture<List<Object[]>> tierCountFuture = CompletableFuture.supplyAsync(
                () -> loyaltyPointRepository.countMembersPerTier(), taskExecutor);

        Long issued = issuedFuture.join();
        Long redeemed = redeemedFuture.join();
        Long activeUsers = activeUsersFuture.join();
        List<Object[]> tierCounts = tierCountFuture.join();

        Map<String, Long> membersPerTier = new HashMap<>();
        for (Object[] obj : tierCounts) {
            String tierName = obj[0] != null ? obj[0].toString() : "Unknown";
            Long count = obj[1] != null ? (Long) obj[1] : 0L;
            membersPerTier.put(tierName, count);
        }

        return LoyaltyStatsResponse.builder()
                .totalPointsIssued(issued != null ? issued : 0L)
                .totalPointsRedeemed(redeemed != null ? redeemed : 0L)
                .activeLoyaltyUsers(activeUsers)
                .membersPerTier(membersPerTier)
                .build();
    }

    @Override
    public InventoryReportResponse getInventoryReport(UUID branchId) {
        List<BranchMenuItem> bmis = branchId == null ? branchMenuItemRepository.findAll() : branchMenuItemRepository.findByBranchId(branchId);
        List<IngredientStock> stocks = branchId == null ? ingredientStockRepository.findAll() : ingredientStockRepository.findByBranchId(branchId);
        Map<UUID, BigDecimal> ingredientStockMap = stocks.stream()
                .collect(Collectors.toMap(s -> s.getIngredient().getId(), IngredientStock::getQuantityAvailable, (a, b) -> a.add(b)));

        List<Recipe> recipes = recipeRepository.findAll();
        List<RecipeItem> recipeItems = recipeItemRepository.findAll();
        List<MenuItemSize> menuItemSizes = menuItemSizeRepository.findAll();

        Map<UUID, List<RecipeItem>> itemsByRecipeId = recipeItems.stream()
                .filter(ri -> ri.getRecipe() != null)
                .collect(Collectors.groupingBy(ri -> ri.getRecipe().getId()));

        Map<String, Recipe> recipeMap = new HashMap<>();
        for (Recipe r : recipes) {
            if (r.getMenuItem() == null || r.isDeleted() || !r.isActive()) continue;
            String sizeKey = r.getSize() != null ? r.getSize().toUpperCase() : "GENERAL";
            recipeMap.put(r.getMenuItem().getId().toString() + "_" + sizeKey, r);
        }

        // Active orders for reserved quantities
        List<OrderStatus> activeStatuses = List.of(OrderStatus.PENDING, OrderStatus.CONFIRMED);
        List<Order> activeOrders = orderRepository.findAllByBranchAndStatuses(branchId, activeStatuses);

        Map<String, Long> reservedQuantities = new HashMap<>();
        for (Order o : activeOrders) {
            for (OrderItem oi : o.getItems()) {
                String sizeName = oi.getMenuItemSize() != null ? oi.getMenuItemSize().getSizeName() : "DEFAULT";
                String key = oi.getMenuItem().getId().toString() + "_" + sizeName.toUpperCase();
                reservedQuantities.put(key, reservedQuantities.getOrDefault(key, 0L) + oi.getQuantity());
            }
        }

        List<InventoryReportItem> items = new ArrayList<>();
        int lowStockCount = 0;
        int outOfStockCount = 0;

        for (BranchMenuItem bmi : bmis) {
            MenuItem mi = bmi.getMenuItem();
            if (mi.isDeleted()) continue;

            List<MenuItemSize> sizes = menuItemSizes.stream()
                    .filter(sz -> sz.getMenuItem().getId().equals(mi.getId()))
                    .collect(Collectors.toList());

            String skuStr = mi.getIngredient() != null && mi.getIngredient().getSku() != null ? mi.getIngredient().getSku() : "";

            if (sizes.isEmpty()) {
                double avail = getMenuItemAvailableStock(mi, null, recipeMap, itemsByRecipeId, ingredientStockMap, bmi.isAvailable());
                long reserved = reservedQuantities.getOrDefault(mi.getId().toString() + "_DEFAULT", 0L);
                double physical = avail + reserved;
                double threshold = mi.getIngredient() != null && mi.getIngredient().getMinStockAlert() != null ? mi.getIngredient().getMinStockAlert().doubleValue() : 10.0;

                boolean isOutOfStock = avail <= 0;
                boolean isLowStock = avail <= threshold;

                if (isOutOfStock) outOfStockCount++;
                else if (isLowStock) lowStockCount++;

                items.add(InventoryReportItem.builder()
                        .productVariantId(mi.getId().toString() + "_DEFAULT")
                        .productName(mi.getName())
                        .variantName("Default")
                        .sku(skuStr)
                        .quantityPhysical(physical)
                        .quantityReserved(reserved)
                        .quantityAvailable(avail)
                        .minThreshold(threshold)
                        .isLowStock(isLowStock)
                        .isOutOfStock(isOutOfStock)
                        .build());
            } else {
                for (MenuItemSize size : sizes) {
                    double avail = getMenuItemAvailableStock(mi, size.getSizeName(), recipeMap, itemsByRecipeId, ingredientStockMap, bmi.isAvailable());
                    long reserved = reservedQuantities.getOrDefault(mi.getId().toString() + "_" + size.getSizeName().toUpperCase(), 0L);
                    double physical = avail + reserved;
                    double threshold = 10.0;

                    boolean isOutOfStock = avail <= 0;
                    boolean isLowStock = avail <= threshold;

                    if (isOutOfStock) outOfStockCount++;
                    else if (isLowStock) lowStockCount++;

                    items.add(InventoryReportItem.builder()
                            .productVariantId(mi.getId().toString() + "_" + size.getSizeName().toUpperCase())
                            .productName(mi.getName())
                            .variantName(size.getSizeName())
                            .sku(skuStr)
                            .quantityPhysical(physical)
                            .quantityReserved(reserved)
                            .quantityAvailable(avail)
                            .minThreshold(threshold)
                            .isLowStock(isLowStock)
                            .isOutOfStock(isOutOfStock)
                            .build());
                }
            }
        }

        // Fast moving items in last 30 days
        LocalDateTime startDate30 = LocalDateTime.now().minusDays(30);
        LocalDateTime endDate30 = LocalDateTime.now();
        List<OrderItem> last30DaysItems = orderItemRepository.findAllByDateRangeAndBranch(startDate30, endDate30, branchId);

        Map<String, List<OrderItem>> grouped30 = last30DaysItems.stream().collect(
                Collectors.groupingBy(oi -> oi.getMenuItem().getId().toString() + "_" + (oi.getMenuItemSize() != null ? oi.getMenuItemSize().getSizeName() : "DEFAULT"))
        );

        List<FastMovingItem> fastMovingItems = new ArrayList<>();
        for (Map.Entry<String, List<OrderItem>> entry : grouped30.entrySet()) {
            List<OrderItem> list = entry.getValue();
            OrderItem first = list.get(0);
            MenuItem mi = first.getMenuItem();
            String sizeName = first.getMenuItemSize() != null ? first.getMenuItemSize().getSizeName() : "";

            int qtySold = list.stream().mapToInt(OrderItem::getQuantity).sum();
            double avgDaily = qtySold / 30.0;

            String skuStr = mi.getIngredient() != null && mi.getIngredient().getSku() != null ? mi.getIngredient().getSku() : "";

            fastMovingItems.add(FastMovingItem.builder()
                    .productVariantId(entry.getKey())
                    .productName(mi.getName())
                    .variantName(sizeName)
                    .sku(skuStr)
                    .quantitySold(qtySold)
                    .daysSinceFirstSale(30)
                    .averageDailySales(Math.round(avgDaily * 100.0) / 100.0)
                    .build());
        }
        fastMovingItems.sort((a, b) -> Double.compare(b.getAverageDailySales(), a.getAverageDailySales()));
        List<FastMovingItem> topFastMoving = fastMovingItems.stream().limit(10).collect(Collectors.toList());

        return InventoryReportResponse.builder()
                .totalProducts(items.size())
                .lowStockProducts(lowStockCount)
                .outOfStockProducts(outOfStockCount)
                .items(items)
                .fastMovingItems(topFastMoving)
                .build();
    }

    private ByteArrayInputStream writeCsv(List<String[]> rows) {
        StringBuilder sb = new StringBuilder();
        // Write BOM for Excel UTF-8 support
        sb.append("\uFEFF");
        for (String[] row : rows) {
            for (int i = 0; i < row.length; i++) {
                String val = row[i] != null ? row[i] : "";
                if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
                    val = "\"" + val.replace("\"", "\"\"") + "\"";
                }
                sb.append(val);
                if (i < row.length - 1) {
                    sb.append(",");
                }
            }
            sb.append("\n");
        }
        return new ByteArrayInputStream(sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    private Font getVietnameseFont(float size, int style) {
        String[] fontPaths = {
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "C:\\Windows\\Fonts\\arial.ttf",
            "C:\\Windows\\Fonts\\times.ttf",
            "/usr/share/fonts/dejavu/DejaVuSans.ttf"
        };
        for (String path : fontPaths) {
            java.io.File file = new java.io.File(path);
            if (file.exists()) {
                try {
                    return FontFactory.getFont(path, com.lowagie.text.pdf.BaseFont.IDENTITY_H, com.lowagie.text.pdf.BaseFont.EMBEDDED, size, style);
                } catch (Exception e) {
                    // Ignore and try next
                }
            }
        }
        return FontFactory.getFont(FontFactory.HELVETICA, size, style);
    }

    private ByteArrayInputStream generatePdf(String title, String[] headers, List<String[]> dataRows) {
        com.lowagie.text.Document document = new com.lowagie.text.Document(com.lowagie.text.PageSize.A4);
        java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
        try {
            com.lowagie.text.pdf.PdfWriter.getInstance(document, out);
            document.open();
            
            // Add Title
            Font titleFont = getVietnameseFont(18, Font.BOLD);
            titleFont.setColor(new java.awt.Color(92, 51, 23)); // Brand Color (Roast/Espresso)
            Paragraph titlePara = new Paragraph(title, titleFont);
            titlePara.setAlignment(Element.ALIGN_CENTER);
            titlePara.setSpacingAfter(20);
            document.add(titlePara);
            
            // Add Date
            Font dateFont = getVietnameseFont(10, Font.ITALIC);
            dateFont.setColor(java.awt.Color.GRAY);
            Paragraph datePara = new Paragraph("Generated on: " + java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), dateFont);
            datePara.setAlignment(Element.ALIGN_RIGHT);
            datePara.setSpacingAfter(10);
            document.add(datePara);
            
            // Create Table
            com.lowagie.text.pdf.PdfPTable table = new com.lowagie.text.pdf.PdfPTable(headers.length);
            table.setWidthPercentage(100);
            
            // Table Header Font
            Font headerFont = getVietnameseFont(11, Font.BOLD);
            headerFont.setColor(java.awt.Color.WHITE);
            
            // Table Body Font
            Font bodyFont = getVietnameseFont(10, Font.NORMAL);
            
            // Add Headers
            for (String header : headers) {
                com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(new Phrase(header, headerFont));
                cell.setBackgroundColor(new java.awt.Color(92, 51, 23)); // Brand Color
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(8);
                table.addCell(cell);
            }
            
            // Add Rows
            boolean alternate = false;
            for (String[] rowData : dataRows) {
                alternate = !alternate;
                for (String cellText : rowData) {
                    com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(new Phrase(cellText != null ? cellText : "", bodyFont));
                    cell.setPadding(6);
                    if (alternate) {
                        cell.setBackgroundColor(new java.awt.Color(245, 240, 235)); // Warm light tint
                    } else {
                        cell.setBackgroundColor(java.awt.Color.WHITE);
                    }
                    table.addCell(cell);
                }
            }
            
            document.add(table);
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    @Override
    public ByteArrayInputStream exportRevenueReport(LocalDate startDate, LocalDate endDate, UUID branchId, String format) {
        RevenueReportResponse report = getRevenueReport(null, startDate, endDate, "DAY", branchId);
        String[] headers = new String[]{"Date/Period", "Revenue (VND)", "Order Count"};
        List<String[]> rows = new ArrayList<>();
        for (RevenueByPeriod p : report.getBreakdown()) {
            rows.add(new String[]{
                    p.getPeriod(),
                    p.getRevenue().toString(),
                    String.valueOf(p.getOrderCount())
            });
        }
        if ("PDF".equalsIgnoreCase(format)) {
            return generatePdf("Revenue Report", headers, rows);
        }
        List<String[]> csvRows = new ArrayList<>();
        csvRows.add(headers);
        csvRows.addAll(rows);
        return writeCsv(csvRows);
    }

    @Override
    public ByteArrayInputStream exportProfitReport(LocalDate startDate, LocalDate endDate, UUID branchId, String format) {
        ProfitReportResponse report = getProfitReport(startDate, endDate, branchId);
        String[] headers = new String[]{"Product Name", "Variant", "Quantity Sold", "Revenue (VND)", "Cost (VND)", "Gross Profit (VND)", "Profit Margin"};
        List<String[]> rows = new ArrayList<>();
        for (ProfitReportResponse.ProductProfit p : report.getDetails()) {
            rows.add(new String[]{
                    p.getProductName(),
                    p.getVariantName(),
                    String.valueOf(p.getQuantitySold()),
                    p.getRevenue().toString(),
                    p.getCost().toString(),
                    p.getGrossProfit().toString(),
                    String.format("%.2f%%", p.getProfitMargin())
            });
        }
        if ("PDF".equalsIgnoreCase(format)) {
            return generatePdf("Profit Report", headers, rows);
        }
        List<String[]> csvRows = new ArrayList<>();
        csvRows.add(headers);
        csvRows.addAll(rows);
        return writeCsv(csvRows);
    }

    @Override
    public ByteArrayInputStream exportTopProductsReport(String sortBy, int limit, LocalDate startDate, LocalDate endDate, UUID branchId, String format) {
        TopProductsReportResponse report = getTopProductsReport(null, startDate, endDate, sortBy, limit, branchId);
        String[] headers = new String[]{"Rank", "Product Name", "Quantity Sold", "Revenue (VND)"};
        List<String[]> rows = new ArrayList<>();
        for (TopProductsReportResponse.TopProduct p : report.getTopProducts()) {
            rows.add(new String[]{
                    String.valueOf(p.getRank()),
                    p.getProductName(),
                    String.valueOf(p.getQuantitySold()),
                    String.valueOf(p.getTotalRevenue())
            });
        }
        if ("PDF".equalsIgnoreCase(format)) {
            return generatePdf("Top Products Report", headers, rows);
        }
        List<String[]> csvRows = new ArrayList<>();
        csvRows.add(headers);
        csvRows.addAll(rows);
        return writeCsv(csvRows);
    }

    @Override
    public ByteArrayInputStream exportInventoryReport(UUID branchId, Boolean lowStockOnly, Boolean fastMovingOnly, String format) {
        InventoryReportResponse report = getInventoryReport(branchId);
        String[] headers = new String[]{"SKU", "Product Name", "Variant", "Physical Qty", "Reserved Qty", "Available Qty", "Min Threshold", "Status"};
        List<String[]> rows = new ArrayList<>();

        List<InventoryReportItem> items = report.getItems();
        if (Boolean.TRUE.equals(lowStockOnly)) {
            items = items.stream().filter(i -> i.isLowStock() || i.isOutOfStock()).collect(Collectors.toList());
        }
        if (Boolean.TRUE.equals(fastMovingOnly)) {
            Set<String> fastMovingKeys = report.getFastMovingItems().stream()
                    .map(FastMovingItem::getProductVariantId)
                    .collect(Collectors.toSet());
            items = items.stream().filter(i -> fastMovingKeys.contains(i.getProductVariantId())).collect(Collectors.toList());
        }

        for (InventoryReportItem i : items) {
            String status = i.isOutOfStock() ? "Out of Stock" : (i.isLowStock() ? "Low Stock" : "In Stock");
            rows.add(new String[]{
                    i.getSku(),
                    i.getProductName(),
                    i.getVariantName(),
                    String.valueOf(i.getQuantityPhysical()),
                    String.valueOf(i.getQuantityReserved()),
                    String.valueOf(i.getQuantityAvailable()),
                    String.valueOf(i.getMinThreshold()),
                    status
            });
        }
        if ("PDF".equalsIgnoreCase(format)) {
            return generatePdf("Inventory Status Report", headers, rows);
        }
        List<String[]> csvRows = new ArrayList<>();
        csvRows.add(headers);
        csvRows.addAll(rows);
        return writeCsv(csvRows);
    }

    @Override
    public DashboardResponse getDashboardSummary(String period, UUID branchId) {
        LocalDateTime[] range = getRange(period, null, null);
        LocalDateTime currentStart = range[0];
        LocalDateTime currentEnd = range[1];

        CompletableFuture<RevenueReportResponse> revenueFuture = CompletableFuture.supplyAsync(
                () -> getRevenueReport(period, null, null, null, branchId), taskExecutor);

        CompletableFuture<List<TopProductResponse>> topProductsFuture = CompletableFuture.supplyAsync(
                () -> orderItemRepository.findTopProducts(currentStart, currentEnd, branchId, PageRequest.of(0, 5)), taskExecutor);

        CompletableFuture<LoyaltyStatsResponse> loyaltyFuture = CompletableFuture.supplyAsync(
                this::getLoyaltyStats, taskExecutor);

        return CompletableFuture.allOf(revenueFuture, topProductsFuture, loyaltyFuture)
                .thenApply(v -> DashboardResponse.builder()
                        .revenueSummary(revenueFuture.join())
                        .topProducts(topProductsFuture.join())
                        .loyaltyStats(loyaltyFuture.join())
                        .build())
                .join();
    }
}
