package com.example.traphe_backend.ai.service;

import com.example.traphe_backend.ai.dto.BranchSuggestRequest;
import com.example.traphe_backend.ai.dto.BranchSuggestionResponse;
import com.example.traphe_backend.entity.Branch;
import com.example.traphe_backend.entity.BranchHour;
import com.example.traphe_backend.entity.MenuItem;
import com.example.traphe_backend.enums.OrderStatus;
import com.example.traphe_backend.repository.BranchHourRepository;
import com.example.traphe_backend.repository.BranchRepository;
import com.example.traphe_backend.repository.MenuItemRepository;
import com.example.traphe_backend.repository.OrderRepository;
import com.example.traphe_backend.entity.BranchMenuItem;
import com.example.traphe_backend.repository.BranchMenuItemRepository;
import com.example.traphe_backend.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SmartBranchSelectionService {

    private final BranchRepository branchRepository;
    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final BranchHourRepository branchHourRepository;
    private final SystemConfigService systemConfigService;
    private final BranchMenuItemRepository branchMenuItemRepository;

    private static final double MAX_RADIUS_KM = 10.0;
    private static final int MAX_CAPACITY = 20;
    private static final int MAX_PREP_MINUTES = 45;

    @Transactional(readOnly = true)
    public List<BranchSuggestionResponse> suggestBranches(BranchSuggestRequest request) {
        List<Branch> activeBranches = branchRepository.findByIsActiveTrue();

        double wDistance = getWeight("ai.branch.w_distance", 0.35);
        double wLoad = getWeight("ai.branch.w_load", 0.25);
        double wPrep = getWeight("ai.branch.w_prep_time", 0.20);
        double wHours = getWeight("ai.branch.w_hours", 0.10);
        double wStock = getWeight("ai.branch.w_stock", 0.10);

        List<UUID> menuItemIds = request.getItems() == null ? Collections.emptyList() :
                request.getItems().stream()
                        .map(BranchSuggestRequest.OrderItemRequest::getMenuItemId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());

        // Filter active branches by availability of items first
        List<Branch> eligibleBranches = new ArrayList<>();
        if (!menuItemIds.isEmpty()) {
            for (Branch branch : activeBranches) {
                if (branchHasAllItems(branch.getId(), menuItemIds)) {
                    eligibleBranches.add(branch);
                }
            }
        }

        // Fallback: if no active branch has all items, use all active branches
        List<Branch> branchesToEvaluate = eligibleBranches.isEmpty() ? activeBranches : eligibleBranches;

        List<BranchSuggestionResponse> suggestions = new ArrayList<>();

        for (Branch branch : branchesToEvaluate) {
            double distanceKm = haversine(
                    request.getCustomerLat().doubleValue(),
                    request.getCustomerLng().doubleValue(),
                    branch.getLat().doubleValue(),
                    branch.getLng().doubleValue()
            );

            if (distanceKm > MAX_RADIUS_KM) continue; // Out of range

            int currentOrders = calculateCurrentLoad(branch.getId());
            int prepMinutes = calculatePrepTime(request.getItems());
            String closingTime = getClosingTime(branch.getId());

            double distScore = Math.max(0, 1.0 - (distanceKm / MAX_RADIUS_KM));
            double loadScore = Math.max(0, 1.0 - ((double) currentOrders / MAX_CAPACITY));
            double prepScore = Math.max(0, 1.0 - ((double) prepMinutes / MAX_PREP_MINUTES));
            double hoursScore = calculateHoursScore(closingTime);

            boolean hasAllItems = branchHasAllItems(branch.getId(), menuItemIds);
            double stockScore = hasAllItems ? 1.0 : 0.0;

            if (hoursScore == 0) continue; // Closed

            double totalScore = (distScore * wDistance)
                    + (loadScore * wLoad)
                    + (prepScore * wPrep)
                    + (hoursScore * wHours)
                    + (stockScore * wStock);

            Map<String, Double> scores = new HashMap<>();
            scores.put("distance", distScore);
            scores.put("load", loadScore);
            scores.put("prepTime", prepScore);
            scores.put("hours", hoursScore);
            scores.put("stock", stockScore);

            String reason = generateReason(distanceKm, currentOrders, hoursScore);
            if (!hasAllItems && !menuItemIds.isEmpty()) {
                reason += " (Thiếu một số món trong giỏ hàng)";
            }

            suggestions.add(BranchSuggestionResponse.builder()
                    .branchId(branch.getId())
                    .branchName(branch.getName())
                    .totalScore(totalScore)
                    .distanceKm(Math.round(distanceKm * 10.0) / 10.0)
                    .estimatedPrepMinutes(prepMinutes)
                    .currentOrders(currentOrders)
                    .closingTime(closingTime)
                    .shippingFee(calculateShippingFee(distanceKm))
                    .scores(scores)
                    .reason(reason)
                    .build());
        }

        suggestions.sort(Comparator.comparing(BranchSuggestionResponse::getTotalScore).reversed());

        // Assign ranks
        for (int i = 0; i < Math.min(3, suggestions.size()); i++) {
            suggestions.get(i).setRank(i + 1);
        }

        return suggestions.stream().limit(3).collect(Collectors.toList());
    }

    private boolean branchHasAllItems(UUID branchId, List<UUID> menuItemIds) {
        if (menuItemIds == null || menuItemIds.isEmpty()) {
            return true;
        }
        List<BranchMenuItem> items = branchMenuItemRepository.findAllByBranchIdAndMenuItemIdIn(branchId, menuItemIds);
        if (items.size() < menuItemIds.size()) {
            return false;
        }
        for (BranchMenuItem item : items) {
            if (!item.isAvailable()) {
                return false;
            }
        }
        return true;
    }

    private double getWeight(String key, double defaultValue) {
        return systemConfigService.getValueByKey(key)
                .map(Double::parseDouble)
                .orElse(defaultValue);
    }

    private int calculateCurrentLoad(UUID branchId) {
        // Find orders in PENDING or CONFIRMED state for this branch
        return orderRepository.findAllByBranchAndStatuses(branchId, Arrays.asList(OrderStatus.PENDING, OrderStatus.CONFIRMED)).size();
    }

    private int calculatePrepTime(List<BranchSuggestRequest.OrderItemRequest> items) {
        if (items == null || items.isEmpty()) return 5;
        int total = 0;
        for (BranchSuggestRequest.OrderItemRequest item : items) {
            MenuItem menuItem = menuItemRepository.findById(item.getMenuItemId()).orElse(null);
            if (menuItem != null && menuItem.getPreparationTime() != null) {
                total += menuItem.getPreparationTime() * (item.getQuantity() != null ? item.getQuantity() : 1);
            } else {
                total += 3 * (item.getQuantity() != null ? item.getQuantity() : 1); // default 3 mins
            }
        }
        return total;
    }

    private String getClosingTime(UUID branchId) {
        int dayOfWeek = LocalDate.now().getDayOfWeek().getValue();
        BranchHour hour = branchHourRepository.findByBranchIdAndDayOfWeek(branchId, dayOfWeek).orElse(null);
        if (hour != null && hour.getCloseTime() != null) {
            return hour.getCloseTime().toString();
        }
        return "22:00"; // Default
    }

    private double calculateHoursScore(String closingTimeStr) {
        try {
            LocalTime closingTime = LocalTime.parse(closingTimeStr);
            LocalTime now = LocalTime.now();
            if (now.isAfter(closingTime)) return 0.0;
            
            long minutesRemaining = java.time.Duration.between(now, closingTime).toMinutes();
            if (minutesRemaining > 240) return 1.0; // > 4 hours
            return (double) minutesRemaining / 240.0;
        } catch (Exception e) {
            return 1.0;
        }
    }

    private BigDecimal calculateShippingFee(double distanceKm) {
        double baseFee = 15000;
        if (distanceKm > 3.0) {
            baseFee += (distanceKm - 3.0) * 5000;
        }
        return BigDecimal.valueOf(Math.round(baseFee / 1000) * 1000); // Round to nearest 1000
    }

    private String generateReason(double distanceKm, int currentOrders, double hoursScore) {
        if (hoursScore < 0.25) {
            return "Chi nhánh sắp đóng cửa.";
        }
        if (currentOrders > 15) {
            return String.format("Cách %.1f km, nhưng đang xử lý %d đơn (sẽ chờ lâu).", distanceKm, currentOrders);
        }
        if (distanceKm <= 2.0 && currentOrders <= 5) {
            return String.format("Rất gần bạn (%.1f km) và đang ít đơn (thanh toán nhanh).", distanceKm);
        }
        return String.format("Cách %.1f km, hiện có %d đơn đang xử lý.", distanceKm, currentOrders);
    }

    /**
     * Haversine formula
     */
    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
