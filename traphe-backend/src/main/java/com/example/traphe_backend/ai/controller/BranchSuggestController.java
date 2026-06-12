package com.example.traphe_backend.ai.controller;

import com.example.traphe_backend.ai.dto.BranchSuggestRequest;
import com.example.traphe_backend.ai.dto.BranchSuggestionResponse;
import com.example.traphe_backend.ai.service.SmartBranchSelectionService;
import com.example.traphe_backend.dto.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/branch-suggest")
@RequiredArgsConstructor
public class BranchSuggestController {

    private final SmartBranchSelectionService branchSelectionService;

    @PostMapping
    public ResponseEntity<?> suggestBranches(@Valid @RequestBody BranchSuggestRequest request) {
        List<BranchSuggestionResponse> suggestions = branchSelectionService.suggestBranches(request);
        Map<String, Object> response = new HashMap<>();
        response.put("suggestions", suggestions);
        return ResponseEntity.ok(ApiResponse.success(response, "Đề xuất chi nhánh thành công"));
    }
}
