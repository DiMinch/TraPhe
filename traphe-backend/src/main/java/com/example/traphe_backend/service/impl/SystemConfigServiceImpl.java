package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.service.SystemConfigService;

import com.example.traphe_backend.annotation.AuditLogging;
import com.example.traphe_backend.dto.request.SystemConfigRequest;
import com.example.traphe_backend.dto.response.SystemConfigResponse;
import com.example.traphe_backend.entity.SystemConfig;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.repository.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemConfigServiceImpl implements SystemConfigService {

    private final SystemConfigRepository systemConfigRepository;

    public List<SystemConfigResponse> getAllConfigs() {
        return systemConfigRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @AuditLogging(action = "CREATE", entityName = "SystemConfig")
    public SystemConfigResponse createConfig(SystemConfigRequest request) {
        if (systemConfigRepository.findByConfigKey(request.getConfigKey()).isPresent()) {
            throw new IllegalArgumentException("Config key already exists");
        }

        SystemConfig config = SystemConfig.builder()
                .configKey(request.getConfigKey())
                .configValue(request.getConfigValue())
                .description(request.getDescription())
                .build();

        SystemConfig savedConfig = systemConfigRepository.save(config);
        return mapToResponse(savedConfig);
    }

    @AuditLogging(action = "UPDATE", entityName = "SystemConfig")
    public SystemConfigResponse updateConfig(UUID id, SystemConfigRequest request) {
        SystemConfig config = systemConfigRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Config not found"));

        if (!config.getConfigKey().equals(request.getConfigKey()) &&
                systemConfigRepository.findByConfigKey(request.getConfigKey()).isPresent()) {
            throw new IllegalArgumentException("Config key already exists");
        }

        config.setConfigKey(request.getConfigKey());
        config.setConfigValue(request.getConfigValue());
        config.setDescription(request.getDescription());

        SystemConfig updatedConfig = systemConfigRepository.save(config);
        return mapToResponse(updatedConfig);
    }

    @AuditLogging(action = "DELETE", entityName = "SystemConfig")
    public void deleteConfig(UUID id) {
        SystemConfig config = systemConfigRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Config not found"));
        systemConfigRepository.delete(config);
    }

    private SystemConfigResponse mapToResponse(SystemConfig config) {
        return SystemConfigResponse.builder()
                .id(config.getId())
                .configKey(config.getConfigKey())
                .configValue(config.getConfigValue())
                .description(config.getDescription())
                .createdAt(config.getCreatedAt())
                .updatedAt(config.getUpdatedAt())
                .build();
    }

    @Override
    public java.util.Optional<String> getValueByKey(String key) {
        return systemConfigRepository.findByConfigKey(key)
                .map(SystemConfig::getConfigValue);
    }
}
