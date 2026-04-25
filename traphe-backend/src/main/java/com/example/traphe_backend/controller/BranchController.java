package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.BranchMenuItemRequest;
import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.BranchMenuItemResponse;
import com.example.traphe_backend.dto.response.BranchResponse;
import com.example.traphe_backend.dto.response.PageResponse;
import com.example.traphe_backend.service.BranchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.UUID;

@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
@Tag(name = "Branch", description = "API Danh sách Chi nhánh và Quản lý Menu của từng chi nhánh.")
public class BranchController {

    private final BranchService branchService;

    /**
     * GET /api/branches — Danh sách chi nhánh với filter, sort, phân trang.
     */
    @GetMapping
    @Operation(summary = "Lấy danh sách các cơ sở (Paginated)", description = "Trả về danh sách hệ thống chi nhánh, cho phép search theo tên/địa chỉ và trạng thái isActive.")

    public ResponseEntity<ApiResponse<java.util.List<BranchResponse>>> getBranches(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        PageResponse<BranchResponse> result = branchService.getBranches(
                search, isActive, page, size, sortBy, sortDir);

        return ResponseEntity.ok(ApiResponse.successPagination(result, "Branches retrieved successfully"));
    }

    /**
     * GET /api/branches/{id} — Chi tiết chi nhánh kèm giờ mở cửa.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết một chi nhánh", description = "Lấy các thông tin chi tiết tên, toạ độ địa lý, cùng với khung giờ mở cửa trong tuần của cơ sở đó.")

    public ResponseEntity<ApiResponse<BranchResponse>> getBranchById(@PathVariable UUID id) {
        BranchResponse result = branchService.getBranchById(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Branch retrieved successfully"));
    }

    /**
     * GET /api/branches/{id}/menu — Menu của chi nhánh cụ thể.
     */
    @GetMapping("/{id}/menu")
    @Operation(summary = "Lấy danh sách các thay đổi Menu tại chi nhánh (Paginated)", description = "Dành cho Quản lý / Admin xem trực tiếp danh sách các món ăn đã được setting giá hoặc trạng thái tại một cơ sở.")

    public ResponseEntity<ApiResponse<java.util.List<BranchMenuItemResponse>>> getBranchMenuItems(
            @PathVariable UUID id,
            @RequestParam(required = false) Boolean isAvailable,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageResponse<BranchMenuItemResponse> result = branchService.getBranchMenuItems(
                id, isAvailable, search, page, size);

        return ResponseEntity.ok(ApiResponse.successPagination(result, "Branch menu items retrieved successfully"));
    }

    /**
     * PUT /api/branches/{id}/menu — Cập nhật menu chi nhánh (Admin / Branch Manager).
     */
    @PutMapping("/{id}/menu")
    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
    @Operation(summary = "Sửa/Cập nhật setting Menu riêng tại chi nhánh", description = "Cấp quyền cho Admin hoặc Branch Manager (Chỉ được cấu hình branch của bản thân). Bật/tắt món do hết nguyên liệu, hay setup giá custom. ")

    public ResponseEntity<ApiResponse<BranchMenuItemResponse>> updateBranchMenuItem(
            @PathVariable UUID id,
            @Valid @RequestBody BranchMenuItemRequest request) {

        BranchMenuItemResponse result = branchService.updateBranchMenuItem(id, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Branch menu item updated successfully"));
    }
}
