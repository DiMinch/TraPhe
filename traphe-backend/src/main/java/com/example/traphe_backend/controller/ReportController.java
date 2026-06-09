package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.report.*;
import com.example.traphe_backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboardSummary(
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getDashboardSummary(period, branchId), "Dashboard summary retrieved"));
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<RevenueReportResponse>> getRevenueReport(
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getRevenueReport(period, branchId), "Revenue report retrieved"));
    }

    @GetMapping("/top-products")
    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<List<TopProductResponse>>> getTopProducts(
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(required = false) UUID branchId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getTopProducts(period, branchId, limit), "Top products retrieved"));
    }

    @GetMapping("/stock-forecast")
    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<List<StockForecastResponse>>> getStockForecast(
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getStockForecast(branchId), "Stock forecast retrieved"));
    }

    @GetMapping("/loyalty-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LoyaltyStatsResponse>> getLoyaltyStats() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getLoyaltyStats(), "Loyalty stats retrieved"));
    }

    @GetMapping("/inventory")
    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<List<InventoryReportResponse>>> getInventoryStatus(
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getInventoryReport(branchId), "Inventory status retrieved"));
    }

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
    public ResponseEntity<Resource> exportReport(
            @RequestParam String type,
            @RequestParam String report,
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(required = false) UUID branchId) {

        if (!"csv".equalsIgnoreCase(type) || !"revenue".equalsIgnoreCase(report)) {
            throw new IllegalArgumentException("Unsupported export type or report. Currently only supports type=csv and report=revenue");
        }

        ByteArrayInputStream stream = reportService.exportRevenueReport(period, branchId);
        InputStreamResource file = new InputStreamResource(stream);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + report + "_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(file);
    }
}
