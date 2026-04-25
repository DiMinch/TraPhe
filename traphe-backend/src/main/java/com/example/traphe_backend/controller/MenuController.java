package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.MenuCategoryResponse;
import com.example.traphe_backend.dto.response.MenuItemDetailResponse;
import com.example.traphe_backend.dto.response.MenuItemResponse;
import com.example.traphe_backend.dto.response.MenuTreeResponse;
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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
@Tag(name = "Menu", description = "API Xem Menu Công khai (Dành cho Khách hàng/Frontend App) - Phân trang, tìm kiếm và có overlay theo chi nhánh (branch).")
public class MenuController {

    private final MenuService menuService;
    private final StorageService storageService;

    /**
     * GET /api/menu — Danh sách menu items với filter, sort, phân trang.
     * Nếu có branchId: thêm branch availability + custom price.
     */
    @GetMapping
    @Operation(summary = "Lấy danh sách sản phẩm (Paginated)", description = "Lấy danh sách món ăn/đồ uống có phân trang. Có thể filter theo danh mục (categoryId), trạng thái,... Nếu truyền branchId thì món sẽ có giá riêng và availability của nhánh đó.")

    public ResponseEntity<ApiResponse<java.util.List<MenuItemResponse>>> getMenuItems(
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

        return ResponseEntity.ok(ApiResponse.successPagination(result, "Menu items retrieved successfully"));
    }

    /**
     * GET /api/menu/tree — Menu dạng cây: categories → items → subcategories (recursive).
     * Nếu có branchId: thêm branch availability + custom price cho mỗi item.
     */
    @GetMapping("/tree")
    @Operation(summary = "Lấy Menu dạng cấp bậc (Tree)", description = "Trả về danh sách tất cả các nhóm món và món ăn lồng nhau (categories -> subcategories -> items) rất tiện cho Frontend build giao diện Menu bar. Hỗ trợ truyền branchId.")

    public ResponseEntity<ApiResponse<List<MenuTreeResponse>>> getMenuTree(
            @RequestParam(required = false) UUID branchId) {

        List<MenuTreeResponse> result = menuService.getMenuTree(branchId);
        return ResponseEntity.ok(ApiResponse.success(result, "Menu tree retrieved successfully"));
    }

    /**
     * GET /api/menu/{id} — Chi tiết menu item kèm sizes, options, toppings.
     * Nếu có branchId: áp dụng custom_price và branch availability.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết một sản phẩm", description = "Lấy dữ liệu đầy đủ của một món bao gồm các cấu hình kích thước (sizes), tuỳ chọn (options: đường, đá) và topping. Nếu có branchId thì sẽ render giá riêng.")

    public ResponseEntity<ApiResponse<MenuItemDetailResponse>> getMenuItemById(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID branchId) {

        MenuItemDetailResponse result = menuService.getMenuItemById(id, branchId);
        return ResponseEntity.ok(ApiResponse.success(result, "Menu item retrieved successfully"));
    }

    /**
     * GET /api/menu/scan — POS barcode scan → returns MenuItemDetailResponse.
     */
    @GetMapping("/scan")
    @Operation(summary = "Quét barcode tại POS",
            description = "Máy quét mã vạch tại quầy gọi API này. Trả về MenuItemDetailResponse tương ứng để add vào đơn hàng ngay.")
    public ResponseEntity<ApiResponse<MenuItemDetailResponse>> scanBarcode(
            @RequestParam String barcode,
            @RequestParam(required = false) UUID branchId) {

        MenuItemDetailResponse result = menuService.findMenuItemByBarcode(barcode, branchId);
        return ResponseEntity.ok(ApiResponse.success(result, "Tìm thấy sản phẩm"));
    }

    /**
     * GET /api/menu/categories — Danh sách danh mục.
     */
    @GetMapping("/categories")
    @Operation(summary = "Lấy danh sách danh mục sản phẩm", description = "Truy vấn danh sách categories. Có thể truyền parentId để lấy các subcategories.")

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
    @Operation(summary = "Lấy danh sách Topping (Paginated)", description = "Lấy tất cả các loại topping khả dụng.")

    public ResponseEntity<ApiResponse<java.util.List<ToppingResponse>>> getToppings(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isAvailable,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageResponse<ToppingResponse> result = menuService.getToppings(search, isAvailable, page, size);
        return ResponseEntity.ok(ApiResponse.successPagination(result, "Toppings retrieved successfully"));
    }

    /**
     * POST /api/menu/upload-image — Upload ảnh lên Supabase Storage (Admin only).
     */
    @PostMapping("/upload-image")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload ảnh lên Storage (Admin)", description = "Cho phép upload ảnh sản phẩm/phân loại lên Storage (Supabase) và trả về URL public.")

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
    @Operation(summary = "Xóa ảnh trên Storage (Admin)", description = "Xóa ảnh không còn dùng đến thông qua filePath URL đã cấp trước đó.")

    public ResponseEntity<ApiResponse<Void>> deleteImage(@RequestParam String filePath) {
        storageService.deleteFile(filePath);
        return ResponseEntity.ok(ApiResponse.success(null, "Image deleted successfully"));
    }
}
