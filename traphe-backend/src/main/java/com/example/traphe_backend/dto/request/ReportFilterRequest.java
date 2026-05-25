package com.example.traphe_backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportFilterRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private String groupBy;
    private String sortBy;
    private Integer limit;
    private UUID branchId;
}
