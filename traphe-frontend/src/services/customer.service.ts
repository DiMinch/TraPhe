import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  CreateCustomerRequest,
  Customer,
  UpdateCustomerRequest,
} from "@/types/customer.types";

export const customerService = {
  getCustomers: async (params?: { page?: number; size?: number; search?: string }) => {
    return axiosClient.get<any, ApiResponse<any>>("/customers", { params });
  },

  getCustomerCount: async () => {
    return axiosClient.get<any, ApiResponse<number>>("/customers/count");
  },

  getCustomerStats: async () => {
    return axiosClient.get<any, ApiResponse<{ totalCustomers: number; newCustomersCount: number; vipCount: number }>>("/customers/stats");
  },

  getCustomerById: async (id: string) => {
    return axiosClient.get<any, ApiResponse<Customer>>(`/customers/${id}`);
  },

  createCustomer: async (data: CreateCustomerRequest) => {
    return axiosClient.post<any, ApiResponse<Customer>>("/customers", data);
  },

  updateCustomer: async (id: string, data: UpdateCustomerRequest) => {
    return axiosClient.put<any, ApiResponse<Customer>>(
      `/customers/${id}`,
      data,
    );
  },

  deleteCustomer: async (id: string) => {
    return axiosClient.delete<any, ApiResponse<null>>(`/customers/${id}`);
  },

  getCustomerVouchers: async (id: string) => {
    return axiosClient.get<any, ApiResponse<any[]>>(`/customers/${id}/vouchers`);
  },
};
