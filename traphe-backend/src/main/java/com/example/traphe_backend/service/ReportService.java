package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.response.report.*;
import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.UUID;
import java.time.LocalDate;

public interface ReportService {
    public RevenueReportResponse getRevenueReport(String period, LocalDate startDate, LocalDate endDate, String groupBy, UUID branchId);
    public TopProductsReportResponse getTopProductsReport(String period, LocalDate startDate, LocalDate endDate, String sortBy, int limit, UUID branchId);
    public ProfitReportResponse getProfitReport(LocalDate startDate, LocalDate endDate, UUID branchId);
    public List<StockForecastResponse> getStockForecast(UUID branchId);
    public LoyaltyStatsResponse getLoyaltyStats();
    public InventoryReportResponse getInventoryReport(UUID branchId);
    public ByteArrayInputStream exportRevenueReport(LocalDate startDate, LocalDate endDate, UUID branchId, String format);
    public ByteArrayInputStream exportProfitReport(LocalDate startDate, LocalDate endDate, UUID branchId, String format);
    public ByteArrayInputStream exportTopProductsReport(String sortBy, int limit, LocalDate startDate, LocalDate endDate, UUID branchId, String format);
    public ByteArrayInputStream exportInventoryReport(UUID branchId, Boolean lowStockOnly, Boolean fastMovingOnly, String format);
    public DashboardResponse getDashboardSummary(String period, UUID branchId);
}