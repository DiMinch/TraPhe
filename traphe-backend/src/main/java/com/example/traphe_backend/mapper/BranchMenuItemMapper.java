package com.example.traphe_backend.mapper;

import com.example.traphe_backend.dto.response.BranchMenuItemResponse;
import com.example.traphe_backend.entity.BranchMenuItem;
import org.springframework.stereotype.Component;

@Component
public class BranchMenuItemMapper {

    public BranchMenuItemResponse toResponse(BranchMenuItem bmi) {
        return BranchMenuItemResponse.builder()
                .branchId(bmi.getBranch().getId())
                .menuItemId(bmi.getMenuItem().getId())
                .menuItemName(bmi.getMenuItem().getName())
                .menuItemImageUrl(bmi.getMenuItem().getImageUrl())
                .isAvailable(bmi.isAvailable())
                .customPrice(bmi.getCustomPrice())
                .unavailableReason(bmi.getUnavailableReason())
                .build();
    }
}
