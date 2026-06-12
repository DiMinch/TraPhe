package com.example.traphe_backend.ai.dto;

import com.example.traphe_backend.ai.enums.CustomerSegmentEnum;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class CustomerSegmentResponse {
    private UUID customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    
    private Integer recencyDays;
    private Long frequencyCount;
    private BigDecimal monetaryTotal;
    
    private Integer rScore;
    private Integer fScore;
    private Integer mScore;
    
    private CustomerSegmentEnum segment;
}
