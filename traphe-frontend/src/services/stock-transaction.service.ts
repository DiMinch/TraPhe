import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";

export interface StockTransactionResponse {
  id: string;
  ingredientName: string | null;
  type: string;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  reason: string;
  createdAt: string;
}

export const stockTransactionService = {
  /**
   * GET /api/stock-transactions
   * Backend requires branchId. Supports filter by ingredientId, type, date range.
   */
  getTransactions: async (params: {
    branchId: string;
    ingredientId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }) => {
    return axiosClient.get<any, ApiResponse<any>>("/stock-transactions", {
      params,
    });
  },

  /**
   * GET /api/stock-transactions/ingredient
   * Lịch sử biến động 1 nguyên liệu tại chi nhánh.
   */
  getByIngredient: async (
    branchId: string,
    ingredientId: string,
    page = 0,
    size = 20,
  ) => {
    return axiosClient.get<any, ApiResponse<any>>(
      "/stock-transactions/ingredient",
      {
        params: { branchId, ingredientId, page, size },
      },
    );
  },
};
