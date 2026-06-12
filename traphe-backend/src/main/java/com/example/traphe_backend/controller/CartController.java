package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.AddToCartRequest;
import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.CartResponse;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.repository.UserRepository;
import com.example.traphe_backend.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Shopping cart management for authenticated customers")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get current user's cart", description = "Returns all cart items with pricing details")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = resolveUserId(userDetails);
        CartResponse cart = cartService.getCart(userId);
        return ResponseEntity.ok(ApiResponse.success(cart, "Cart retrieved successfully"));
    }

    @GetMapping("/count")
    @Operation(summary = "Get cart item count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getCartCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = resolveUserId(userDetails);
        long count = cartService.getItemCount(userId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count), "Cart count retrieved"));
    }

    @PostMapping("/add")
    @Operation(summary = "Add item to cart",
            description = "Add a menu item with size/options/toppings. If same configuration exists, quantities merge.")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AddToCartRequest request) {
        UUID userId = resolveUserId(userDetails);
        CartResponse cart = cartService.addToCart(userId, request);
        return ResponseEntity.ok(ApiResponse.success(cart, "Item added to cart"));
    }

    @PutMapping("/update/{cartItemId}")
    @Operation(summary = "Update cart item quantity")
    public ResponseEntity<ApiResponse<CartResponse>> updateQuantity(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID cartItemId,
            @RequestParam int quantity) {
        UUID userId = resolveUserId(userDetails);
        CartResponse cart = cartService.updateItemQuantity(userId, cartItemId, quantity);
        return ResponseEntity.ok(ApiResponse.success(cart, "Cart updated"));
    }

    @PutMapping("/update-customization/{cartItemId}")
    @Operation(summary = "Update cart item customization (size/options/toppings)")
    public ResponseEntity<ApiResponse<CartResponse>> updateCustomization(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID cartItemId,
            @Valid @RequestBody AddToCartRequest request) {
        UUID userId = resolveUserId(userDetails);
        CartResponse cart = cartService.updateItemCustomization(userId, cartItemId, request);
        return ResponseEntity.ok(ApiResponse.success(cart, "Item customization updated"));
    }

    @DeleteMapping("/remove/{cartItemId}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID cartItemId) {
        UUID userId = resolveUserId(userDetails);
        CartResponse cart = cartService.removeItem(userId, cartItemId);
        return ResponseEntity.ok(ApiResponse.success(cart, "Item removed from cart"));
    }

    @DeleteMapping("/clear")
    @Operation(summary = "Clear all items from cart")
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = resolveUserId(userDetails);
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Cart cleared"));
    }

    // ---- Helper ----
    private UUID resolveUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
        return user.getId();
    }
}
