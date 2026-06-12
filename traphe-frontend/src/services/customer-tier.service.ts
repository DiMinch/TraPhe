import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";
import type { CustomerTier, CustomerTierRequest } from "@/types/customer.types";

export const customerTierService = {
  getAllTiers: async () => {
    return axiosClient.get<any, ApiResponse<CustomerTier[]>>("/admin/membership-tiers");
  },

  getActiveTiers: async () => {
    return axiosClient.get<any, ApiResponse<CustomerTier[]>>(
      "/admin/membership-tiers/active",
    );
  },

  getTierById: async (id: string) => {
    return axiosClient.get<any, ApiResponse<CustomerTier>>(
      `/admin/membership-tiers/${id}`,
    );
  },

  createTier: async (data: CustomerTierRequest) => {
    return axiosClient.post<any, ApiResponse<CustomerTier>>(
      "/admin/membership-tiers",
      data,
    );
  },

  updateTier: async (id: string, data: CustomerTierRequest) => {
    return axiosClient.put<any, ApiResponse<CustomerTier>>(
      `/admin/membership-tiers/${id}`,
      data,
    );
  },

  deleteTier: async (id: string) => {
    return axiosClient.delete<any, ApiResponse<null>>(`/admin/membership-tiers/${id}`);
  },

  toggleStatus: async (id: string) => {
    return axiosClient.post<any, ApiResponse<CustomerTier>>(
      `/admin/membership-tiers/${id}/toggle-status`,
    );
  },

  recalculateAll: async () => {
    return axiosClient.post<any, ApiResponse<null>>(
      "/admin/membership-tiers/recalculate-all",
    );
  },
};
