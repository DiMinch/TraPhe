package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.ReportFilterRequest;
import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.report.*;
import com.example.traphe_backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
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
            @RequestParam(required = false) String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String groupBy,
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(
                reportService.getRevenueReport(period, startDate, endDate, groupBy, branchId), 
                "Revenue report retrieved"));
    }

    @GetMapping("/profit")
    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<ProfitReportResponse>> getProfitReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(
                reportService.getProfitReport(startDate, endDate, branchId), 
                "Profit report retrieved"));
    }

    @GetMapping("/top-products")
    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<TopProductsReportResponse>> getTopProducts(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(
                reportService.getTopProductsReport(period, startDate, endDate, sortBy, limit, branchId), 
                "Top products retrieved"));
    }

    @GetMapping("/stock-forecast")
    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<List<StockForecastResponse>>> getStockForecast(
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(
                reportService.getStockForecast(branchId), 
                "Stock forecast retrieved"));
    }

    @GetMapping("/loyalty-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LoyaltyStatsResponse>> getLoyaltyStats() {
        return ResponseEntity.ok(ApiResponse.success(
                reportService.getLoyaltyStats(), 
                "Loyalty stats retrieved"));
    }

    @GetMapping("/inventory")
    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<InventoryReportResponse>> getInventoryStatus(
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(
                reportService.getInventoryReport(branchId), 
                "Inventory status retrieved"));
    }

    @PostMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
    public ResponseEntity<Resource> exportReport(
            @RequestParam String type,
            @RequestParam String format,
            @RequestBody(required = false) ReportFilterRequest filter) {

        ByteArrayInputStream stream;
        String fileName;
        String contentType;

        if ("PDF".equalsIgnoreCase(format)) {
            fileName = type.toLowerCase() + "_report.pdf";
            contentType = "application/pdf";
        } else {
            fileName = type.toLowerCase() + "_report.csv";
            contentType = "text/csv";
        }

        LocalDate start = filter != null ? filter.getStartDate() : null;
        LocalDate end = filter != null ? filter.getEndDate() : null;
        UUID branchId = filter != null ? filter.getBranchId() : null;
        String sortBy = filter != null ? filter.getSortBy() : "QUANTITY";
        int limit = (filter != null && filter.getLimit() != null) ? filter.getLimit() : 10;

        if ("REVENUE".equalsIgnoreCase(type)) {
            stream = reportService.exportRevenueReport(start, end, branchId, format);
        } else if ("PROFIT".equalsIgnoreCase(type)) {
            stream = reportService.exportProfitReport(start, end, branchId, format);
        } else if ("TOP_PRODUCTS".equalsIgnoreCase(type)) {
            stream = reportService.exportTopProductsReport(sortBy, limit, start, end, branchId, format);
        } else {
            throw new IllegalArgumentException("Unsupported report type: " + type);
        }

        InputStreamResource file = new InputStreamResource(stream);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
                .contentType(MediaType.parseMediaType(contentType))
                .body(file);
    }

    @PostMapping("/export/inventory")
    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
    public ResponseEntity<Resource> exportInventory(
            @RequestParam String format,
            @RequestBody(required = false) Map<String, Object> body) {

        Boolean lowStockOnly = body != null ? (Boolean) body.get("lowStockOnly") : null;
        Boolean fastMovingOnly = body != null ? (Boolean) body.get("fastMovingOnly") : null;
        UUID branchId = null;
        if (body != null && body.get("branchId") != null) {
            branchId = UUID.fromString(body.get("branchId").toString());
        }

        ByteArrayInputStream stream = reportService.exportInventoryReport(branchId, lowStockOnly, fastMovingOnly, format);
        InputStreamResource file = new InputStreamResource(stream);

        String fileName = "PDF".equalsIgnoreCase(format) ? "inventory_report.pdf" : "inventory_report.csv";
        String contentType = "PDF".equalsIgnoreCase(format) ? "application/pdf" : "text/csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
                .contentType(MediaType.parseMediaType(contentType))
                .body(file);
    }
}
