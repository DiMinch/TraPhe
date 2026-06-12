package com.example.traphe_backend.ai.controller;

import com.example.traphe_backend.ai.dto.ForecastResponse;
import com.example.traphe_backend.ai.service.ForecastService;
import com.example.traphe_backend.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai/forecast")
@RequiredArgsConstructor
public class ForecastController {

    private final ForecastService forecastService;

    /**
     * GET /api/ai/forecast?branchId={id}&days=7
     * Lấy dự báo nhu cầu nguyên liệu 7 ngày tới cho một chi nhánh.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER', 'WAREHOUSE_STAFF')")
    public ResponseEntity<ApiResponse<List<ForecastResponse>>> getForecast(
            @RequestParam(required = false) UUID branchId,
            @RequestParam(defaultValue = "7") int days) {

        List<ForecastResponse> result = branchId != null
                ? forecastService.getForecastForBranch(branchId, days)
                : forecastService.getGlobalForecast(days);

        return ResponseEntity.ok(ApiResponse.success(result, "Dự báo nhu cầu nguyên liệu"));
    }

    /**
     * POST /api/ai/forecast/run?branchId={id}
     * Trigger rebuild forecast thủ công (Admin only).
     */
    @PostMapping("/run")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> triggerForecast(
            @RequestParam(required = false) UUID branchId) {

        new Thread(() -> {
            if (branchId != null) {
                forecastService.runForecastForBranch(branchId);
            } else {
                forecastService.runForecastAll();
            }
        }).start();

        return ResponseEntity.ok(ApiResponse.success(
                "Đã kích hoạt forecast job (chạy ngầm). Vui lòng đợi 5-10 giây rồi load lại.",
                "Thành công"));
    }
}
