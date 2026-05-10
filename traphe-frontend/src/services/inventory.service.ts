import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";

export interface InventoryResponse {
  id: string;
  productVariant: {
    id: string;
    sku: string;
    variantName: string;
    productName: string;
  };
  quantityPhysical: number;
  quantityReserved: number;
  quantityAvailable: number;
  minThreshold: number;
  lastCountedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const inventoryService = {
  // Get all inventory items
  getAllInventory: async () => {
    return axiosClient.get<any, ApiResponse<InventoryResponse[]>>("/inventory");
  },

  // Get inventory by product variant ID
  getInventoryByVariantId: async (productVariantId: string) => {
    return axiosClient.get<any, ApiResponse<InventoryResponse>>(
      `/inventory/variant/${productVariantId}`,
    );
  },

  // Get serials by product variant ID
  getSerialsByVariantId: async (productVariantId: string, status?: string) => {
    const params = status ? { status } : {};
    return axiosClient.get<any, ApiResponse<any[]>>(
      `/inventory/variant/${productVariantId}/serials`,
      { params },
    );
  },

  // Get serials by status
  getSerialsByStatus: async (status: string) => {
    return axiosClient.get<any, ApiResponse<any[]>>(
      `/inventory/serials/status/${status}`,
    );
  },

  // Update serial status
  updateSerialStatus: async (serialNumber: string, status: string) => {
    return axiosClient.put<any, ApiResponse<any>>(
      `/inventory/serials/${serialNumber}/status`,
      { status },
    );
  },

  // Create stock adjustment
  createStockAdjustment: async (data: {
    reason: string;
    items: Array<{
      productVariantId: string;
      type: string;
      quantity: number;
      reason: string;
    }>;
  }) => {
    return axiosClient.post<any, ApiResponse<any>>(
      "/v1/inventory-adjustments",
      data,
    );
  },
};
