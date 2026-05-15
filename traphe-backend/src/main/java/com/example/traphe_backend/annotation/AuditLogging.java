package com.example.traphe_backend.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AuditLogging {
    String action(); // e.g., CREATE, UPDATE, DELETE
    String entityName(); // e.g., Staff, Branch, SystemConfig
}
