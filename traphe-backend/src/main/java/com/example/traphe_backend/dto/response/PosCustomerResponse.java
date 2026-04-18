package com.example.traphe_backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PosCustomerResponse {
    private UUID customerId;
    private String fullName;
    private String phoneNumber;
    private int loyaltyPoints;
}
