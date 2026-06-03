package com.example.traphe_backend.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark an endpoint as idempotent.
 * Requests with the same Idempotency-Key header will only be processed once.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Idempotent {
    // TTL for the idempotency key in seconds. Default is 24 hours.
    long ttlSeconds() default 86400;
}
