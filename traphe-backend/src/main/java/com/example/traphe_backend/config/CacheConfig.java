package com.example.traphe_backend.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Configuration(proxyBeanMethods = false)
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        try {
            // Test Redis connection first
            connectionFactory.getConnection().ping();

            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            
            // Configure default typing with WRAPPER_ARRAY to handle both concrete classes and arrays/lists
            mapper.activateDefaultTyping(
                    mapper.getPolymorphicTypeValidator(),
                    ObjectMapper.DefaultTyping.NON_FINAL,
                    JsonTypeInfo.As.WRAPPER_ARRAY
            );
            
            GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(mapper);

            RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(10))
                    .prefixCacheNameWith("traphe:v9:") // Force cache invalidation — bypass all old corrupt data
                    .serializeKeysWith(
                            RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                    .serializeValuesWith(
                            RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer))
                    .disableCachingNullValues();

            // Per-cache TTL overrides
            Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
            cacheConfigs.put("menu:items", defaultConfig.entryTtl(Duration.ofMinutes(5)));
            cacheConfigs.put("menu:item-detail", defaultConfig.entryTtl(Duration.ofMinutes(5)));
            cacheConfigs.put("menu:categories", defaultConfig.entryTtl(Duration.ofMinutes(15)));
            cacheConfigs.put("menu:tree", defaultConfig.entryTtl(Duration.ofMinutes(5)));
            cacheConfigs.put("menu:toppings", defaultConfig.entryTtl(Duration.ofMinutes(10)));

            log.info("Redis cache manager initialized successfully");
            return RedisCacheManager.builder(connectionFactory)
                    .cacheDefaults(defaultConfig)
                    .withInitialCacheConfigurations(cacheConfigs)
                    .transactionAware()
                    .build();
        } catch (Exception e) {
            log.warn("Redis unavailable, falling back to in-memory cache: {}", e.getMessage());
            return new ConcurrentMapCacheManager(
                    "menu:items", "menu:item-detail", "menu:categories", "menu:tree", "menu:toppings");
        }
    }
}
