package com.example.traphe_backend.ai.service;

import com.example.traphe_backend.ai.dto.UpsellSuggestion;
import com.example.traphe_backend.ai.entity.AiAssociationRule;
import com.example.traphe_backend.ai.repository.AiAssociationRuleRepository;
import com.example.traphe_backend.entity.MenuItem;
import com.example.traphe_backend.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UpsellService {

    private final AiAssociationRuleRepository ruleRepository;
    private final MenuItemRepository menuItemRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    public List<UpsellSuggestion> getSuggestions(List<String> currentItemIds) {
        if (currentItemIds == null || currentItemIds.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, UpsellSuggestion> suggestionMap = new HashMap<>();

        for (String itemId : currentItemIds) {
            List<UpsellSuggestion> cached = getCachedSuggestions(itemId);
            if (cached == null) {
                cached = fetchAndCacheSuggestions(itemId);
            }

            for (UpsellSuggestion suggestion : cached) {
                // Don't suggest items already in the cart
                if (!currentItemIds.contains(suggestion.getItemId())) {
                    // If multiple items suggest the same consequent, keep the one with higher confidence
                    if (!suggestionMap.containsKey(suggestion.getItemId()) || 
                        suggestionMap.get(suggestion.getItemId()).getConfidence() < suggestion.getConfidence()) {
                        suggestionMap.put(suggestion.getItemId(), suggestion);
                    }
                }
            }
        }

        return suggestionMap.values().stream()
                .sorted((a, b) -> Double.compare(b.getConfidence(), a.getConfidence()))
                .limit(3)
                .collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    private List<UpsellSuggestion> getCachedSuggestions(String itemId) {
        String key = "upsell:" + itemId;
        Object cached = redisTemplate.opsForValue().get(key);
        if (cached instanceof List) {
            return (List<UpsellSuggestion>) cached;
        }
        return null;
    }

    private List<UpsellSuggestion> fetchAndCacheSuggestions(String itemId) {
        List<AiAssociationRule> rules = ruleRepository.findByAntecedentIdOrderByConfidenceDesc(itemId);
        
        List<UpsellSuggestion> suggestions = rules.stream().map(rule -> {
            // Need to fetch price and image from MenuItem
            MenuItem item = menuItemRepository.findById(UUID.fromString(rule.getConsequentId())).orElse(null);
            if (item == null || item.isDeleted()) return null;

            return UpsellSuggestion.builder()
                    .itemId(rule.getConsequentId())
                    .itemName(item.getName())
                    .type(rule.getConsequentType())
                    .confidence(rule.getConfidence())
                    .reason("Thường được mua cùng " + rule.getAntecedentName())
                    .price(item.getBasePrice())
                    .imageUrl(item.getImageUrl())
                    .build();
        }).filter(Objects::nonNull).collect(Collectors.toList());

        redisTemplate.opsForValue().set("upsell:" + itemId, suggestions, Duration.ofHours(24));
        return suggestions;
    }
    
    public void clearCache() {
        Set<String> keys = redisTemplate.keys("upsell:*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }
}
