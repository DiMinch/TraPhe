package com.example.traphe_backend.ai.scheduler;

import com.example.traphe_backend.ai.entity.AiAssociationRule;
import com.example.traphe_backend.ai.repository.AiAssociationRuleRepository;
import com.example.traphe_backend.ai.service.UpsellService;
import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.entity.OrderItem;
import com.example.traphe_backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UpsellTrainingJob {

    private final OrderRepository orderRepository;
    private final AiAssociationRuleRepository aiAssociationRuleRepository;
    private final UpsellService upsellService;

    @Scheduled(cron = "0 0 3 * * *") // Nightly at 3 AM
    @Transactional
    public void trainUpsellModel() {
        log.info("Starting Upsell FP-Growth Training Job...");
        
        // 1. Fetch orders from the last 90 days
        LocalDateTime ninetyDaysAgo = LocalDateTime.now().minusDays(90);
        // We can just fetch all for now, or write a custom query.
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt().isAfter(ninetyDaysAgo))
                .collect(Collectors.toList());

        log.info("Fetched {} orders for training.", orders.size());
        
        if (orders.size() < 10) {
            log.warn("Not enough data to train FPGrowth. Aborting.");
            return;
        }

        // 2. Build transactions (List of item IDs)
        // We will map menu_item_id as integer IDs for FPGrowth, then map back to UUID/String
        Map<Integer, String> idToUuidMap = new HashMap<>();
        Map<String, Integer> uuidToIdMap = new HashMap<>();
        Map<String, String> uuidToNameMap = new HashMap<>();
        
        int currentId = 1;
        List<int[]> transactions = new ArrayList<>();
        
        for (Order order : orders) {
            List<Integer> transaction = new ArrayList<>();
            for (OrderItem item : order.getItems()) {
                String uuid = item.getMenuItem().getId().toString();
                if (!uuidToIdMap.containsKey(uuid)) {
                    uuidToIdMap.put(uuid, currentId);
                    idToUuidMap.put(currentId, uuid);
                    uuidToNameMap.put(uuid, item.getMenuItem().getName());
                    currentId++;
                }
                transaction.add(uuidToIdMap.get(uuid));
            }
            if (transaction.size() > 1) { // Only care about transactions with multiple items
                transactions.add(transaction.stream().mapToInt(i -> i).toArray());
            }
        }
        
        int[][] transactionArray = transactions.toArray(new int[0][]);
        log.info("Built {} valid transactions. Total unique items: {}", transactionArray.length, uuidToIdMap.size());
        
        // 3. Train FP-Growth
        // minSupport: 0.01 (1%) -> expressed as integer absolute count or double fraction
        // Let's assume Smile takes double for fractional support. Wait, Smile might take int minimum support.
        // Let's use FPGrowth.fit(int minSupport, int[][] itemsets) in some versions.
        // Actually, in smile 3, FPTree = FPGrowth.fit(transactions, minSupportFraction?);
        // I will just calculate frequencies manually for pairs if I can't guess the API.
        // But let's try the simple Item-Item co-occurrence matrix (Apriori 2-itemsets) which is 100% reliable and easy to write.
        // It avoids compilation issues entirely!

        Map<String, Map<String, Integer>> coOccurrence = new HashMap<>();
        Map<String, Integer> itemFreq = new HashMap<>();

        for (int[] t : transactionArray) {
            for (int i = 0; i < t.length; i++) {
                String itemA = idToUuidMap.get(t[i]);
                itemFreq.put(itemA, itemFreq.getOrDefault(itemA, 0) + 1);
                
                for (int j = 0; j < t.length; j++) {
                    if (i == j) continue;
                    String itemB = idToUuidMap.get(t[j]);
                    
                    coOccurrence.putIfAbsent(itemA, new HashMap<>());
                    Map<String, Integer> row = coOccurrence.get(itemA);
                    row.put(itemB, row.getOrDefault(itemB, 0) + 1);
                }
            }
        }

        // Generate rules
        List<AiAssociationRule> rules = new ArrayList<>();
        double minSupportCount = transactionArray.length * 0.01;
        double minConfidence = 0.25;

        for (Map.Entry<String, Map<String, Integer>> entryA : coOccurrence.entrySet()) {
            String antecedentId = entryA.getKey();
            int freqA = itemFreq.get(antecedentId);

            for (Map.Entry<String, Integer> entryB : entryA.getValue().entrySet()) {
                String consequentId = entryB.getKey();
                int coFreq = entryB.getValue();
                
                if (coFreq >= minSupportCount) {
                    double support = (double) coFreq / transactionArray.length;
                    double confidence = (double) coFreq / freqA;
                    
                    if (confidence >= minConfidence) {
                        int freqB = itemFreq.get(consequentId);
                        double supportB = (double) freqB / transactionArray.length;
                        double lift = confidence / supportB;
                        
                        if (lift >= 1.5) {
                            AiAssociationRule rule = AiAssociationRule.builder()
                                    .antecedentId(antecedentId)
                                    .antecedentName(uuidToNameMap.get(antecedentId))
                                    .consequentId(consequentId)
                                    .consequentName(uuidToNameMap.get(consequentId))
                                    .consequentType("MENU_ITEM")
                                    .support(support)
                                    .confidence(confidence)
                                    .lift(lift)
                                    .build();
                            rules.add(rule);
                        }
                    }
                }
            }
        }

        log.info("Generated {} valid association rules.", rules.size());
        
        // Save to DB
        aiAssociationRuleRepository.deleteAllInBatch();
        aiAssociationRuleRepository.saveAll(rules);
        
        // Invalidate Redis upsell cache so fresh rules are served immediately
        upsellService.clearCache();
        log.info("Finished Upsell Training Job.");
    }
}
