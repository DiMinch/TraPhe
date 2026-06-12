package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.CreateToppingRequest;
import com.example.traphe_backend.dto.request.UpdateToppingRequest;
import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.PageResponse;
import com.example.traphe_backend.dto.response.ToppingResponse;
import com.example.traphe_backend.service.ToppingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/toppings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Topping", description = "Quản lý Topping (Chỉ dành cho Admin)")
public class AdminToppingController {

    private final ToppingService toppingService;

    @GetMapping
    @Operation(summary = "Lấy danh sách topping", description = "Lấy danh sách topping có phân trang và tìm kiếm")
    public ResponseEntity<ApiResponse<PageResponse<ToppingResponse>>> getAllToppings(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isAvailable,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        PageResponse<ToppingResponse> response = toppingService.getAllToppings(search, isAvailable, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách thành công"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết topping")
    public ResponseEntity<ApiResponse<ToppingResponse>> getToppingById(@PathVariable UUID id) {
        ToppingResponse response = toppingService.getToppingById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy chi tiết thành công"));
    }

    @PostMapping
    @Operation(summary = "Thêm mới topping")
    public ResponseEntity<ApiResponse<ToppingResponse>> createTopping(@Valid @RequestBody CreateToppingRequest request) {
        ToppingResponse response = toppingService.createTopping(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Tạo topping thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật topping")
    public ResponseEntity<ApiResponse<ToppingResponse>> updateTopping(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateToppingRequest request) {
        ToppingResponse response = toppingService.updateTopping(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật topping thành công"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa topping (Soft Delete)")
    public ResponseEntity<ApiResponse<Void>> deleteTopping(@PathVariable UUID id) {
        toppingService.deleteTopping(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa topping thành công"));
    }
}
