package com.example.traphe_backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;
import java.time.LocalDateTime;

@Data
@Builder
public class PosQueueItemResponse {
    private UUID orderId;
    private String orderNumber;
    private String customerName;
    private String orderType;
    private String brewingStatus;
    private LocalDateTime createdAt;
    // can add items summary if needed
}
