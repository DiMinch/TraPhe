package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.AdjustStockRequest;
import com.example.traphe_backend.dto.request.ImportStockRequest;
import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.ImportStockResponse;
import com.example.traphe_backend.dto.response.IngredientResponse;
import com.example.traphe_backend.dto.response.IngredientStockResponse;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.repository.UserRepository;
import com.example.traphe_backend.service.IngredientService;
import com.example.traphe_backend.service.StockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/branch")
@RequiredArgsConstructor
@Tag(name = "Branch Stock", description = "Quản lý tồn kho chi nhánh (Admin / Branch Manager)")
public class BranchStockController {

    private final StockService stockService;
    private final IngredientService ingredientService;
    private final UserRepository userRepository;

    /**
     * GET /api/branch/stock
     * ADMIN: truyền branchId qua query param
     * BRANCH_MANAGER: tự resolve từ user.branchId
     */
    @GetMapping("/stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
    @Operation(summary = "Xem tồn kho chi nhánh",
            description = "Admin truyền branchId. Branch Manager tự động dùng chi nhánh của mình. " +
                    "Hỗ trợ filter: search (tên nguyên liệu), lowStockOnly (chỉ hiện hàng sắp hết).")
    public ResponseEntity<ApiResponse<List<IngredientStockResponse>>> getStock(
            @RequestParam(required = false) UUID branchId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean lowStockOnly,
            Authentication authentication) {

        UUID resolvedBranchId = resolveBranchId(branchId, authentication);
        List<IngredientStockResponse> result = stockService.getStockByBranch(resolvedBranchId, search, lowStockOnly);
        return ResponseEntity.ok(ApiResponse.success(result, "Danh sách tồn kho"));
    }

    @PostMapping("/stock/import")
    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
    @Operation(summary = "Nhập kho", description = "Nhập nguyên liệu từ nhà cung cấp. Tự động tạo/cập nhật tồn kho và ghi lịch sử giao dịch.")
    public ResponseEntity<ApiResponse<ImportStockResponse>> importStock(
            @RequestParam(required = false) UUID branchId,
            @Valid @RequestBody ImportStockRequest request,
            Authentication authentication) {

        UUID resolvedBranchId = resolveBranchId(branchId, authentication);
        String userEmail = authentication.getName();
        ImportStockResponse result = stockService.importStock(resolvedBranchId, request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(result, "Nhập kho thành công"));
    }

    @PostMapping("/stock/adjust")
    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
    @Operation(summary = "Điều chỉnh kho", description = "Điều chỉnh thủ công tồn kho (hỏng, thất thoát, kiểm kê). Bắt buộc ghi lý do.")
    public ResponseEntity<ApiResponse<IngredientStockResponse>> adjustStock(
            @RequestParam(required = false) UUID branchId,
            @Valid @RequestBody AdjustStockRequest request,
            Authentication authentication) {

        UUID resolvedBranchId = resolveBranchId(branchId, authentication);
        String userEmail = authentication.getName();
        IngredientStockResponse result = stockService.adjustStock(resolvedBranchId, request, userEmail);
        return ResponseEntity.ok(ApiResponse.success(result, "Điều chỉnh kho thành công"));
    }

    /**
     * GET /api/branch/ingredients/scan — Quét barcode/SKU để tìm nguyên liệu (Branch Manager).
     */
    @GetMapping("/ingredients/scan")
    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
    @Operation(summary = "Quét barcode/SKU nguyên liệu",
            description = "Dùng cho Scanner/App nhập kho. Truyền barcode hoặc sku để tra cứu nguyên liệu tương ứng.")
    public ResponseEntity<ApiResponse<IngredientResponse>> scanIngredient(
            @RequestParam(required = false) String barcode,
            @RequestParam(required = false) String sku) {

        if ((barcode == null || barcode.isBlank()) && (sku == null || sku.isBlank())) {
            throw new IllegalArgumentException("Vui lòng truyền barcode hoặc sku để tra cứu.");
        }

        IngredientResponse result;
        if (barcode != null && !barcode.isBlank()) {
            result = ingredientService.findByBarcode(barcode);
        } else {
            result = ingredientService.findBySku(sku);
        }

        return ResponseEntity.ok(ApiResponse.success(result, "Tìm thấy nguyên liệu"));
    }

    // ==================== Helper ====================

    /**
     * Resolves branchId:
     * - ADMIN must pass branchId as query param
     * - BRANCH_MANAGER uses their own user.branchId
     */
    private UUID resolveBranchId(UUID branchId, Authentication authentication) {
        if (branchId != null) {
            return branchId;
        }

        // Resolve from user's assigned branch
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getBranchId() == null) {
            throw new IllegalArgumentException(
                    "Bạn chưa được gán chi nhánh. ADMIN vui lòng truyền branchId trong query param.");
        }

        return user.getBranchId();
    }
}
