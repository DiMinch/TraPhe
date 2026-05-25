package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.CreateCategoryRequest;
import com.example.traphe_backend.dto.request.UpdateCategoryRequest;
import com.example.traphe_backend.dto.response.MenuCategoryResponse;

import java.util.UUID;

public interface AdminCategoryService {
    MenuCategoryResponse getCategoryById(UUID id);
    MenuCategoryResponse createCategory(CreateCategoryRequest request, String imageUrl);
    MenuCategoryResponse updateCategory(UUID id, UpdateCategoryRequest request, String imageUrl);
    void deleteCategory(UUID id);
}
