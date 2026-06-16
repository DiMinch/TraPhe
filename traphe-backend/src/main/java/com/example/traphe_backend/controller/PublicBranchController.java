package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.response.NearestBranchResponse;
import com.example.traphe_backend.service.BranchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
public class PublicBranchController {

    private final BranchService branchService;

    @GetMapping("/nearest")
    public ResponseEntity<NearestBranchResponse> getNearestBranch(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(required = false) List<UUID> menuItemIds) {
        return ResponseEntity.ok(branchService.getNearestBranch(lat, lng, menuItemIds));
    }
}
