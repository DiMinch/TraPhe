package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.CreateRecipeRequest;
import com.example.traphe_backend.dto.request.UpdateRecipeRequest;
import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.RecipeResponse;
import com.example.traphe_backend.service.RecipeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
@RequestMapping("/api/admin/recipes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Recipes", description = "Quản lý công thức pha chế (Chỉ Admin)")
public class AdminRecipeController {

    private final RecipeService recipeService;

    @PostMapping
    @Operation(summary = "Tạo công thức pha chế", description = "Mỗi món có thể có nhiều công thức theo size (S/M/L). Truyền size = null nếu áp dụng chung.")
    public ResponseEntity<ApiResponse<RecipeResponse>> createRecipe(
            @Valid @RequestBody CreateRecipeRequest request) {
        RecipeResponse result = recipeService.createRecipe(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(result, "Công thức đã được tạo"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật công thức", description = "Nếu truyền items, toàn bộ danh sách nguyên liệu cũ sẽ bị thay thế.")
    public ResponseEntity<ApiResponse<RecipeResponse>> updateRecipe(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRecipeRequest request) {
        RecipeResponse result = recipeService.updateRecipe(id, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Công thức đã cập nhật"));
    }

    @GetMapping("/menu-item/{menuItemId}")
    @Operation(summary = "Xem công thức theo menu item", description = "Trả về tất cả công thức (theo size) của một món.")
    public ResponseEntity<ApiResponse<List<RecipeResponse>>> getRecipesByMenuItem(
            @PathVariable UUID menuItemId) {
        List<RecipeResponse> result = recipeService.getRecipesByMenuItemId(menuItemId);
        return ResponseEntity.ok(ApiResponse.success(result, "Danh sách công thức"));
    }

    @PutMapping("/menu-item/{menuItemId}")
    @Operation(summary = "Cập nhật công thức mặc định của món", description = "Tạo mới hoặc cập nhật công thức mặc định (không size) của món nước.")
    public ResponseEntity<ApiResponse<RecipeResponse>> updateDefaultRecipeForMenuItem(
            @PathVariable UUID menuItemId,
            @Valid @RequestBody List<CreateRecipeRequest.RecipeItemRequest> items) {
        
        List<RecipeResponse> existingRecipes = recipeService.getRecipesByMenuItemId(menuItemId);
        RecipeResponse defaultRecipe = existingRecipes.stream()
                .filter(r -> r.getSize() == null || r.getSize().isEmpty())
                .findFirst()
                .orElse(null);

        if (defaultRecipe != null) {
            // Update existing
            UpdateRecipeRequest updateReq = new UpdateRecipeRequest();
            updateReq.setItems(items.stream()
                    .map(i -> new UpdateRecipeRequest.RecipeItemRequest(i.getIngredientId(), i.getQuantity()))
                    .toList());
            RecipeResponse result = recipeService.updateRecipe(defaultRecipe.getId(), updateReq);
            return ResponseEntity.ok(ApiResponse.success(result, "Công thức đã cập nhật"));
        } else {
            // Create new
            CreateRecipeRequest createReq = new CreateRecipeRequest();
            createReq.setMenuItemId(menuItemId);
            createReq.setSize(null);
            createReq.setItems(items);
            RecipeResponse result = recipeService.createRecipe(createReq);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(result, "Công thức đã được tạo"));
        }
    }
}
