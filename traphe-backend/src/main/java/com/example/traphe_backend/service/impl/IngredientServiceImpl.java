package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.dto.request.CreateIngredientRequest;
import com.example.traphe_backend.dto.request.UpdateIngredientRequest;
import com.example.traphe_backend.dto.response.IngredientResponse;
import com.example.traphe_backend.entity.Ingredient;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.mapper.IngredientMapstructMapper;
import com.example.traphe_backend.repository.IngredientRepository;
import com.example.traphe_backend.service.IngredientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class IngredientServiceImpl implements IngredientService {

    private final IngredientRepository ingredientRepository;
    private final IngredientMapstructMapper ingredientMapper;

    @Override
    @Transactional
    public IngredientResponse createIngredient(CreateIngredientRequest request) {
        Ingredient ingredient = Ingredient.builder()
                .name(request.getName().trim())
                .unit(request.getUnit().trim())
                .minStockAlert(request.getMinStockAlert())
                .build();

        Ingredient saved = ingredientRepository.save(ingredient);
        log.info("Ingredient created: {} ({})", saved.getName(), saved.getUnit());
        return ingredientMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IngredientResponse> getAllIngredients() {
        List<Ingredient> ingredients = ingredientRepository.findByIsDeletedFalseOrderByNameAsc();
        return ingredientMapper.toResponseList(ingredients);
    }

    @Override
    @Transactional(readOnly = true)
    public IngredientResponse getIngredientById(UUID id) {
        Ingredient ingredient = ingredientRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nguyên liệu không tồn tại với ID: " + id));
        return ingredientMapper.toResponse(ingredient);
    }

    @Override
    @Transactional
    public IngredientResponse updateIngredient(UUID id, UpdateIngredientRequest request) {
        Ingredient ingredient = ingredientRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nguyên liệu không tồn tại với ID: " + id));

        if (request.getName() != null) {
            ingredient.setName(request.getName().trim());
        }
        if (request.getUnit() != null) {
            ingredient.setUnit(request.getUnit().trim());
        }
        if (request.getMinStockAlert() != null) {
            ingredient.setMinStockAlert(request.getMinStockAlert());
        }
        if (request.getIsActive() != null) {
            ingredient.setActive(request.getIsActive());
        }

        Ingredient saved = ingredientRepository.save(ingredient);
        log.info("Ingredient updated: {}", saved.getName());
        return ingredientMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void softDeleteIngredient(UUID id) {
        Ingredient ingredient = ingredientRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nguyên liệu không tồn tại với ID: " + id));

        ingredient.setDeleted(true);
        ingredient.setDeletedAt(LocalDateTime.now());
        ingredientRepository.save(ingredient);
        log.info("Ingredient soft-deleted: {}", ingredient.getName());
    }
}
