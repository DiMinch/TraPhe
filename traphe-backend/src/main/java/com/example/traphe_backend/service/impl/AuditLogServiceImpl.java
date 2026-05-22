package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.service.AuditLogService;

import com.example.traphe_backend.dto.response.AuditLogResponse;
import com.example.traphe_backend.entity.AuditLog;
import com.example.traphe_backend.repository.AuditLogRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public List<AuditLogResponse> getAuditLogs(String userId, String action, LocalDateTime fromDate,
            LocalDateTime toDate) {
        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (userId != null && !userId.isEmpty()) {
                predicates.add(cb.equal(root.get("userId"), userId));
            }
            if (action != null && !action.isEmpty()) {
                predicates.add(cb.equal(root.get("action"), action));
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), toDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<AuditLog> logs = auditLogRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));

        return logs.stream()
                .map(log -> AuditLogResponse.builder()
                        .id(log.getId())
                        .userId(log.getUserId())
                        .action(log.getAction())
                        .entityName(log.getEntityName())
                        .entityId(log.getEntityId())
                        .oldValue(log.getOldValue())
                        .newValue(log.getNewValue())
                        .createdAt(log.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
