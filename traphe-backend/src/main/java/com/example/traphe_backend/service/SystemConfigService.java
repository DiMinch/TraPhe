package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.SystemConfigRequest;
import com.example.traphe_backend.dto.response.SystemConfigResponse;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SystemConfigService {
    List<SystemConfigResponse> getAllConfigs();
    SystemConfigResponse createConfig(SystemConfigRequest request);
    SystemConfigResponse updateConfig(UUID id, SystemConfigRequest request);
    void deleteConfig(UUID id);
    Optional<String> getValueByKey(String key);
}