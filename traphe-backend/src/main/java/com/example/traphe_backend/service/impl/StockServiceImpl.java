package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.dto.request.AdjustStockRequest;
import com.example.traphe_backend.dto.request.ImportStockRequest;
import com.example.traphe_backend.dto.response.ImportStockResponse;
import com.example.traphe_backend.dto.response.IngredientStockResponse;
import com.example.traphe_backend.entity.Branch;
import com.example.traphe_backend.entity.Ingredient;
import com.example.traphe_backend.entity.IngredientStock;
import com.example.traphe_backend.entity.StockTransaction;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.enums.NotificationType;
import com.example.traphe_backend.enums.StockReferenceType;
import com.example.traphe_backend.enums.StockTransactionType;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.mapper.StockMapper;
import com.example.traphe_backend.repository.BranchRepository;
import com.example.traphe_backend.repository.IngredientRepository;
import com.example.traphe_backend.repository.IngredientStockRepository;
import com.example.traphe_backend.repository.StockTransactionRepository;
import com.example.traphe_backend.repository.SupplierRepository;
import com.example.traphe_backend.repository.UserRepository;
import com.example.traphe_backend.service.NotificationService;
import com.example.traphe_backend.service.StockService;
import com.example.traphe_backend.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService {

    private final IngredientStockRepository stockRepository;
    private final StockTransactionRepository transactionRepository;
    private final IngredientRepository ingredientRepository;
    private final BranchRepository branchRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final StockMapper stockMapper;
    private final SystemConfigService systemConfigService;

    @Override
    @Transactional(readOnly = true)
    public List<IngredientStockResponse> getStockByBranch(UUID branchId, String searchName, Boolean lowStockOnly) {

        List<IngredientStock> stocks;

        if (branchId == null) {
            if (Boolean.TRUE.equals(lowStockOnly)) {
                stocks = stockRepository.findAllLowStock();
            } else {
                stocks = stockRepository.findAll();
            }
        } else {
            if (Boolean.TRUE.equals(lowStockOnly)) {
                stocks = stockRepository.findLowStockByBranchId(branchId);
            } else {
                stocks = stockRepository.findByBranchId(branchId);
            }
        }

        // Batch-fetch ingredients
        Set<UUID> ingredientIds = stocks.stream()
                .map(s -> s.getIngredient().getId())
                .collect(Collectors.toSet());
        Map<UUID, Ingredient> ingredientMap = ingredientRepository.findAllByIdInAndIsDeletedFalse(ingredientIds)
                .stream().collect(Collectors.toMap(Ingredient::getId, i -> i));

        return stocks.stream()
                .filter(s -> {
                    if (searchName == null || searchName.isBlank()) return true;
                    Ingredient ing = ingredientMap.get(s.getIngredient().getId());
                    return ing != null && ing.getName().toLowerCase().contains(searchName.toLowerCase());
                })
                .map(s -> stockMapper.toStockResponse(s, ingredientMap.get(s.getIngredient().getId())))
                .toList();
    }

    @Override
    @Transactional
    public ImportStockResponse importStock(UUID branchId, ImportStockRequest request, String userEmail) {

        // 1. Validate branch
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Chi nhánh không tồn tại với ID: " + branchId));

        // 2. Validate supplier (optional)
        if (request.getSupplierId() != null) {
            supplierRepository.findByIdAndIsDeletedFalse(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Nhà cung cấp không tồn tại với ID: " + request.getSupplierId()));
        }

        // 3. Resolve user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 4. Batch-fetch ingredients
        Set<UUID> ingredientIds = request.getItems().stream()
                .map(ImportStockRequest.ImportItem::getIngredientId)
                .collect(Collectors.toSet());
        Map<UUID, Ingredient> ingredientMap = ingredientRepository.findAllByIdInAndIsDeletedFalse(ingredientIds)
                .stream().collect(Collectors.toMap(Ingredient::getId, i -> i));

        // Validate all ingredients exist + active
        for (UUID ingId : ingredientIds) {
            Ingredient ingredient = ingredientMap.get(ingId);
            if (ingredient == null) {
                throw new ResourceNotFoundException("Nguyên liệu không tồn tại với ID: " + ingId);
            }
            if (!ingredient.isActive()) {
                throw new IllegalArgumentException("Nguyên liệu '" + ingredient.getName() + "' đã bị vô hiệu hoá.");
            }
        }

        // 5. Batch-fetch existing stocks
        Map<UUID, IngredientStock> existingStocks = stockRepository
                .findByBranchIdAndIngredientIdIn(branchId, ingredientIds)
                .stream().collect(Collectors.toMap(s -> s.getIngredient().getId(), s -> s));

        // 6. Process each import item
        List<ImportStockResponse.ImportedItem> importedItems = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (ImportStockRequest.ImportItem item : request.getItems()) {
            Ingredient ingredient = ingredientMap.get(item.getIngredientId());
            IngredientStock stock = existingStocks.get(item.getIngredientId());

            BigDecimal quantityBefore;

            if (stock == null) {
                // Create new stock record
                stock = IngredientStock.builder()
                        .branch(branch)
                        .ingredient(ingredient)
                        .quantityAvailable(BigDecimal.ZERO)
                        .build();
                quantityBefore = BigDecimal.ZERO;
            } else {
                quantityBefore = stock.getQuantityAvailable();
            }

            BigDecimal quantityAfter = quantityBefore.add(item.getQuantity());
            stock.setQuantityAvailable(quantityAfter);
            stock.setLastUpdated(now);
            stockRepository.save(stock);

            // Create transaction log
            StockTransaction tx = StockTransaction.builder()
                    .branch(branch)
                    .ingredient(ingredient)
                    .type(StockTransactionType.IMPORT)
                    .quantityChange(item.getQuantity())
                    .quantityBefore(quantityBefore)
                    .quantityAfter(quantityAfter)
                    .referenceType(request.getSupplierId() != null ? StockReferenceType.PURCHASE_ORDER : StockReferenceType.MANUAL)
                    .referenceId(request.getSupplierId())
                    .createdAt(now)
                    .createdBy(user.getId())
                    .build();
            transactionRepository.save(tx);

            importedItems.add(ImportStockResponse.ImportedItem.builder()
                    .ingredientName(ingredient.getName())
                    .quantityImported(item.getQuantity())
                    .newQuantity(quantityAfter)
                    .build());

            // Check low stock (might have been resolved by import)
            checkAndClearLowStock(stock, ingredient, branchId);
        }

        log.info("Stock imported at branch {} — {} items", branch.getName(), importedItems.size());

        return ImportStockResponse.builder()
                .totalItemsImported(importedItems.size())
                .items(importedItems)
                .build();
    }

    @Override
    @Transactional
    public IngredientStockResponse adjustStock(UUID branchId, AdjustStockRequest request, String userEmail) {

        // 1. Validate branch
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Chi nhánh không tồn tại với ID: " + branchId));

        // 2. Validate ingredient
        Ingredient ingredient = ingredientRepository.findByIdAndIsDeletedFalse(request.getIngredientId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Nguyên liệu không tồn tại với ID: " + request.getIngredientId()));

        // 3. Resolve user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 4. Get or create stock
        IngredientStock stock = stockRepository.findByBranchIdAndIngredientId(branchId, request.getIngredientId())
                .orElse(IngredientStock.builder()
                        .branch(branch)
                        .ingredient(ingredient)
                        .quantityAvailable(BigDecimal.ZERO)
                        .build());

        BigDecimal quantityBefore = stock.getQuantityAvailable();
        BigDecimal quantityAfter = quantityBefore.add(request.getQuantity());

        // Validate: after adjustment, stock cannot be negative
        if (quantityAfter.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Không thể điều chỉnh. Tồn kho hiện tại: " + quantityBefore.toPlainString()
                            + ", điều chỉnh: " + request.getQuantity().toPlainString()
                            + " → kết quả sẽ âm.");
        }

        LocalDateTime now = LocalDateTime.now();
        stock.setQuantityAvailable(quantityAfter);
        stock.setLastUpdated(now);
        stockRepository.save(stock);

        // Create transaction log
        StockTransaction tx = StockTransaction.builder()
                .branch(branch)
                .ingredient(ingredient)
                .type(StockTransactionType.ADJUST)
                .quantityChange(request.getQuantity())
                .quantityBefore(quantityBefore)
                .quantityAfter(quantityAfter)
                .referenceType(StockReferenceType.MANUAL)
                .reason(request.getReason())
                .createdAt(now)
                .createdBy(user.getId())
                .build();
        transactionRepository.save(tx);

        log.info("Stock adjusted at branch {} — {} by {} (reason: {})",
                branch.getName(), ingredient.getName(), request.getQuantity(), request.getReason());

        // Check low stock notification
        checkLowStockNotification(stock, ingredient, branchId);

        return stockMapper.toStockResponse(stock, ingredient);
    }

    // ==================== Low Stock Helpers ====================

    /**
     * Returns the effective stock alert threshold for an ingredient.
     * Uses the ingredient's own minStockAlert if set, otherwise falls back
     * to the system-wide DEFAULT_INVENTORY_THRESHOLD config.
     */
    private BigDecimal getEffectiveThreshold(Ingredient ingredient) {
        if (ingredient.getMinStockAlert() != null) {
            return ingredient.getMinStockAlert();
        }
        // Fallback to system-wide default
        return systemConfigService.getValueByKey("DEFAULT_INVENTORY_THRESHOLD")
                .map(val -> {
                    try { return new BigDecimal(val); }
                    catch (NumberFormatException e) { return null; }
                })
                .orElse(null);
    }

    private void checkLowStockNotification(IngredientStock stock, Ingredient ingredient, UUID branchId) {
        BigDecimal threshold = getEffectiveThreshold(ingredient);
        if (threshold != null && stock.getQuantityAvailable().compareTo(threshold) < 0) {
            createLowStockNotification(ingredient, stock, branchId, threshold);
        }
    }

    private void checkAndClearLowStock(IngredientStock stock, Ingredient ingredient, UUID branchId) {
        // After import, if still low, notify
        BigDecimal threshold = getEffectiveThreshold(ingredient);
        if (threshold != null && stock.getQuantityAvailable().compareTo(threshold) < 0) {
            createLowStockNotification(ingredient, stock, branchId, threshold);
        }
    }

    private void createLowStockNotification(Ingredient ingredient, IngredientStock stock, UUID branchId, BigDecimal threshold) {
        try {
            notificationService.createNotification(
                "Cảnh báo tồn kho thấp",
                String.format("Nguyên liệu '%s' tại chi nhánh hiện chỉ còn %s %s (ngưỡng: %s %s).",
                        ingredient.getName(),
                        stock.getQuantityAvailable().toPlainString(),
                        ingredient.getUnit(),
                        threshold.toPlainString(),
                        ingredient.getUnit()),
                NotificationType.LOW_STOCK,
                branchId,
                null, // null userId means broadcast to all staff with access to this branch
                "LOW_STOCK"
            );
        } catch (Exception e) {
            log.error("Failed to create low stock notification for ingredient {} — {}", ingredient.getName(), e.getMessage());
        }
        log.warn("LOW STOCK ALERT: {} at branch {} — {} {} (threshold: {})",
                ingredient.getName(), branchId,
                stock.getQuantityAvailable(), ingredient.getUnit(), threshold);
    }
}
