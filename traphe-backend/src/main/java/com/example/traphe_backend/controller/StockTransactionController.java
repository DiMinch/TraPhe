package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.StockTransactionResponse;
import com.example.traphe_backend.entity.StockTransaction;
import com.example.traphe_backend.enums.StockTransactionType;
import com.example.traphe_backend.repository.StockTransactionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/stock-transactions")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
@Tag(name = "Stock Transactions", description = "Lịch sử giao dịch kho nguyên liệu (nhập, trừ, điều chỉnh)")
public class StockTransactionController {

    private final StockTransactionRepository stockTransactionRepository;

    @GetMapping
    @Operation(summary = "Danh sách giao dịch kho",
            description = "Lấy lịch sử giao dịch kho theo chi nhánh, hỗ trợ lọc theo nguyên liệu, loại giao dịch, và khoảng thời gian. Phân trang.")
    public ResponseEntity<ApiResponse<Page<StockTransactionResponse>>> getTransactions(
            @RequestParam UUID branchId,
            @RequestParam(required = false) UUID ingredientId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        StockTransactionType txType = null;
        if (type != null && !type.isBlank()) {
            try {
                txType = StockTransactionType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Loại giao dịch không hợp lệ: " + type);
            }
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<StockTransaction> transactions = stockTransactionRepository.findByFilters(
                branchId, ingredientId, txType, startDate, endDate, pageable);

        Page<StockTransactionResponse> responsePage = transactions.map(this::mapToResponse);

        return ResponseEntity.ok(ApiResponse.success(responsePage, "Lịch sử giao dịch kho"));
    }

    @GetMapping("/ingredient")
    @Operation(summary = "Lịch sử biến động 1 nguyên liệu",
            description = "Xem toàn bộ lịch sử nhập/xuất/điều chỉnh của một nguyên liệu tại chi nhánh cụ thể.")
    public ResponseEntity<ApiResponse<Page<StockTransactionResponse>>> getByIngredient(
            @RequestParam UUID branchId,
            @RequestParam UUID ingredientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<StockTransaction> transactions = stockTransactionRepository
                .findByBranchIdAndIngredientIdOrderByCreatedAtDesc(branchId, ingredientId, pageable);

        Page<StockTransactionResponse> responsePage = transactions.map(this::mapToResponse);
        return ResponseEntity.ok(ApiResponse.success(responsePage, "Lịch sử biến động nguyên liệu"));
    }

    // ---- Helper ----

    private StockTransactionResponse mapToResponse(StockTransaction tx) {
        return StockTransactionResponse.builder()
                .id(tx.getId())
                .ingredientName(tx.getIngredient() != null ? tx.getIngredient().getName() : null)
                .type(tx.getType() != null ? tx.getType().name() : null)
                .quantityChange(tx.getQuantityChange())
                .quantityBefore(tx.getQuantityBefore())
                .quantityAfter(tx.getQuantityAfter())
                .referenceType(tx.getReferenceType() != null ? tx.getReferenceType().name() : null)
                .referenceId(tx.getReferenceId())
                .reason(tx.getReason())
                .createdAt(tx.getCreatedAt())
                .build();
    }
}
