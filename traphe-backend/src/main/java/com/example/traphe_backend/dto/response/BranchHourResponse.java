package com.example.traphe_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BranchHourResponse {
    private UUID id;
    private int dayOfWeek;
    private LocalTime openTime;
    private LocalTime closeTime;
    private boolean isClosed;
}
