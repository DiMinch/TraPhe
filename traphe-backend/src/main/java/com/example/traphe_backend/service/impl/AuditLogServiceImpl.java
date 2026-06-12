package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.service.AuditLogService;
import com.example.traphe_backend.dto.response.AuditLogResponse;
import com.example.traphe_backend.entity.AuditLog;
import com.example.traphe_backend.repository.AuditLogRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    public Page<AuditLogResponse> getAuditLogs(
            String actorId,
            String module,
            String action,
            LocalDateTime startDate,
            LocalDateTime endDate,
            int page,
            int size
    ) {
        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (actorId != null && !actorId.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("userId"), actorId.trim()));
            }
            if (module != null && !module.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("entityName"), module.trim()));
            }
            if (action != null && !action.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("action"), action.trim()));
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AuditLog> logsPage = auditLogRepository.findAll(spec, pageRequest);

        return logsPage.map(log -> AuditLogResponse.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .action(log.getAction())
                .entityName(log.getEntityName())
                .entityId(log.getEntityId())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .createdAt(log.getCreatedAt())
                .actorId(log.getUserId())
                .actorName(log.getUserId())
                .module(log.getEntityName())
                .resourceId(log.getEntityId())
                .resourceType(log.getEntityName())
                .status("SUCCESS")
                .build());
    }
}
