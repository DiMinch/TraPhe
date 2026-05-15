package com.example.traphe_backend.config;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SecuritySanitizationConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jsonCustomizer() {
        return builder -> {
            SimpleModule xssModule = new SimpleModule("XssSanitizerModule");
            xssModule.addDeserializer(String.class, new XssSanitizerDeserializer());
            builder.modulesToInstall(xssModule);
        };
    }
}
