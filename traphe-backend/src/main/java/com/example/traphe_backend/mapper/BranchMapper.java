package com.example.traphe_backend.mapper;

import com.example.traphe_backend.dto.response.BranchHourResponse;
import com.example.traphe_backend.dto.response.BranchResponse;
import com.example.traphe_backend.entity.Branch;
import com.example.traphe_backend.entity.BranchHour;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BranchMapper {

    public BranchResponse toResponse(Branch branch, List<BranchHour> hours) {
        return BranchResponse.builder()
                .id(branch.getId())
                .name(branch.getName())
                .address(branch.getAddress())
                .lat(branch.getLat())
                .lng(branch.getLng())
                .phone(branch.getPhone())
                .isActive(branch.isActive())
                .hours(hours != null ? hours.stream().map(this::toHourResponse).toList() : List.of())
                .build();
    }

    public BranchHourResponse toHourResponse(BranchHour hour) {
        return BranchHourResponse.builder()
                .id(hour.getId())
                .dayOfWeek(hour.getDayOfWeek())
                .openTime(hour.getOpenTime())
                .closeTime(hour.getCloseTime())
                .isClosed(hour.isClosed())
                .build();
    }
}
