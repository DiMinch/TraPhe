package com.example.traphe_backend.ai.controller;

import com.example.traphe_backend.ai.enums.CustomerSegmentEnum;
import com.example.traphe_backend.ai.service.RfmSegmentationService;
import com.example.traphe_backend.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/segments")
@RequiredArgsConstructor
public class SegmentController {

    private final RfmSegmentationService rfmSegmentationService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('BRANCH_MANAGER')")
    public ResponseEntity<?> getSegmentDistribution() {
        return ResponseEntity.ok(ApiResponse.success(
                rfmSegmentationService.getSegmentDistribution(), 
                "Tải phân phối phân khúc khách hàng thành công"
        ));
    }

    @GetMapping("/{segment}/customers")
    @PreAuthorize("hasRole('ADMIN') or hasRole('BRANCH_MANAGER')")
    public ResponseEntity<?> getCustomersBySegment(
            @PathVariable CustomerSegmentEnum segment,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                rfmSegmentationService.getCustomersBySegment(segment, pageable),
                "Tải danh sách khách hàng theo phân khúc thành công"
        ));
    }

    @PostMapping("/recalculate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> triggerRecalculation() {
        rfmSegmentationService.recalculateAllSegments();
        return ResponseEntity.ok(ApiResponse.success(
                "RFM Recalculation triggered successfully.",
                "Đã kích hoạt tính toán lại phân khúc khách hàng"
        ));
    }
}
