import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  CreateCustomerRequest,
  Customer,
  UpdateCustomerRequest,
} from "@/types/customer.types";

export const customerService = {
  getCustomers: async () => {
    return axiosClient.get<any, ApiResponse<Customer[]>>("/customers");
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
