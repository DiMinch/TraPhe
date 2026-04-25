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
public class SupplierResponse {
    private UUID id;
    private String name;
    private String contactName;
    private String phone;
    private String email;
    private String address;
    private LocalDateTime createdAt;
}
