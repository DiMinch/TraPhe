package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.MenuCategoryResponse;
import com.example.traphe_backend.dto.response.MenuItemDetailResponse;
import com.example.traphe_backend.dto.response.MenuItemResponse;
import com.example.traphe_backend.dto.response.PageResponse;
import com.example.traphe_backend.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Public-facing shop endpoints that map frontend /api/products and /api/categories
 * to the existing MenuService. These endpoints do NOT require authentication.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Public Shop", description = "Public product/category endpoints for the storefront (no authentication required)")
public class PublicShopController {

    private final MenuService menuService;

    /**
     * GET /api/products — Lists menu items as "products" for the storefront.
     * Maps to MenuService.getMenuItems().
     */
    @GetMapping("/products")
    @Operation(summary = "List products (public)", description = "Public paginated product listing for the storefront. Proxies to MenuService.")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getProducts(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isDrink,
            @RequestParam(required = false) UUID branchId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        PageResponse<MenuItemResponse> result = menuService.getMenuItems(
                categoryId, search, "ACTIVE", isDrink, branchId, minPrice, maxPrice, page, size, sortBy, sortDir);

        return ResponseEntity.ok(ApiResponse.successPagination(result, "Products retrieved successfully"));
    }

    /**
     * GET /api/products/{id} — Single product detail.
     */
    @GetMapping("/products/{id}")
    @Operation(summary = "Get product detail (public)", description = "Public product detail view. Proxies to MenuService.")
    public ResponseEntity<ApiResponse<MenuItemDetailResponse>> getProductById(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID branchId) {

        MenuItemDetailResponse result = menuService.getMenuItemById(id, branchId);
        return ResponseEntity.ok(ApiResponse.success(result, "Product retrieved successfully"));
    }

    /**
     * GET /api/categories — Lists menu categories for the storefront.
     * Maps to MenuService.getCategories().
     */
    @GetMapping("/categories")
    @Operation(summary = "List categories (public)", description = "Public category listing for the storefront. Proxies to MenuService.")
    public ResponseEntity<ApiResponse<MenuCategoryResponse[]>> getCategories(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID parentId,
            @RequestParam(defaultValue = "displayOrder") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        MenuCategoryResponse[] result = menuService.getCategories(search, parentId, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(result, "Categories retrieved successfully"));
    }
}
