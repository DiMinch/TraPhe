package com.example.traphe_backend.aspect;

import com.example.traphe_backend.annotation.Idempotent;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.concurrent.TimeUnit;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class IdempotencyAspect {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String IDEMPOTENCY_HEADER = "Idempotency-Key";
    private static final String IDEMPOTENCY_PREFIX = "idemp:";
    private static final String STATUS_IN_PROGRESS = "IN_PROGRESS";

    @Around("@annotation(idempotent)")
    public Object processIdempotentRequest(ProceedingJoinPoint joinPoint, Idempotent idempotent) throws Throwable {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        String idempotencyKey = request.getHeader(IDEMPOTENCY_HEADER);

        if (idempotencyKey == null || idempotencyKey.trim().isEmpty()) {
            // Nếu không truyền header, bỏ qua idempotency và tiếp tục bình thường
            return joinPoint.proceed();
        }

        String redisKey = IDEMPOTENCY_PREFIX + idempotencyKey;

        // Try to set key as IN_PROGRESS if it doesn't exist (setIfAbsent is atomic)
        Boolean isFirstRequest = redisTemplate.opsForValue().setIfAbsent(redisKey, STATUS_IN_PROGRESS, idempotent.ttlSeconds(), TimeUnit.SECONDS);

        if (Boolean.FALSE.equals(isFirstRequest)) {
            Object cachedResponse = redisTemplate.opsForValue().get(redisKey);
            
            if (STATUS_IN_PROGRESS.equals(cachedResponse)) {
                log.warn("Concurrent request detected for idempotency key: {}", idempotencyKey);
                // Return 409 Conflict using Spring's standard exception mapping
                throw new IllegalStateException("IDEMPOTENT_IN_PROGRESS: Request is already being processed.");
            }
            
            // If completed, return cached response
            log.info("Returning cached response for idempotency key: {}", idempotencyKey);
            return cachedResponse;
        }

        try {
            // First time processing
            Object response = joinPoint.proceed();
            
            // Save the successful response to Redis
            if (response instanceof ResponseEntity) {
                // We only cache successful or handled responses.
                redisTemplate.opsForValue().set(redisKey, response, idempotent.ttlSeconds(), TimeUnit.SECONDS);
            } else {
                redisTemplate.opsForValue().set(redisKey, response, idempotent.ttlSeconds(), TimeUnit.SECONDS);
            }
            
            return response;
            
        } catch (Throwable ex) {
            // If processing failed, remove the key so client can retry
            redisTemplate.delete(redisKey);
            throw ex;
        }
    }
}
