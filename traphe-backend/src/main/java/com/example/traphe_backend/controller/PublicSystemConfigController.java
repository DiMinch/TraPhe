package com.example.traphe_backend.controller;

import com.example.traphe_backend.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Public system configuration endpoint.
 * Exposes only a curated set of non-sensitive config keys.
 */
@RestController
@RequestMapping("/api/system-config")
@RequiredArgsConstructor
public class PublicSystemConfigController {

    private final SystemConfigService systemConfigService;

    /**
     * Allowed config keys that can be read without authentication.
     */
    private static final List<String> PUBLIC_KEYS = List.of(
            "BRAND_NAME",
            "BRAND_LOGO_URL",
            "SHIPPING_BASE_FEE",
            "SHIPPING_PER_KM"
    );

    @GetMapping("/public/{key}")
    public ResponseEntity<?> getPublicConfig(@PathVariable String key) {
        if (!PUBLIC_KEYS.contains(key)) {
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "Config key is not publicly accessible"));
        }

        return systemConfigService.getValueByKey(key)
                .map(value -> ResponseEntity.ok(Map.of(
                        "success", true,
                        "data", Map.of("configKey", key, "configValue", value)
                )))
                .orElse(ResponseEntity.ok(Map.of(
                        "success", true,
                        "data", Map.of("configKey", key, "configValue", getDefault(key))
                )));
    }

    @GetMapping("/public/batch")
    public ResponseEntity<?> getPublicConfigs(@RequestParam List<String> keys) {
        Map<String, String> result = new java.util.LinkedHashMap<>();
        for (String key : keys) {
            if (PUBLIC_KEYS.contains(key)) {
                String value = systemConfigService.getValueByKey(key).orElse(getDefault(key));
                result.put(key, value);
            }
        }
        return ResponseEntity.ok(Map.of("success", true, "data", result));
    }

    private String getDefault(String key) {
        return switch (key) {
            case "BRAND_NAME" -> "TraPhe";
            case "BRAND_LOGO_URL" -> "/logo.svg";
            case "SHIPPING_BASE_FEE" -> "15000";
            case "SHIPPING_PER_KM" -> "5000";
            default -> "";
        };
    }
}
