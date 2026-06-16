package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.CreateIngredientRequest;
import com.example.traphe_backend.dto.request.UpdateIngredientRequest;
import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.IngredientResponse;
import com.example.traphe_backend.service.IngredientService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/ingredients")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
@Tag(name = "Admin Ingredients", description = "CRUD nguyên liệu")
public class AdminIngredientController {

    private final IngredientService ingredientService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo nguyên liệu mới")
    public ResponseEntity<ApiResponse<IngredientResponse>> createIngredient(
            @Valid @RequestBody CreateIngredientRequest request) {
        IngredientResponse result = ingredientService.createIngredient(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(result, "Nguyên liệu đã được tạo"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
    @Operation(summary = "Danh sách nguyên liệu")
    public ResponseEntity<ApiResponse<List<IngredientResponse>>> getAllIngredients() {
        List<IngredientResponse> result = ingredientService.getAllIngredients();
        return ResponseEntity.ok(ApiResponse.success(result, "Danh sách nguyên liệu"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật nguyên liệu")
    public ResponseEntity<ApiResponse<IngredientResponse>> updateIngredient(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateIngredientRequest request) {
        IngredientResponse result = ingredientService.updateIngredient(id, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Nguyên liệu đã cập nhật"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa nguyên liệu (soft delete)")
    public ResponseEntity<ApiResponse<Void>> deleteIngredient(@PathVariable UUID id) {
        ingredientService.softDeleteIngredient(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Nguyên liệu đã xóa"));
    }
}
