package com.example.traphe_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAddressResponse {
    private UUID id;
    private String recipientName;
    private String recipientPhone;
    private String addressLine;
    private String wardCode;
    private String wardName;
    private String provinceCode;
    private String provinceName;
    private boolean isDefault;
    /** Full address for display: "addressLine, wardName, provinceName" */
    private String fullAddress;
    private LocalDateTime createdAt;
}
