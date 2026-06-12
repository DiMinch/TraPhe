import axiosClient from "@/lib/axios-client";

export interface Topping {
  id: string;
  name: string;
  extraPrice: number;
  imageUrl: string | null;
  isAvailable: boolean;
  available?: boolean;
}

export interface ToppingRequest {
  name: string;
  extraPrice: number;
  isAvailable?: boolean;
  imageUrl?: string;
}

export const toppingService = {
  getAll: async (params?: {
    search?: string;
    isAvailable?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) => {
    return axiosClient.get("/admin/toppings", { params });
  },

  getById: async (id: string) => {
    return axiosClient.get(`/admin/toppings/${id}`);
  },

  create: async (data: ToppingRequest) => {
    return axiosClient.post("/admin/toppings", data);
  },

  update: async (id: string, data: ToppingRequest) => {
    return axiosClient.put(`/admin/toppings/${id}`, data);
  },

  delete: async (id: string) => {
    return axiosClient.delete(`/admin/toppings/${id}`);
  },
};
