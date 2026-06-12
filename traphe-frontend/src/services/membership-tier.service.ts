import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";

// ============================
// Membership Tier Types
// ============================

export interface MembershipTier {
  id: string;
  name: string;
  tierLevel: number;
  minSpending: number;
  pointEarningRate: number;
  discountRate: number;
  isActive: boolean;
  description: string | null;
  createdAt: string;
}

export interface CreateMembershipTierRequest {
  name: string;
  tierLevel: number;
  minSpending: number;
  pointEarningRate: number;
  discountRate: number;
  description?: string;
}

// ============================
// Service
// ============================

export const membershipTierService = {
  getAllTiers: async () => {
    return axiosClient.get<any, ApiResponse<MembershipTier[]>>(
      "/admin/membership-tiers",
    );
  },

  getActiveTiers: async () => {
    return axiosClient.get<any, ApiResponse<MembershipTier[]>>(
      "/admin/membership-tiers/active",
    );
  },

  createTier: async (data: CreateMembershipTierRequest) => {
    return axiosClient.post<any, ApiResponse<MembershipTier>>(
      "/admin/membership-tiers",
      data,
    );
  },

  updateTier: async (id: string, data: CreateMembershipTierRequest) => {
    return axiosClient.put<any, ApiResponse<MembershipTier>>(
      `/admin/membership-tiers/${id}`,
      data,
    );
  },

  deleteTier: async (id: string) => {
    return axiosClient.delete<any, ApiResponse<null>>(
      `/admin/membership-tiers/${id}`,
    );
  },
};
