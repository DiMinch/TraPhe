import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";

// Supplier response from backend (matches Supplier entity)
export interface SupplierResponse {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

// Request to create/update supplier
export interface SupplierRequest {
  name: string;
  contact_name?: string;
  phone?: string;
  address?: string;
  email?: string;
}

export const supplierService = {
  // Get all suppliers
  getAllSuppliers: async () => {
    return axiosClient.get<any, ApiResponse<SupplierResponse[]>>("/admin/suppliers");
  },

  // Get supplier by ID
  getSupplierById: async (id: string) => {
    return axiosClient.get<any, ApiResponse<SupplierResponse>>(
      `/admin/suppliers/${id}`,
    );
  },

  // Create a new supplier
  createSupplier: async (data: SupplierRequest) => {
    return axiosClient.post<any, ApiResponse<SupplierResponse>>(
      "/admin/suppliers",
      data,
    );
  },

  // Update supplier
  updateSupplier: async (id: string, data: SupplierRequest) => {
    return axiosClient.put<any, ApiResponse<SupplierResponse>>(
      `/admin/suppliers/${id}`,
      data,
    );
  },

  // Delete supplier
  deleteSupplier: async (id: string) => {
    return axiosClient.delete<any, ApiResponse<void>>(`/admin/suppliers/${id}`);
  },
};
