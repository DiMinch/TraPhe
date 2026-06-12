package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.response.AuditLogResponse;
import org.springframework.data.domain.Page;
import java.time.LocalDateTime;

public interface AuditLogService {
    Page<AuditLogResponse> getAuditLogs(
            String actorId,
            String module,
            String action,
            LocalDateTime startDate,
            LocalDateTime endDate,
            int page,
            int size
    );
}