package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.dto.request.CreateCategoryRequest;
import com.example.traphe_backend.dto.request.UpdateCategoryRequest;
import com.example.traphe_backend.dto.response.MenuCategoryResponse;
import com.example.traphe_backend.entity.MenuCategory;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.mapper.MenuCategoryMapper;
import com.example.traphe_backend.repository.MenuCategoryRepository;
import com.example.traphe_backend.service.AdminCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminCategoryServiceImpl implements AdminCategoryService {

    private final MenuCategoryRepository menuCategoryRepository;
    private final MenuCategoryMapper menuCategoryMapper;

    @Override
    @Transactional(readOnly = true)
    public MenuCategoryResponse getCategoryById(UUID id) {
        MenuCategory category = menuCategoryRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return menuCategoryMapper.toResponse(category);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "menu:categories", allEntries = true),
            @CacheEvict(value = "menu:tree", allEntries = true)
    })
    public MenuCategoryResponse createCategory(CreateCategoryRequest request, String imageUrl) {
        MenuCategory parent = null;
        if (request.getParentId() != null) {
            parent = menuCategoryRepository.findByIdAndIsDeletedFalse(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
        }

        MenuCategory category = MenuCategory.builder()
                .name(request.getName())
                .description(request.getDescription())
                .parent(parent)
                .displayOrder(request.getDisplayOrder())
                .imageUrl(imageUrl)
                .isDrinkCategory(request.isDrinkCategory())
                .build();

        category = menuCategoryRepository.save(category);
        return menuCategoryMapper.toResponse(category);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "menu:categories", allEntries = true),
            @CacheEvict(value = "menu:tree", allEntries = true)
    })
    public MenuCategoryResponse updateCategory(UUID id, UpdateCategoryRequest request, String imageUrl) {
        MenuCategory category = menuCategoryRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (request.getName() != null) {
            category.setName(request.getName());
        }
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        if (request.getParentId() != null) {
            MenuCategory parent = menuCategoryRepository.findByIdAndIsDeletedFalse(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getIsDrinkCategory() != null) {
            category.setDrinkCategory(request.getIsDrinkCategory());
        }
        if (imageUrl != null) {
            category.setImageUrl(imageUrl);
        }

        category = menuCategoryRepository.save(category);
        return menuCategoryMapper.toResponse(category);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "menu:categories", allEntries = true),
            @CacheEvict(value = "menu:tree", allEntries = true)
    })
    public void deleteCategory(UUID id) {
        MenuCategory category = menuCategoryRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        category.setDeleted(true);
        category.setDeletedAt(LocalDateTime.now());
        menuCategoryRepository.save(category);
    }
}
