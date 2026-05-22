package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.response.report.*;
import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.UUID;

public interface ReportService {
    public RevenueReportResponse getRevenueReport(String period, UUID branchId);
    public List<TopProductResponse> getTopProducts(String period, UUID branchId, int limit);
    public List<StockForecastResponse> getStockForecast(UUID branchId);
    public LoyaltyStatsResponse getLoyaltyStats();
    public List<InventoryReportResponse> getInventoryReport(UUID branchId);
    public ByteArrayInputStream exportRevenueReport(String period, UUID branchId);
}