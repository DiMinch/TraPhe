package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.response.AuditLogResponse;
import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogService {
    public List<AuditLogResponse> getAuditLogs(String userId, String action, LocalDateTime fromDate, LocalDateTime toDate);
}