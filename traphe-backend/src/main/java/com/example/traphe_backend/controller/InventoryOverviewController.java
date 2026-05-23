package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.InventoryOverviewResponse;
import com.example.traphe_backend.service.InventoryOverviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory Overview", description = "Tổng quan tồn kho (Admin / Employee)")
public class InventoryOverviewController {

    private final InventoryOverviewService inventoryOverviewService;

    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    @Operation(summary = "Xem tổng quan tồn kho",
            description = "Trả về thống kê tổng hợp tồn kho: tổng giá trị, cảnh báo hàng sắp hết, biểu đồ theo chi nhánh.")
    public ResponseEntity<ApiResponse<InventoryOverviewResponse>> getOverview(
            @RequestParam(defaultValue = "MONTH") String stockValueTimeRange,
            @RequestParam(defaultValue = "MONTH") String onHandQuantityTimeRange) {

        InventoryOverviewResponse data = inventoryOverviewService.getOverview(stockValueTimeRange, onHandQuantityTimeRange);
        return ResponseEntity.ok(ApiResponse.success(data, "Tổng quan tồn kho"));
    }
}
