package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.entity.Ingredient;
import com.example.traphe_backend.entity.IngredientStock;
import com.example.traphe_backend.entity.Notification;
import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.entity.OrderItem;
import com.example.traphe_backend.entity.Recipe;
import com.example.traphe_backend.entity.RecipeItem;
import com.example.traphe_backend.entity.StockTransaction;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.enums.NotificationType;
import com.example.traphe_backend.enums.StockReferenceType;
import com.example.traphe_backend.enums.StockTransactionType;
import com.example.traphe_backend.exception.InsufficientStockException;
import com.example.traphe_backend.repository.IngredientRepository;
import com.example.traphe_backend.repository.IngredientStockRepository;
import com.example.traphe_backend.repository.NotificationRepository;
import com.example.traphe_backend.repository.RecipeItemRepository;
import com.example.traphe_backend.repository.RecipeRepository;
import com.example.traphe_backend.repository.StockTransactionRepository;
import com.example.traphe_backend.repository.UserRepository;
import com.example.traphe_backend.service.InventoryDeductionService;
import com.example.traphe_backend.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Core service for deducting ingredient stock when a drink order is completed.
 *
 * Flow:
 * 1. Collect menuItemIds + sizes from order items
 * 2. Batch-fetch active recipes
 * 3. Batch-fetch recipe items
 * 4. Resolve: which recipe applies to each order item (by menuItemId + sizeName)
 * 5. Aggregate: total required per ingredient
 * 6. PESSIMISTIC_WRITE lock on stock rows
 * 7. Validate sufficiency
 * 8. Deduct + log transactions
 * 9. Check low stock → notifications
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryDeductionServiceImpl implements InventoryDeductionService {

    private final RecipeRepository recipeRepository;
    private final RecipeItemRepository recipeItemRepository;
    private final IngredientStockRepository stockRepository;
    private final StockTransactionRepository transactionRepository;
    private final IngredientRepository ingredientRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SystemConfigService systemConfigService;

    @Override
    public void deductStockForOrder(Order order, String userEmail) {

        if (order.getBranch() == null) {
            log.info("Order {} has no branch — skipping stock deduction (merchandise order).",
                    order.getOrderNumber());
            return;
        }

        UUID branchId = order.getBranch().getId();
        List<OrderItem> orderItems = order.getItems();

        if (orderItems == null || orderItems.isEmpty()) {
            log.info("Order {} has no items — skipping stock deduction.", order.getOrderNumber());
            return;
        }

        // 1. Separate drink items and merchandise items
        Set<UUID> drinkMenuItemIds = orderItems.stream()
                .filter(oi -> oi.getMenuItem().isDrink())
                .map(oi -> oi.getMenuItem().getId())
                .collect(Collectors.toSet());

        // 2. Map tracking total requirements
        Map<UUID, BigDecimal> totalRequired = new HashMap<>();

        // 3. Add merchandise directly
        for (OrderItem orderItem : orderItems) {
            if (!orderItem.getMenuItem().isDrink()) {
                Ingredient ingredient = orderItem.getMenuItem().getIngredient();
                if (ingredient != null) {
                    totalRequired.merge(ingredient.getId(),
                            BigDecimal.valueOf(orderItem.getQuantity()), BigDecimal::add);
                } else {
                    log.warn("Merchandise item '{}' has no mapped ingredient for deduction.",
                            orderItem.getMenuItem().getName());
                }
            }
        }

        // 4. Process recipes for drinks
        if (!drinkMenuItemIds.isEmpty()) {
            List<Recipe> recipes = recipeRepository.findActiveByMenuItemIdIn(drinkMenuItemIds);

            if (!recipes.isEmpty()) {
                Set<UUID> recipeIds = recipes.stream().map(Recipe::getId).collect(Collectors.toSet());
                List<RecipeItem> allRecipeItems = recipeItemRepository.findByRecipeIdIn(recipeIds);
                Map<UUID, List<RecipeItem>> recipeItemsByRecipeId = allRecipeItems.stream()
                        .collect(Collectors.groupingBy(ri -> ri.getRecipe().getId()));

                Map<String, Recipe> recipeLookup = new HashMap<>();
                for (Recipe recipe : recipes) {
                    String key = recipe.getMenuItem().getId() + "|" + (recipe.getSize() != null ? recipe.getSize() : "NULL");
                    recipeLookup.put(key, recipe);
                }

                for (OrderItem orderItem : orderItems) {
                    if (!orderItem.getMenuItem().isDrink()) continue;

                    UUID menuItemId = orderItem.getMenuItem().getId();
                    String sizeName = orderItem.getMenuItemSize() != null
                            ? orderItem.getMenuItemSize().getSizeName().toUpperCase()
                            : null;

                    String exactKey = menuItemId + "|" + (sizeName != null ? sizeName : "NULL");
                    String fallbackKey = menuItemId + "|NULL";

                    Recipe recipe = recipeLookup.get(exactKey);
                    if (recipe == null && sizeName != null) {
                        recipe = recipeLookup.get(fallbackKey);
                    }

                    if (recipe != null) {
                        List<RecipeItem> recipeItems = recipeItemsByRecipeId.getOrDefault(recipe.getId(), List.of());
                        for (RecipeItem ri : recipeItems) {
                            BigDecimal required = ri.getQuantity().multiply(BigDecimal.valueOf(orderItem.getQuantity()));
                            totalRequired.merge(ri.getIngredient().getId(), required, BigDecimal::add);
                        }
                    } else {
                        log.debug("No recipe for menuItem {} size {} — skipping.", menuItemId, sizeName);
                    }
                }
            }
        }

        if (totalRequired.isEmpty()) {
            log.info("No ingredient deduction needed for order {}.", order.getOrderNumber());
            return;
        }

        // 6. PESSIMISTIC_WRITE lock on stock rows
        List<IngredientStock> lockedStocks = stockRepository.findByBranchIdAndIngredientIdsForUpdate(
                branchId, totalRequired.keySet());

        Map<UUID, IngredientStock> stockMap = lockedStocks.stream()
                .collect(Collectors.toMap(s -> s.getIngredient().getId(), s -> s));

        // Batch-fetch ingredient details for error messages and notifications
        Map<UUID, Ingredient> ingredientMap = ingredientRepository
                .findAllByIdInAndIsDeletedFalse(totalRequired.keySet())
                .stream().collect(Collectors.toMap(Ingredient::getId, i -> i));

        // 7. Validate sufficiency
        for (Map.Entry<UUID, BigDecimal> entry : totalRequired.entrySet()) {
            UUID ingredientId = entry.getKey();
            BigDecimal required = entry.getValue();
            IngredientStock stock = stockMap.get(ingredientId);
            Ingredient ingredient = ingredientMap.get(ingredientId);

            String ingredientName = ingredient != null ? ingredient.getName() : ingredientId.toString();

            if (stock == null) {
                throw new InsufficientStockException(ingredientName, required, BigDecimal.ZERO);
            }

            if (stock.getQuantityAvailable().compareTo(required) < 0) {
                throw new InsufficientStockException(ingredientName, required, stock.getQuantityAvailable());
            }
        }

        // 8. Deduct
        UUID userId = resolveUserId(userEmail);
        LocalDateTime now = LocalDateTime.now();

        for (Map.Entry<UUID, BigDecimal> entry : totalRequired.entrySet()) {
            UUID ingredientId = entry.getKey();
            BigDecimal required = entry.getValue();
            IngredientStock stock = stockMap.get(ingredientId);
            Ingredient ingredient = ingredientMap.get(ingredientId);

            BigDecimal quantityBefore = stock.getQuantityAvailable();
            BigDecimal quantityAfter = quantityBefore.subtract(required);

            stock.setQuantityAvailable(quantityAfter);
            stock.setLastUpdated(now);
            stockRepository.save(stock);

            // Transaction log
            StockTransaction tx = StockTransaction.builder()
                    .branch(order.getBranch())
                    .ingredient(ingredient)
                    .type(StockTransactionType.DEDUCT)
                    .quantityChange(required.negate())
                    .quantityBefore(quantityBefore)
                    .quantityAfter(quantityAfter)
                    .referenceType(StockReferenceType.ORDER)
                    .referenceId(order.getId())
                    .reason("Trừ nguyên liệu cho đơn " + order.getOrderNumber())
                    .createdAt(now)
                    .createdBy(userId)
                    .build();
            transactionRepository.save(tx);

            // 9. Check low stock notification (per-ingredient threshold or system-wide default)
            if (ingredient != null) {
                BigDecimal threshold = ingredient.getMinStockAlert();
                if (threshold == null) {
                    threshold = systemConfigService.getValueByKey("DEFAULT_INVENTORY_THRESHOLD")
                            .map(val -> { try { return new BigDecimal(val); } catch (NumberFormatException e) { return null; } })
                            .orElse(null);
                }
                if (threshold != null && quantityAfter.compareTo(threshold) < 0) {
                    Notification notification = Notification.builder()
                            .branchId(branchId)
                            .title("Cảnh báo tồn kho thấp")
                            .message(String.format(
                                    "Nguyên liệu '%s' còn %s %s sau khi pha đơn %s (ngưỡng: %s %s).",
                                    ingredient.getName(),
                                    quantityAfter.toPlainString(), ingredient.getUnit(),
                                    order.getOrderNumber(),
                                    threshold.toPlainString(), ingredient.getUnit()))
                            .type(NotificationType.LOW_STOCK)
                            .createdAt(now)
                            .build();
                    notificationRepository.save(notification);
                    log.warn("LOW STOCK after order {}: {} — {} {} remaining",
                            order.getOrderNumber(), ingredient.getName(), quantityAfter, ingredient.getUnit());
                }
            }
        }

        log.info("Stock deducted for order {} — {} ingredients affected",
                order.getOrderNumber(), totalRequired.size());
    }

    private UUID resolveUserId(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .map(User::getId)
                .orElse(null);
    }
}
