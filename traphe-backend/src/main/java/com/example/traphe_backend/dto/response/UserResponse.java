package com.example.traphe_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String avatarUrl;
    private boolean isEmailVerified;
    private List<String> roles;
    private UUID branchId;
    private String branchName;
    private TierInfo tier;
    private LoyaltyPointInfo loyaltyPoint;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TierInfo {
        private String name;
        private double discountRate;
        private int minPoint;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoyaltyPointInfo {
        private int totalPoints;
        private int pointsAvailable;
        private int pointsUsed;
        private Integer pointsToNextTier;
    }
}
