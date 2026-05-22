package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.SystemConfigRequest;
import com.example.traphe_backend.dto.response.SystemConfigResponse;
import java.util.List;
import java.util.UUID;

public interface SystemConfigService {
    public List<SystemConfigResponse> getAllConfigs();
    public SystemConfigResponse createConfig(SystemConfigRequest request);
    public SystemConfigResponse updateConfig(UUID id, SystemConfigRequest request);
    public void deleteConfig(UUID id);
}