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
import org.springframework.transaction.annotation.Transactional;

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
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final BranchMenuItemRepository branchMenuItemRepository;
    private final LoyaltyPointTransactionRepository loyaltyPointTransactionRepository;
    private final Executor reportExecutor;

    public RevenueReportResponse getRevenueReport(String period, UUID branchId) {
        LocalDateTime[] dateRange = getDateRange(period);
        LocalDateTime startDate = dateRange[0];
        LocalDateTime endDate = dateRange[1];

        CompletableFuture<BigDecimal> revenueFuture = CompletableFuture.supplyAsync(
                () -> orderRepository.sumRevenueByDateRangeAndBranch(startDate, endDate, branchId),
                reportExecutor
        );

        CompletableFuture<Long> ordersFuture = CompletableFuture.supplyAsync(
                () -> orderRepository.countOrdersByDateRangeAndBranch(startDate, endDate, branchId),
                reportExecutor
        );

        return CompletableFuture.allOf(revenueFuture, ordersFuture)
                .thenApply(v -> {
                    BigDecimal totalRevenue = revenueFuture.join();
                    Long totalOrders = ordersFuture.join();
                    return RevenueReportResponse.builder()
                            .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                            .totalOrders(totalOrders != null ? totalOrders : 0L)
                            .periodStart(startDate)
                            .periodEnd(endDate)
                            .periodType(period)
                            .build();
                }).join();
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
        CompletableFuture<Long> earnedFuture = CompletableFuture.supplyAsync(
                () -> loyaltyPointTransactionRepository.sumPointsByType(LoyaltyTransactionType.EARN),
                reportExecutor
        );

        CompletableFuture<Long> redeemedFuture = CompletableFuture.supplyAsync(
                () -> loyaltyPointTransactionRepository.sumPointsByType(LoyaltyTransactionType.REDEEM),
                reportExecutor
        );

        CompletableFuture<Long> activeUsersFuture = CompletableFuture.supplyAsync(
                () -> loyaltyPointTransactionRepository.countActiveLoyaltyUsers(),
                reportExecutor
        );

        return CompletableFuture.allOf(earnedFuture, redeemedFuture, activeUsersFuture)
                .thenApply(v -> {
                    Long earned = earnedFuture.join();
                    Long redeemed = redeemedFuture.join();
                    Long activeUsers = activeUsersFuture.join();

                    return LoyaltyStatsResponse.builder()
                            .totalPointsIssued(earned != null ? earned : 0L)
                            .totalPointsRedeemed(redeemed != null ? redeemed : 0L)
                            .activeLoyaltyUsers(activeUsers != null ? activeUsers : 0L)
                            .build();
                }).join();
    }

    public DashboardResponse getDashboardSummary(String period, UUID branchId) {
        CompletableFuture<RevenueReportResponse> revenueFuture = CompletableFuture.supplyAsync(
                () -> getRevenueReport(period, branchId),
                reportExecutor
        );

        CompletableFuture<List<TopProductResponse>> topProductsFuture = CompletableFuture.supplyAsync(
                () -> getTopProducts(period, branchId, 5),
                reportExecutor
        );

        CompletableFuture<LoyaltyStatsResponse> loyaltyFuture = CompletableFuture.supplyAsync(
                this::getLoyaltyStats,
                reportExecutor
        );

        return CompletableFuture.allOf(revenueFuture, topProductsFuture, loyaltyFuture)
                .thenApply(v -> DashboardResponse.builder()
                        .revenueSummary(revenueFuture.join())
                        .topProducts(topProductsFuture.join())
                        .loyaltyStats(loyaltyFuture.join())
                        .build()
                ).join();
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
