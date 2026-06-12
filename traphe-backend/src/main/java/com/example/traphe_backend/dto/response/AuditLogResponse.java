package com.example.traphe_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private UUID id;
    private String userId;
    private String action;
    private String entityName;
    private String entityId;
    private String oldValue;
    private String newValue;
    private LocalDateTime createdAt;

    // Frontend compatibility fields
    private String actorId;
    private String actorName;
    private String module;
    private String resourceId;
    private String resourceType;
    @Builder.Default
    private String status = "SUCCESS";
}
