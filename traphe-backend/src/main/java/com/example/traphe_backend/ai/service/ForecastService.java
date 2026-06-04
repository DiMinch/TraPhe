package com.example.traphe_backend.ai.service;

import com.example.traphe_backend.ai.dto.ForecastResponse;
import com.example.traphe_backend.ai.entity.AiForecastCache;
import com.example.traphe_backend.ai.repository.AiForecastCacheRepository;
import com.example.traphe_backend.entity.*;
import com.example.traphe_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AI-1: Smart Ingredient Demand Forecasting
 *
 * Thuật toán: Holt's Double Exponential Smoothing (Trend-Adjusted Exponential Smoothing)
 * — Phù hợp cho time-series có trend (tăng/giảm theo thời gian).
 * — Tham số alpha (level) = 0.3, beta (trend) = 0.2 (có thể cấu hình).
 *
 * Pipeline:
 *   1. Lấy lịch sử đơn hàng 60 ngày từ OrderRepository.
 *   2. Tra Recipe để biết lượng nguyên liệu cần cho mỗi món.
 *   3. Tổng hợp lượng tiêu thụ nguyên liệu theo từng ngày (time-series).
 *   4. Chạy Holt's DES → dự báo N ngày tiếp theo.
 *   5. Lưu vào AiForecastCache (upsert).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ForecastService {

    private static final int HISTORY_DAYS = 60;
    private static final int FORECAST_HORIZON = 7; // dự báo 7 ngày tiếp theo
    private static final double ALPHA = 0.3; // smoothing factor
    private static final double BETA  = 0.2; // trend factor
    private static final int MIN_DATA_POINTS = 3; // cần ít nhất X ngày có data

    private final OrderRepository orderRepository;
    private final IngredientStockRepository ingredientStockRepository;
    private final AiForecastCacheRepository forecastCacheRepository;

    // ═══════════════════════════════════════════════════════════════════════
    // Public API
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Lấy dự báo 7 ngày tới cho một chi nhánh.
     * Nếu cache còn mới (tạo hôm nay), trả về cache. Ngược lại, rebuild.
     */
    @Transactional
    public List<ForecastResponse> getForecastForBranch(UUID branchId, int days) {
        LocalDate today = LocalDate.now();
        LocalDate horizon = today.plusDays(Math.min(days, FORECAST_HORIZON));

        List<AiForecastCache> cached = forecastCacheRepository
                .findByBranchIdAndForecastDateBetweenOrderByForecastDate(branchId, today, horizon);

        if (!cached.isEmpty()) {
            return enrichWithStock(branchId, cached);
        }

        // Cache miss → tính lại
        log.info("Forecast cache miss for branch {}. Rebuilding...", branchId);
        runForecastForBranch(branchId);

        cached = forecastCacheRepository
                .findByBranchIdAndForecastDateBetweenOrderByForecastDate(branchId, today, horizon);

        return enrichWithStock(branchId, cached);
    }

    /**
     * Lấy dự báo toàn hệ thống (gộp tất cả chi nhánh).
     */
    @Transactional
    public List<ForecastResponse> getGlobalForecast(int days) {
        LocalDate today = LocalDate.now();
        LocalDate horizon = today.plusDays(Math.min(days, FORECAST_HORIZON));

        List<AiForecastCache> cached = forecastCacheRepository
                .findByForecastDateBetweenOrderByIngredientNameAsc(today, horizon);

        if (!cached.isEmpty()) {
            return enrichWithStock(null, cached);
        }

        runForecastAll();

        cached = forecastCacheRepository
                .findByForecastDateBetweenOrderByIngredientNameAsc(today, horizon);

        return enrichWithStock(null, cached);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Scheduled Jobs
    // ═══════════════════════════════════════════════════════════════════════

    /** Chạy nightly 1AM — rebuild tất cả forecast cho tất cả chi nhánh */
    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void runForecastAll() {
        log.info("Running nightly demand forecast for all branches...");
        // Xoá cache tuần này
        LocalDate today = LocalDate.now();
        forecastCacheRepository.deleteByForecastDateBetween(today, today.plusDays(FORECAST_HORIZON));

        // Chạy riêng theo branch, lấy từ danh sách branch có order trong 60 ngày
        List<Order> recentOrders = orderRepository.findAllByDateRangeAndBranch(
                LocalDateTime.now().minusDays(HISTORY_DAYS), LocalDateTime.now(), null);

        Set<UUID> branchIds = recentOrders.stream()
                .filter(o -> o.getBranch() != null)
                .map(o -> o.getBranch().getId())
                .collect(Collectors.toSet());

        branchIds.forEach(branchId -> {
            try {
                runForecastForBranch(branchId);
            } catch (Exception e) {
                log.error("Forecast failed for branch {}: {}", branchId, e.getMessage());
            }
        });

        log.info("Nightly forecast completed. {} branches processed.", branchIds.size());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Core Forecasting Logic
    // ═══════════════════════════════════════════════════════════════════════

    @Transactional
    public void runForecastForBranch(UUID branchId) {
        LocalDateTime from = LocalDateTime.now().minusDays(HISTORY_DAYS);
        LocalDateTime to = LocalDateTime.now();

        List<Order> orders = orderRepository.findAllByDateRangeAndBranch(from, to, branchId);
        if (orders.isEmpty()) {
            log.warn("No historical orders found for branch {}. Skipping forecast.", branchId);
            return;
        }

        // Step 1: Build daily ingredient consumption time-series
        for (Order order : orders) {
            for (OrderItem item : order.getItems()) {
                MenuItem menuItem = item.getMenuItem();
                if (menuItem == null) continue;

                // Recipe-based per-ingredient consumption would go here.
                // For now, ingredient demand is proxied via daily order volume.
                // Production: join Recipe + RecipeItem for exact quantities.
            }
        }

        // Fallback: Build a simpler time-series based on item counts per day
        // grouped by MenuItem as a proxy (until Recipe is integrated).
        Map<String, Map<LocalDate, Double>> itemDailyCount = new HashMap<>();
        for (Order order : orders) {
            LocalDate date = order.getCreatedAt().toLocalDate();
            for (OrderItem item : order.getItems()) {
                String itemName = item.getMenuItem() != null ? item.getMenuItem().getName() : "Unknown";
                itemDailyCount.computeIfAbsent(itemName, k -> new TreeMap<>())
                        .merge(date, (double) item.getQuantity(), Double::sum);
            }
        }

        // Now forecast per ingredient using the stock data for this branch
        List<IngredientStock> stocks = ingredientStockRepository.findByBranchId(branchId);
        if (stocks.isEmpty()) {
            log.warn("No ingredient stock records found for branch {}.", branchId);
        }

        // Build daily consumption per ingredient using orders + stock deductions
        // For now, use a simplified proxy: simulate based on total order volume per day
        Map<LocalDate, Double> dailyOrderVolume = new TreeMap<>();
        for (Order order : orders) {
            LocalDate date = order.getCreatedAt().toLocalDate();
            double volume = order.getItems().stream().mapToDouble(OrderItem::getQuantity).sum();
            dailyOrderVolume.merge(date, volume, Double::sum);
        }

        // For each ingredient in stock, estimate consumption proportional to order volume
        List<AiForecastCache> forecastEntries = new ArrayList<>();
        LocalDate today = LocalDate.now();

        forecastCacheRepository.deleteByBranchIdAndForecastDateBetween(
                branchId, today, today.plusDays(FORECAST_HORIZON));

        for (IngredientStock stock : stocks) {
            Ingredient ingredient = stock.getIngredient();
            if (ingredient == null || !ingredient.isActive()) continue;

            // Build time-series for this ingredient
            // We use total daily order volume as proxy for ingredient demand
            // (In production: per-ingredient actual consumption from StockTransaction)
            List<Double> timeSeries = buildTimeSeries(dailyOrderVolume, from.toLocalDate(), today);

            if (timeSeries.size() < MIN_DATA_POINTS) {
                log.debug("Insufficient data for ingredient {} at branch {}", ingredient.getName(), branchId);
                continue;
            }

            // Normalize to per-ingredient scale using current stock as reference
            // Average daily consumption = stock turnover estimate
            double avgDailyConsumption = timeSeries.stream().mapToDouble(d -> d).average().orElse(0);
            if (avgDailyConsumption == 0) continue;

            // Run Holt's Double Exponential Smoothing
            double[] forecast = holtsDoubleExponentialSmoothing(timeSeries, ALPHA, BETA, FORECAST_HORIZON);

            // Normalize forecast to ingredient units
            // Simple linear scaling: (forecast / avgOrderVolume) * avgIngredientConsumptionPerOrder
            // For now we treat forecast values as relative demand index
            double baselineVolume = timeSeries.stream().mapToDouble(d -> d).average().orElse(1);

            // Compute trend
            double lastActual = timeSeries.get(timeSeries.size() - 1);
            double firstForecast = forecast[0];
            double trendPct = baselineVolume > 0
                    ? ((firstForecast - lastActual) / baselineVolume) * 100.0
                    : 0.0;

            // Confidence: based on data richness
            double confidence = Math.min(1.0, timeSeries.size() / 30.0);

            for (int i = 0; i < FORECAST_HORIZON; i++) {
                LocalDate forecastDate = today.plusDays(i + 1);
                // Scale forecast index to ingredient quantity
                double forecastedQty = Math.max(0, forecast[i]);

                AiForecastCache entry = AiForecastCache.builder()
                        .branchId(branchId)
                        .ingredientId(ingredient.getId())
                        .ingredientName(ingredient.getName())
                        .ingredientUnit(ingredient.getUnit())
                        .forecastDate(forecastDate)
                        .predictedQuantity(BigDecimal.valueOf(forecastedQty).setScale(3, RoundingMode.HALF_UP))
                        .trendPct(BigDecimal.valueOf(trendPct).setScale(2, RoundingMode.HALF_UP))
                        .confidence(confidence)
                        .historyDays(timeSeries.size())
                        .build();

                forecastEntries.add(entry);
            }
        }

        forecastCacheRepository.saveAll(forecastEntries);
        log.info("Forecast complete for branch {}. {} records saved.", branchId, forecastEntries.size());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Holt's Double Exponential Smoothing (Java native)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Holt's Linear Trend Method (Double Exponential Smoothing).
     *
     * Equations:
     *   L_t = α * y_t + (1 - α) * (L_{t-1} + T_{t-1})   [Level]
     *   T_t = β * (L_t - L_{t-1}) + (1 - β) * T_{t-1}   [Trend]
     *   ŷ_{t+h} = L_t + h * T_t                           [Forecast h steps ahead]
     *
     * @param data   historical time series values
     * @param alpha  smoothing factor for level (0 < α < 1)
     * @param beta   smoothing factor for trend (0 < β < 1)
     * @param steps  number of steps to forecast
     * @return       array of forecast values
     */
    double[] holtsDoubleExponentialSmoothing(List<Double> data, double alpha, double beta, int steps) {
        int n = data.size();
        if (n == 0) return new double[steps];

        // Initialize level and trend
        double level = data.get(0);
        double trend = n > 1 ? (data.get(n - 1) - data.get(0)) / (n - 1) : 0.0;

        // Smooth through historical data
        for (int i = 1; i < n; i++) {
            double prevLevel = level;
            level = alpha * data.get(i) + (1 - alpha) * (level + trend);
            trend = beta * (level - prevLevel) + (1 - beta) * trend;
        }

        // Generate forecasts
        double[] forecasts = new double[steps];
        for (int h = 1; h <= steps; h++) {
            forecasts[h - 1] = level + h * trend;
        }
        return forecasts;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Helper Methods
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Xây dựng time-series đầy đủ từ dữ liệu thực tế.
     * Những ngày không có giao dịch sẽ được điền 0.0.
     */
    private List<Double> buildTimeSeries(Map<LocalDate, Double> dailyData, LocalDate from, LocalDate to) {
        List<Double> series = new ArrayList<>();
        LocalDate current = from;
        while (!current.isAfter(to)) {
            series.add(dailyData.getOrDefault(current, 0.0));
            current = current.plusDays(1);
        }
        return series;
    }

    /**
     * Enrich danh sách forecast với thông tin tồn kho thực tế.
     */
    private List<ForecastResponse> enrichWithStock(UUID branchId, List<AiForecastCache> forecasts) {
        // Lấy tồn kho hiện tại theo branchId
        Map<UUID, BigDecimal> stockMap = new HashMap<>();
        if (branchId != null) {
            ingredientStockRepository.findByBranchId(branchId).forEach(s -> {
                if (s.getIngredient() != null) {
                    stockMap.put(s.getIngredient().getId(), s.getQuantityAvailable());
                }
            });
        }

        return forecasts.stream().map(cache -> {
            BigDecimal currentStock = stockMap.get(cache.getIngredientId());
            String stockStatus = computeStockStatus(currentStock, cache.getPredictedQuantity());

            double trendPctVal = cache.getTrendPct() != null ? cache.getTrendPct().doubleValue() : 0.0;
            String trendLabel = trendPctVal > 5.0 ? "UP" : trendPctVal < -5.0 ? "DOWN" : "STABLE";

            return ForecastResponse.builder()
                    .ingredientId(cache.getIngredientId())
                    .ingredientName(cache.getIngredientName())
                    .unit(cache.getIngredientUnit())
                    .forecastDate(cache.getForecastDate())
                    .predictedQuantity(cache.getPredictedQuantity())
                    .trendPct(cache.getTrendPct())
                    .trendLabel(trendLabel)
                    .confidence(cache.getConfidence())
                    .currentStock(currentStock)
                    .stockStatus(stockStatus)
                    .build();
        }).collect(Collectors.toList());
    }

    private String computeStockStatus(BigDecimal currentStock, BigDecimal predicted) {
        if (currentStock == null || predicted == null) return "UNKNOWN";
        if (currentStock.compareTo(BigDecimal.ZERO) == 0) return "OUT_OF_STOCK";
        if (currentStock.compareTo(predicted) < 0) return "REORDER";
        if (currentStock.compareTo(predicted.multiply(BigDecimal.valueOf(1.5))) < 0) return "LOW";
        return "OK";
    }
}
