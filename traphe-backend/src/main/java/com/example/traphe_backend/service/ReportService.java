package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.response.report.*;
import com.example.traphe_backend.enums.LoyaltyTransactionType;
import com.example.traphe_backend.repository.BranchMenuItemRepository;
import com.example.traphe_backend.repository.LoyaltyPointTransactionRepository;
import com.example.traphe_backend.repository.OrderItemRepository;
import com.example.traphe_backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final BranchMenuItemRepository branchMenuItemRepository;
    private final LoyaltyPointTransactionRepository loyaltyPointTransactionRepository;

    public RevenueReportResponse getRevenueReport(String period, UUID branchId) {
        LocalDateTime[] dateRange = getDateRange(period);
        LocalDateTime startDate = dateRange[0];
        LocalDateTime endDate = dateRange[1];

        BigDecimal totalRevenue = orderRepository.sumRevenueByDateRangeAndBranch(startDate, endDate, branchId);
        long totalOrders = orderRepository.countOrdersByDateRangeAndBranch(startDate, endDate, branchId);

        return RevenueReportResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .periodStart(startDate)
                .periodEnd(endDate)
                .periodType(period)
                .build();
    }

    public List<TopProductResponse> getTopProducts(String period, UUID branchId, int limit) {
        LocalDateTime[] dateRange = getDateRange(period);
        return orderItemRepository.findTopProducts(dateRange[0], dateRange[1], branchId, PageRequest.of(0, limit));
    }

    public List<StockForecastResponse> getStockForecast(UUID branchId) {
        // Calculate velocity based on last 30 days
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(30);

        List<TopProductResponse> recentSales = orderItemRepository.findTopProducts(startDate, endDate, branchId, PageRequest.of(0, 100));

        return recentSales.stream().map(sale -> {
            double averageDailySales = sale.getTotalQuantitySold() / 30.0;
            int projected7DayDemand = (int) Math.ceil(averageDailySales * 7);
            
            return StockForecastResponse.builder()
                    .menuItemId(sale.getMenuItemId())
                    .productName(sale.getProductName())
                    .averageDailySales(Math.round(averageDailySales * 100.0) / 100.0)
                    .projected7DayDemand(projected7DayDemand)
                    .build();
        }).collect(Collectors.toList());
    }

    public LoyaltyStatsResponse getLoyaltyStats() {
        Long earned = loyaltyPointTransactionRepository.sumPointsByType(LoyaltyTransactionType.EARN);
        Long redeemed = loyaltyPointTransactionRepository.sumPointsByType(LoyaltyTransactionType.REDEEM);
        long activeUsers = loyaltyPointTransactionRepository.countActiveLoyaltyUsers();

        return LoyaltyStatsResponse.builder()
                .totalPointsIssued(earned != null ? earned : 0L)
                .totalPointsRedeemed(redeemed != null ? redeemed : 0L)
                .activeLoyaltyUsers(activeUsers)
                .build();
    }

    public List<InventoryReportResponse> getInventoryReport(UUID branchId) {
        return branchMenuItemRepository.findInventoryStatus(branchId);
    }

    public ByteArrayInputStream exportRevenueReport(String period, UUID branchId) {
        RevenueReportResponse report = getRevenueReport(period, branchId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out, true, StandardCharsets.UTF_8), 
                 CSVFormat.DEFAULT.withHeader("Period Type", "Start Date", "End Date", "Total Orders", "Total Revenue"))) {

            // Write BOM for UTF-8 to ensure Excel reads it correctly
            out.write(0xEF);
            out.write(0xBB);
            out.write(0xBF);

            csvPrinter.printRecord(
                    report.getPeriodType(),
                    report.getPeriodStart().toString(),
                    report.getPeriodEnd().toString(),
                    report.getTotalOrders(),
                    report.getTotalRevenue()
            );

            csvPrinter.flush();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to export report data to CSV", e);
        }
    }

    private LocalDateTime[] getDateRange(String period) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate;
        LocalDateTime endDate = now;

        switch (period.toLowerCase()) {
            case "day":
                startDate = now.toLocalDate().atStartOfDay();
                break;
            case "week":
                startDate = now.minusDays(7).toLocalDate().atStartOfDay();
                break;
            case "month":
                startDate = now.minusMonths(1).toLocalDate().atStartOfDay();
                break;
            case "year":
                startDate = now.minusYears(1).toLocalDate().atStartOfDay();
                break;
            default:
                startDate = now.toLocalDate().atStartOfDay(); // Default to day
        }
        return new LocalDateTime[]{startDate, endDate};
    }
}
