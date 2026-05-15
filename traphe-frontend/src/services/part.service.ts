import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  PartComponent,
  CreatePartRequest,
  UpdatePartRequest,
} from "@/types/part.types";

export const partService = {
  getAllParts: async () => {
    return axiosClient.get<any, ApiResponse<PartComponent[]>>(
      "/part-components",
    );
  },

  getPartById: async (id: string) => {
    return axiosClient.get<any, ApiResponse<PartComponent>>(
      `/part-components/${id}`,
    );
  },

  createPart: async (data: CreatePartRequest) => {
    return axiosClient.post<any, ApiResponse<PartComponent>>(
      "/part-components",
      data,
    );
  },

  updatePart: async (id: string, data: UpdatePartRequest) => {
    return axiosClient.put<any, ApiResponse<PartComponent>>(
      `/part-components/${id}`,
      data,
    );
  },

  deletePart: async (id: string) => {
    return axiosClient.delete<any, ApiResponse<null>>(`/part-components/${id}`);
  },

  getLowStockParts: async () => {
    return axiosClient.get<any, ApiResponse<PartComponent[]>>(
      "/part-components/low-stock",
    );
  },

  getActiveParts: async () => {
    return axiosClient.get<any, ApiResponse<PartComponent[]>>(
      "/part-components/active",
    );
  },
};
