import axiosClient from "@/lib/axios-client";
import type { ApiResponse, PageResponse } from "@/types/api.types";

export interface IngredientStockResponse {
  id: string;
  branchId: string;
  ingredientId: string;
  ingredientName: string;
  unit: string;
  quantityAvailable: number;
  minStockAlert: number;
  isLowStock: boolean;
  lastUpdated: string;
}

export interface ImportItem {
  ingredientId: string;
  quantity: number;
}

export interface ImportStockRequest {
  supplierId?: string;
  items: ImportItem[];
}

export interface AdjustStockRequest {
  ingredientId: string;
  quantity: number;
  reason: string;
}

export interface StockTransactionResponse {
  id: string;
  ingredientName: string;
  type: string;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceType: string;
  referenceId: string;
  reason: string;
  createdAt: string;
}

export const branchStockService = {
  getStock: async (branchId: string, searchName?: string, lowStockOnly?: boolean) => {
    return axiosClient.get<any, ApiResponse<IngredientStockResponse[]>>("/branch/stock", {
      params: { branchId, searchName, lowStockOnly }
    });
  },

  importStock: async (branchId: string, data: ImportStockRequest) => {
    return axiosClient.post<any, ApiResponse<any>>(`/branch/stock/import`, data, {
      params: { branchId }
    });
  },

  adjustStock: async (branchId: string, data: AdjustStockRequest) => {
    return axiosClient.post<any, ApiResponse<IngredientStockResponse>>(`/branch/stock/adjust`, data, {
      params: { branchId }
    });
  },

  getTransactions: async (params: {
    branchId?: string;
    ingredientId?: string;
    type?: string;
    referenceId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }) => {
    return axiosClient.get<any, ApiResponse<PageResponse<StockTransactionResponse>>>("/stock-transactions", { params });
  }
};
