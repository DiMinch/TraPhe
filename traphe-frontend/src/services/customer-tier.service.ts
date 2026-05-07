import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";
import type { CustomerTier, CustomerTierRequest } from "@/types/customer.types";

export const customerTierService = {
  getAllTiers: async () => {
    return axiosClient.get<any, ApiResponse<CustomerTier[]>>("/customer-tiers");
  },

  getActiveTiers: async () => {
    return axiosClient.get<any, ApiResponse<CustomerTier[]>>(
      "/customer-tiers/active",
    );
  },

  getTierById: async (id: string) => {
    return axiosClient.get<any, ApiResponse<CustomerTier>>(
      `/customer-tiers/${id}`,
    );
  },

  createTier: async (data: CustomerTierRequest) => {
    return axiosClient.post<any, ApiResponse<CustomerTier>>(
      "/customer-tiers",
      data,
    );
  },

  updateTier: async (id: string, data: CustomerTierRequest) => {
    return axiosClient.put<any, ApiResponse<CustomerTier>>(
      `/customer-tiers/${id}`,
      data,
    );
  },

  deleteTier: async (id: string) => {
    return axiosClient.delete<any, ApiResponse<null>>(`/customer-tiers/${id}`);
  },

  toggleStatus: async (id: string) => {
    return axiosClient.post<any, ApiResponse<CustomerTier>>(
      `/customer-tiers/${id}/toggle-status`,
    );
  },

  recalculateAll: async () => {
    return axiosClient.post<any, ApiResponse<null>>(
      "/customer-tiers/recalculate-all",
    );
  },
};
