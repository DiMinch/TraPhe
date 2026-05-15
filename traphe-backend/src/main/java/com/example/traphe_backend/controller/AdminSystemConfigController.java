package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.SystemConfigRequest;
import com.example.traphe_backend.dto.response.SystemConfigResponse;
import com.example.traphe_backend.service.SystemConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/system-config")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSystemConfigController {

    private final SystemConfigService systemConfigService;

    @GetMapping
    public ResponseEntity<List<SystemConfigResponse>> getAllConfigs() {
        return ResponseEntity.ok(systemConfigService.getAllConfigs());
    }

    @PostMapping
    public ResponseEntity<SystemConfigResponse> createConfig(@Valid @RequestBody SystemConfigRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(systemConfigService.createConfig(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SystemConfigResponse> updateConfig(@PathVariable UUID id, @Valid @RequestBody SystemConfigRequest request) {
        return ResponseEntity.ok(systemConfigService.updateConfig(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConfig(@PathVariable UUID id) {
        systemConfigService.deleteConfig(id);
        return ResponseEntity.noContent().build();
    }
}
