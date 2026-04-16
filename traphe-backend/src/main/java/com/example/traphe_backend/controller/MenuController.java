package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.MenuCategoryResponse;
import com.example.traphe_backend.dto.response.MenuItemDetailResponse;
import com.example.traphe_backend.dto.response.MenuItemResponse;
import com.example.traphe_backend.dto.response.PageResponse;
import com.example.traphe_backend.dto.response.ToppingResponse;
import com.example.traphe_backend.service.MenuService;
import com.example.traphe_backend.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;
    private final StorageService storageService;

    /**
     * GET /api/menu — Danh sách menu items với filter, sort, phân trang.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MenuItemResponse>>> getMenuItems(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean isDrink,
            @RequestParam(required = false) UUID branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        PageResponse<MenuItemResponse> result = menuService.getMenuItems(
                categoryId, search, status, isDrink, branchId, page, size, sortBy, sortDir);

        return ResponseEntity.ok(ApiResponse.success(result, "Menu items retrieved successfully"));
    }

    /**
     * GET /api/menu/{id} — Chi tiết menu item kèm sizes, options, toppings.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MenuItemDetailResponse>> getMenuItemById(@PathVariable UUID id) {
        MenuItemDetailResponse result = menuService.getMenuItemById(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Menu item retrieved successfully"));
    }

    /**
     * GET /api/menu/categories — Danh sách danh mục.
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<MenuCategoryResponse>>> getCategories(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID parentId,
            @RequestParam(defaultValue = "displayOrder") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        List<MenuCategoryResponse> result = menuService.getCategories(search, parentId, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(result, "Categories retrieved successfully"));
    }

    /**
     * GET /api/menu/toppings — Danh sách topping.
     */
    @GetMapping("/toppings")
    public ResponseEntity<ApiResponse<PageResponse<ToppingResponse>>> getToppings(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isAvailable,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageResponse<ToppingResponse> result = menuService.getToppings(search, isAvailable, page, size);
        return ResponseEntity.ok(ApiResponse.success(result, "Toppings retrieved successfully"));
    }

    /**
     * POST /api/menu/upload-image — Upload ảnh lên Supabase Storage (Admin only).
     */
    @PostMapping("/upload-image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "menu-items") String folder) {

        String imageUrl = storageService.uploadFile(file, folder);
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("imageUrl", imageUrl), "Image uploaded successfully"));
    }

    /**
     * DELETE /api/menu/images — Xoá ảnh trên Supabase Storage (Admin only).
     */
    @DeleteMapping("/images")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@RequestParam String filePath) {
        storageService.deleteFile(filePath);
        return ResponseEntity.ok(ApiResponse.success(null, "Image deleted successfully"));
    }
}
