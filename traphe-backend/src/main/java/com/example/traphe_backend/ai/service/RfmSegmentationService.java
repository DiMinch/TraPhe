package com.example.traphe_backend.ai.service;

import com.example.traphe_backend.ai.dto.CustomerSegmentResponse;
import com.example.traphe_backend.ai.entity.CustomerSegment;
import com.example.traphe_backend.ai.enums.CustomerSegmentEnum;
import com.example.traphe_backend.ai.repository.CustomerSegmentRepository;
import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.enums.OrderStatus;
import com.example.traphe_backend.enums.RoleName;
import com.example.traphe_backend.repository.OrderRepository;
import com.example.traphe_backend.repository.RoleRepository;
import com.example.traphe_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RfmSegmentationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OrderRepository orderRepository;
    private final CustomerSegmentRepository segmentRepository;

    @Transactional
    public void recalculateAllSegments() {
        log.info("Starting RFM Recalculation batch job...");
        roleRepository.findByName(RoleName.ROLE_CUSTOMER).ifPresent(customerRole -> {
            List<User> customers = userRepository.findByRoles_Id(customerRole.getId());
            
            // Calculate raw RFM for all customers
            List<RfmData> rfmDataList = new ArrayList<>();
            for (User customer : customers) {
                RfmData data = calculateRawRfm(customer);
                if (data != null) {
                    rfmDataList.add(data);
                }
            }

            if (rfmDataList.isEmpty()) {
                log.info("No active customers with orders to segment.");
                return;
            }

            // Calculate quintiles to assign scores 1-5
            assignRfmScores(rfmDataList);

            // Map to segment and save
            for (RfmData data : rfmDataList) {
                CustomerSegmentEnum segment = mapToSegment(data.rScore, data.fScore, data.mScore);
                
                CustomerSegment entity = segmentRepository.findByCustomerId(data.customer.getId())
                        .orElse(CustomerSegment.builder().customer(data.customer).build());
                
                entity.setRecencyDays(data.recency);
                entity.setFrequencyCount(data.frequency);
                entity.setMonetaryTotal(data.monetary);
                entity.setRScore(data.rScore);
                entity.setFScore(data.fScore);
                entity.setMScore(data.mScore);
                entity.setSegment(segment);
                
                segmentRepository.save(entity);
            }
            log.info("Completed RFM Recalculation for {} customers.", rfmDataList.size());
        });
    }

    private RfmData calculateRawRfm(User customer) {
        // Find all COMPLETED orders for this customer
        // In a real app, we might want a custom query: findCompletedOrdersByCustomerId
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> !o.isDeleted() && o.getStatus() == OrderStatus.COMPLETED && o.getCustomer() != null && o.getCustomer().getId().equals(customer.getId()))
                .collect(Collectors.toList());

        if (orders.isEmpty()) {
            return null; // Ignore customers without orders
        }

        LocalDateTime lastOrderDate = orders.stream()
                .map(Order::getCreatedAt)
                .max(LocalDateTime::compareTo)
                .orElse(customer.getCreatedAt());

        int recency = (int) ChronoUnit.DAYS.between(lastOrderDate.toLocalDate(), LocalDate.now());
        long frequency = orders.size();
        BigDecimal monetary = orders.stream()
                .map(Order::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new RfmData(customer, recency, frequency, monetary);
    }

    private void assignRfmScores(List<RfmData> list) {
        // Sort and assign R score (Lower recency is better -> higher score)
        list.sort(Comparator.comparingInt(r -> r.recency));
        assignQuintiles(list, (data, score) -> data.rScore = (6 - score)); // 1 is lowest recency, so score 5

        // Sort and assign F score (Higher frequency is better)
        list.sort(Comparator.comparingLong(r -> r.frequency));
        assignQuintiles(list, (data, score) -> data.fScore = score);

        // Sort and assign M score (Higher monetary is better)
        list.sort(Comparator.comparing(r -> r.monetary));
        assignQuintiles(list, (data, score) -> data.mScore = score);
    }

    private void assignQuintiles(List<RfmData> sortedList, ScoreAssigner assigner) {
        int size = sortedList.size();
        for (int i = 0; i < size; i++) {
            // Percentile from 0.0 to 1.0
            double percentile = (double) i / size;
            int score = (int) (percentile * 5) + 1; // 1 to 5
            if (score > 5) score = 5;
            assigner.assign(sortedList.get(i), score);
        }
    }

    private CustomerSegmentEnum mapToSegment(int r, int f, int m) {
        int fmScore = (f + m) / 2;
        
        if (r >= 4 && fmScore >= 4) return CustomerSegmentEnum.CHAMPIONS;
        if (r >= 3 && fmScore >= 3) return CustomerSegmentEnum.LOYAL_CUSTOMERS;
        if (r >= 4 && fmScore <= 2) return CustomerSegmentEnum.NEW_CUSTOMERS;
        if (r >= 3 && fmScore <= 3) return CustomerSegmentEnum.POTENTIAL_LOYALIST;
        if (r == 2 && fmScore >= 3) return CustomerSegmentEnum.AT_RISK;
        if (r == 2 && fmScore <= 2) return CustomerSegmentEnum.PROMISING;
        if (r == 1 && fmScore >= 3) return CustomerSegmentEnum.LOST;
        return CustomerSegmentEnum.HIBERNATING; // r=1, fmScore<=2
    }

    // Cron job to run every night at 2:00 AM
    @Scheduled(cron = "0 0 2 * * *")
    public void scheduledRecalculation() {
        recalculateAllSegments();
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getSegmentDistribution() {
        List<Object[]> counts = segmentRepository.countBySegment();
        Map<String, Long> result = new HashMap<>();
        for (Object[] row : counts) {
            CustomerSegmentEnum segment = (CustomerSegmentEnum) row[0];
            Long count = (Long) row[1];
            result.put(segment.name(), count);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public Page<CustomerSegmentResponse> getCustomersBySegment(CustomerSegmentEnum segment, Pageable pageable) {
        return segmentRepository.findBySegment(segment, pageable)
                .map(this::mapToResponse);
    }

    private CustomerSegmentResponse mapToResponse(CustomerSegment entity) {
        return CustomerSegmentResponse.builder()
                .customerId(entity.getCustomer().getId())
                .customerName(entity.getCustomer().getFullName())
                .customerEmail(entity.getCustomer().getEmail())
                .customerPhone(entity.getCustomer().getPhoneNumber())
                .recencyDays(entity.getRecencyDays())
                .frequencyCount(entity.getFrequencyCount())
                .monetaryTotal(entity.getMonetaryTotal())
                .rScore(entity.getRScore())
                .fScore(entity.getFScore())
                .mScore(entity.getMScore())
                .segment(entity.getSegment())
                .build();
    }

    private static class RfmData {
        User customer;
        int recency;
        long frequency;
        BigDecimal monetary;
        int rScore;
        int fScore;
        int mScore;

        RfmData(User customer, int recency, long frequency, BigDecimal monetary) {
            this.customer = customer;
            this.recency = recency;
            this.frequency = frequency;
            this.monetary = monetary;
        }
    }

    private interface ScoreAssigner {
        void assign(RfmData data, int score);
    }
}
