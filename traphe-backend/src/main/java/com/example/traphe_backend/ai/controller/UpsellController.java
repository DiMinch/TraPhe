package com.example.traphe_backend.ai.controller;

import com.example.traphe_backend.ai.dto.UpsellSuggestion;
import com.example.traphe_backend.ai.entity.AiAssociationRule;
import com.example.traphe_backend.ai.repository.AiAssociationRuleRepository;
import com.example.traphe_backend.ai.scheduler.UpsellTrainingJob;
import com.example.traphe_backend.ai.service.UpsellService;
import com.example.traphe_backend.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai/upsell")
@RequiredArgsConstructor
public class UpsellController {

    private final UpsellService upsellService;
    private final AiAssociationRuleRepository ruleRepository;
    private final UpsellTrainingJob upsellTrainingJob;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UpsellSuggestion>>> getSuggestions(@RequestParam List<String> itemIds) {
        return ResponseEntity.ok(ApiResponse.success(upsellService.getSuggestions(itemIds), "Gợi ý bán kèm"));
    }

    @GetMapping("/rules")
    public ResponseEntity<ApiResponse<List<AiAssociationRule>>> getAllRules() {
        return ResponseEntity.ok(ApiResponse.success(ruleRepository.findAllByOrderByLiftDesc(), "Danh sách quy tắc kết hợp"));
    }

    @PostMapping("/train")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> triggerTraining() {
        // Run asynchronously or block for demo purposes
        new Thread(() -> {
            upsellTrainingJob.trainUpsellModel();
            upsellService.clearCache();
        }).start();
        
        return ResponseEntity.ok(ApiResponse.success("Đã kích hoạt quá trình train model FP-Growth (chạy ngầm).", "Thành công"));
    }
}
