package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.CreateMenuItemRequest;
import com.example.traphe_backend.dto.request.UpdateMenuItemRequest;
import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.MenuItemDetailResponse;
import com.example.traphe_backend.service.AdminMenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/menu-items")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Menu", description = "Quản lý Menu tổng (Chỉ dành cho Admin) - Bao gồm tạo mới, cập nhật, xoá món và cấu hình đi kèm.")
public class AdminMenuController {

    private final AdminMenuService adminMenuService;

    /**
     * POST /api/admin/menu-items — Tạo menu item mới (kèm sizes, option groups, toppings).
     */
    @PostMapping
    @Operation(summary = "Tạo menu item mới", description = "Tạo một sản phẩm mới trong hệ thống. Hỗ trợ truyền thẳng danh sách sizes (S, M, L), option groups (đá, đường) và topping.")

    public ResponseEntity<ApiResponse<MenuItemDetailResponse>> createMenuItem(
            @Valid @RequestBody CreateMenuItemRequest request) {

        MenuItemDetailResponse result = adminMenuService.createMenuItem(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(result, "Menu item created successfully"));
    }

    /**
     * PUT /api/admin/menu-items/{id} — Cập nhật menu item.
     */
    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật menu item", description = "Cập nhật thông tin của một món. Cập nhật được các field lẻ. Nếu truyền sizes/optionGroupIds/toppingIds thì toàn bộ danh sách cũ của món đó sẽ bị ghi đè.")

    public ResponseEntity<ApiResponse<MenuItemDetailResponse>> updateMenuItem(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateMenuItemRequest request) {

        MenuItemDetailResponse result = adminMenuService.updateMenuItem(id, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Menu item updated successfully"));
    }

    /**
     * DELETE /api/admin/menu-items/{id} — Soft delete menu item.
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Xoá menu item (Soft Delete)", description = "Chuyển trạng thái isDeleted = true của sản phẩm thay vì xoá cứng khỏi database.")

    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(@PathVariable UUID id) {
        adminMenuService.softDeleteMenuItem(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Menu item deleted successfully"));
    }
}
