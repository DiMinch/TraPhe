package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.dto.request.AddToCartRequest;
import com.example.traphe_backend.dto.response.CartResponse;
import com.example.traphe_backend.dto.response.CartResponse.CartItemResponse;
import com.example.traphe_backend.dto.response.CartResponse.ToppingInfo;
import com.example.traphe_backend.entity.CartItem;
import com.example.traphe_backend.entity.MenuItem;
import com.example.traphe_backend.entity.MenuItemSize;
import com.example.traphe_backend.entity.Topping;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.repository.CartItemRepository;
import com.example.traphe_backend.repository.MenuItemRepository;
import com.example.traphe_backend.repository.MenuItemSizeRepository;
import com.example.traphe_backend.repository.ToppingRepository;
import com.example.traphe_backend.repository.UserRepository;
import com.example.traphe_backend.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final MenuItemSizeRepository menuItemSizeRepository;
    private final ToppingRepository toppingRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(UUID userId) {
        List<CartItem> items = cartItemRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId);
        return buildCartResponse(items);
    }

    @Override
    public CartResponse addToCart(UUID userId, AddToCartRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MenuItem menuItem = menuItemRepository.findByIdAndIsDeletedFalse(request.getMenuItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found: " + request.getMenuItemId()));

        // Validate size for drinks
        MenuItemSize size = null;
        if (request.getMenuItemSizeId() != null) {
            size = menuItemSizeRepository.findById(request.getMenuItemSizeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Size not found: " + request.getMenuItemSizeId()));
            if (!size.getMenuItem().getId().equals(menuItem.getId())) {
                throw new IllegalArgumentException("Size does not belong to this menu item");
            }
        }

        // Validate toppings
        List<CartItem.ToppingSelection> toppingSelections = new ArrayList<>();
        if (request.getSelectedToppings() != null) {
            for (AddToCartRequest.ToppingSelectionRequest ts : request.getSelectedToppings()) {
                toppingRepository.findById(ts.getToppingId())
                        .orElseThrow(() -> new ResourceNotFoundException("Topping not found: " + ts.getToppingId()));
                toppingSelections.add(CartItem.ToppingSelection.builder()
                        .toppingId(ts.getToppingId())
                        .quantity(ts.getQuantity())
                        .build());
            }
        }

        // Compute config hash for deduplication
        String configHash = computeConfigHash(
                request.getMenuItemSizeId(),
                request.getSelectedOptions(),
                toppingSelections);

        // Check if same item+config already exists in cart → merge quantity
        var existingOpt = cartItemRepository
                .findByUserIdAndMenuItemIdAndSelectedOptionsHashAndIsDeletedFalse(
                        userId, menuItem.getId(), configHash);

        if (existingOpt.isPresent()) {
            CartItem existing = existingOpt.get();
            existing.setQuantity(existing.getQuantity() + request.getQuantity());
            if (request.getNote() != null) {
                existing.setNote(request.getNote());
            }
            cartItemRepository.save(existing);
        } else {
            CartItem cartItem = CartItem.builder()
                    .user(user)
                    .menuItem(menuItem)
                    .menuItemSize(size)
                    .quantity(request.getQuantity())
                    .note(request.getNote())
                    .selectedOptions(request.getSelectedOptions())
                    .selectedToppings(toppingSelections)
                    .selectedOptionsHash(configHash)
                    .isDrink(menuItem.isDrink())
                    .build();
            cartItemRepository.save(cartItem);
        }

        return getCart(userId);
    }

    @Override
    public CartResponse updateItemQuantity(UUID userId, UUID cartItemId, int quantity) {
        CartItem item = cartItemRepository.findByIdAndUserIdAndIsDeletedFalse(cartItemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (quantity <= 0) {
            item.setDeleted(true);
        } else {
            item.setQuantity(quantity);
        }
        cartItemRepository.save(item);
        return getCart(userId);
    }

    @Override
    public CartResponse removeItem(UUID userId, UUID cartItemId) {
        CartItem item = cartItemRepository.findByIdAndUserIdAndIsDeletedFalse(cartItemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        item.setDeleted(true);
        cartItemRepository.save(item);
        return getCart(userId);
    }

    @Override
    public void clearCart(UUID userId) {
        cartItemRepository.softDeleteAllByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public long getItemCount(UUID userId) {
        return cartItemRepository.countByUserIdAndIsDeletedFalse(userId);
    }

    // -------- Private helpers --------

    private CartResponse buildCartResponse(List<CartItem> items) {
        // Batch-fetch toppings for pricing
        List<UUID> allToppingIds = items.stream()
                .filter(ci -> ci.getSelectedToppings() != null)
                .flatMap(ci -> ci.getSelectedToppings().stream())
                .map(CartItem.ToppingSelection::getToppingId)
                .distinct()
                .toList();

        Map<UUID, Topping> toppingMap = allToppingIds.isEmpty()
                ? Collections.emptyMap()
                : toppingRepository.findAllById(allToppingIds).stream()
                .collect(Collectors.toMap(Topping::getId, t -> t));

        List<CartItemResponse> responseItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalItems = 0;

        for (CartItem ci : items) {
            MenuItem mi = ci.getMenuItem();
            MenuItemSize size = ci.getMenuItemSize();

            // Base price: size price > item base price
            BigDecimal basePrice = (size != null && size.getSellingPrice() != null)
                    ? size.getSellingPrice()
                    : (mi.getBasePrice() != null ? mi.getBasePrice() : BigDecimal.ZERO);

            // Topping surcharge
            BigDecimal toppingSurcharge = BigDecimal.ZERO;
            List<ToppingInfo> toppingInfos = new ArrayList<>();
            if (ci.getSelectedToppings() != null) {
                for (CartItem.ToppingSelection ts : ci.getSelectedToppings()) {
                    Topping topping = toppingMap.get(ts.getToppingId());
                    if (topping != null) {
                        BigDecimal tPrice = topping.getExtraPrice().multiply(BigDecimal.valueOf(ts.getQuantity()));
                        toppingSurcharge = toppingSurcharge.add(tPrice);
                        toppingInfos.add(ToppingInfo.builder()
                                .toppingId(topping.getId())
                                .toppingName(topping.getName())
                                .extraPrice(topping.getExtraPrice())
                                .quantity(ts.getQuantity())
                                .build());
                    }
                }
            }

            BigDecimal unitPrice = basePrice.add(toppingSurcharge);
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(ci.getQuantity()));

            responseItems.add(CartItemResponse.builder()
                    .id(ci.getId())
                    .menuItemId(mi.getId())
                    .menuItemName(mi.getName())
                    .menuItemImageUrl(mi.getImageUrl())
                    .isDrink(ci.isDrink())
                    .status(mi.getStatus() != null ? mi.getStatus().name() : "ACTIVE")
                    .menuItemSizeId(size != null ? size.getId() : null)
                    .sizeName(size != null ? size.getSizeName() : null)
                    .selectedOptions(ci.getSelectedOptions())
                    .selectedToppings(toppingInfos)
                    .note(ci.getNote())
                    .quantity(ci.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .addedAt(ci.getCreatedAt())
                    .build());

            totalAmount = totalAmount.add(subtotal);
            totalItems += ci.getQuantity();
        }

        return CartResponse.builder()
                .items(responseItems)
                .totalItems(totalItems)
                .totalAmount(totalAmount)
                .build();
    }

    /**
     * Computes a SHA-256 hash of the item configuration (size + options + toppings)
     * so items with the same config get merged into one cart row.
     */
    private String computeConfigHash(UUID sizeId,
                                     Map<String, String> options,
                                     List<CartItem.ToppingSelection> toppings) {
        StringBuilder sb = new StringBuilder();
        sb.append("size:").append(sizeId != null ? sizeId : "none").append("|");

        // Sort options for deterministic hash
        if (options != null && !options.isEmpty()) {
            new TreeMap<>(options).forEach((k, v) -> sb.append("opt:").append(k).append("=").append(v).append("|"));
        }

        // Sort toppings for deterministic hash
        if (toppings != null && !toppings.isEmpty()) {
            toppings.stream()
                    .sorted((a, b) -> a.getToppingId().compareTo(b.getToppingId()))
                    .forEach(t -> sb.append("top:").append(t.getToppingId()).append("x").append(t.getQuantity()).append("|"));
        }

        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(sb.toString().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            // Fallback — should never happen
            return sb.toString().hashCode() + "";
        }
    }
}
