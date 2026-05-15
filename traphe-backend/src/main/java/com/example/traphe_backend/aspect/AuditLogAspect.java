package com.example.traphe_backend.aspect;

import com.example.traphe_backend.annotation.AuditLogging;
import com.example.traphe_backend.entity.AuditLog;
import com.example.traphe_backend.repository.AuditLogRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditLogAspect {

    private final AuditLogRepository auditLogRepository;

    @Around("@annotation(auditLogging)")
    public Object logAudit(ProceedingJoinPoint joinPoint, AuditLogging auditLogging) throws Throwable {
        String userId = "SYSTEM";
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
            userId = authentication.getName();
        }

        String action = auditLogging.action();
        String entityName = auditLogging.entityName();
        String entityId = "N/A";
        String oldValue = null;
        String newValue = null;

        // Try to capture arguments as new value
        Object[] args = joinPoint.getArgs();
        if (args != null && args.length > 0) {
            try {
                // To avoid deep serialization issues, just use toString()
                newValue = String.valueOf(args[0]);
            } catch (Exception e) {
                log.warn("Could not serialize arguments for audit log", e);
                newValue = "Unserializable data";
            }
        }

        // Proceed with the actual method execution
        Object result;
        try {
            result = joinPoint.proceed();
        } catch (Throwable throwable) {
            // Log failure if needed
            throw throwable;
        }

        // Try to get entity ID from result if it's a creation
        if (result != null) {
            try {
                // If result is an entity with getId method
                java.lang.reflect.Method getIdMethod = result.getClass().getMethod("getId");
                if (getIdMethod != null) {
                    Object idObj = getIdMethod.invoke(result);
                    if (idObj != null) {
                        entityId = idObj.toString();
                    }
                }
            } catch (Exception e) {
                // ignore if it doesn't have an accessible getId
                log.trace("Result doesn't have getId", e);
            }
        }

        // Save audit log
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .action(action)
                    .entityName(entityName)
                    .entityId(entityId)
                    .oldValue(oldValue) // For simplicity, we just save the new args. Fetching old value requires querying DB before proceed.
                    .newValue(newValue)
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to save audit log", e);
        }

        return result;
    }
}
