import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";

export interface SystemConfigResponse {
  id: string;
  configKey: string;
  configValue: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SystemConfigRequest {
  configKey: string;
  configValue: string;
  description?: string;
}

const BASE_URL = "/admin/system-config";

export const systemConfigService = {
  // Get all system configs
  getAllConfigs: async () => {
    return axiosClient.get<unknown, ApiResponse<SystemConfigResponse[]>>(
      BASE_URL,
    );
  },

  // Get config by ID
  getConfigById: async (id: string) => {
    return axiosClient.get<unknown, ApiResponse<SystemConfigResponse>>(
      `${BASE_URL}/${id}`,
    );
  },

  // Create new config
  createConfig: async (data: SystemConfigRequest) => {
    return axiosClient.post<unknown, ApiResponse<SystemConfigResponse>>(
      BASE_URL,
      data,
    );
  },

  // Update config
  updateConfig: async (id: string, data: SystemConfigRequest) => {
    return axiosClient.put<unknown, ApiResponse<SystemConfigResponse>>(
      `${BASE_URL}/${id}`,
      data,
    );
  },

  // Delete config
  deleteConfig: async (id: string) => {
    return axiosClient.delete<unknown, ApiResponse<void>>(`${BASE_URL}/${id}`);
  },
};
