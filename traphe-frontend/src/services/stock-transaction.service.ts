import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";

export interface StockTransactionResponse {
  id: string;
  inventoryId: string;
  type: "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT" | "RETURN" | "TRANSFER";
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: string;
  referenceId: string;
  createdAt: string;
  createdBy: string;
}

export const stockTransactionService = {
  // Get all stock transactions
  // TODO: Backend endpoint not yet available
  // Expected: GET /api/stock-transactions
  getAllTransactions: async () => {
    return axiosClient.get<any, ApiResponse<StockTransactionResponse[]>>(
      "/stock-transactions",
    );
  },

  // Get transactions by inventory ID
  // TODO: Backend endpoint not yet available
  // Expected: GET /api/stock-transactions/inventory/{inventoryId}
  getTransactionsByInventoryId: async (inventoryId: string) => {
    return axiosClient.get<any, ApiResponse<StockTransactionResponse[]>>(
      `/stock-transactions/inventory/${inventoryId}`,
    );
  },

  // Get transactions by type
  // TODO: Backend endpoint not yet available
  // Expected: GET /api/stock-transactions/type/{type}
  getTransactionsByType: async (
    type: "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT" | "RETURN" | "TRANSFER",
  ) => {
    return axiosClient.get<any, ApiResponse<StockTransactionResponse[]>>(
      `/stock-transactions/type/${type}`,
    );
  },

  // Get transactions by reference ID (PO number, Order number, etc.)
  // TODO: Backend endpoint not yet available
  // Expected: GET /api/stock-transactions/reference/{referenceId}
  getTransactionsByReferenceId: async (referenceId: string) => {
    return axiosClient.get<any, ApiResponse<StockTransactionResponse[]>>(
      `/stock-transactions/reference/${referenceId}`,
    );
  },

  // Get transactions by date range
  // TODO: Backend endpoint not yet available
  // Expected: GET /api/stock-transactions/date-range?startDate={startDate}&endDate={endDate}
  getTransactionsByDateRange: async (startDate: string, endDate: string) => {
    return axiosClient.get<any, ApiResponse<StockTransactionResponse[]>>(
      `/stock-transactions/date-range`,
      {
        params: { startDate, endDate },
      },
    );
  },
};
