import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  RepairService,
  CreateRepairServiceRequest,
  UpdateRepairServiceRequest,
} from "@/types/repair-service.types";

export const repairService = {
  getAllServices: async () => {
    return axiosClient.get<any, ApiResponse<RepairService[]>>(
      "/repair-services",
    );
  },
  getActiveServices: async () => {
    return axiosClient.get<any, ApiResponse<RepairService[]>>(
      "/repair-services/active",
    );
  },
  getServiceById: async (id: string) => {
    return axiosClient.get<any, ApiResponse<RepairService>>(
      `/repair-services/${id}`,
    );
  },
  createService: async (data: CreateRepairServiceRequest) => {
    return axiosClient.post<any, ApiResponse<RepairService>>(
      "/repair-services",
      data,
    );
  },
  updateService: async (id: string, data: UpdateRepairServiceRequest) => {
    return axiosClient.put<any, ApiResponse<RepairService>>(
      `/repair-services/${id}`,
      data,
    );
  },
  deleteService: async (id: string) => {
    return axiosClient.delete<any, ApiResponse<null>>(`/repair-services/${id}`);
  },
};
