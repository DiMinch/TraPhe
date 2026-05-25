package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.CreateCategoryRequest;
import com.example.traphe_backend.dto.request.UpdateCategoryRequest;
import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.MenuCategoryResponse;
import com.example.traphe_backend.service.AdminCategoryService;
import com.example.traphe_backend.service.StorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Admin Category", description = "Quản lý danh mục (Admin)")
public class AdminCategoryController {

    private final AdminCategoryService adminCategoryService;
    private final StorageService storageService;
    private final ObjectMapper objectMapper;

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết danh mục")
    public ResponseEntity<ApiResponse<MenuCategoryResponse>> getCategoryById(@PathVariable UUID id) {
        MenuCategoryResponse result = adminCategoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Category retrieved successfully"));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tạo danh mục mới")
    public ResponseEntity<ApiResponse<MenuCategoryResponse>> createCategory(
            @RequestParam("data") String dataJson,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) throws IOException {

        CreateCategoryRequest request = objectMapper.readValue(dataJson, CreateCategoryRequest.class);
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = storageService.uploadFile(imageFile, "categories");
        }

        MenuCategoryResponse result = adminCategoryService.createCategory(request, imageUrl);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(result, "Category created successfully"));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Cập nhật danh mục")
    public ResponseEntity<ApiResponse<MenuCategoryResponse>> updateCategory(
            @PathVariable UUID id,
            @RequestParam("data") String dataJson,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) throws IOException {

        UpdateCategoryRequest request = objectMapper.readValue(dataJson, UpdateCategoryRequest.class);
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = storageService.uploadFile(imageFile, "categories");
        }

        MenuCategoryResponse result = adminCategoryService.updateCategory(id, request, imageUrl);
        return ResponseEntity.ok(ApiResponse.success(result, "Category updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa danh mục")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
        adminCategoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted successfully"));
    }
}
