import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";

// ============================
// Promotion Types (matching backend)
// ============================

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface PromotionResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface PromotionRequest {
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  perUserLimit: number;
  startDate: string;
  endDate: string;
}

// ============================
// Service
// ============================

export const promotionService = {
  /** Lấy tất cả khuyến mãi (Admin) */
  getAllPromotions: async () => {
    return axiosClient.get<any, ApiResponse<PromotionResponse[]>>(
      "/admin/promotions",
    );
  },

  /** Lấy khuyến mãi đang hoạt động */
  getActivePromotions: async () => {
    return axiosClient.get<any, ApiResponse<PromotionResponse[]>>(
      "/admin/promotions/active",
    );
  },

  /** Chi tiết khuyến mãi */
  getPromotionById: async (id: string) => {
    return axiosClient.get<any, ApiResponse<PromotionResponse>>(
      `/admin/promotions/${id}`,
    );
  },

  /** Tạo khuyến mãi mới */
  createPromotion: async (data: PromotionRequest) => {
    return axiosClient.post<any, ApiResponse<PromotionResponse>>(
      "/admin/promotions",
      data,
    );
  },

  /** Cập nhật khuyến mãi */
  updatePromotion: async (id: string, data: PromotionRequest) => {
    return axiosClient.put<any, ApiResponse<PromotionResponse>>(
      `/admin/promotions/${id}`,
      data,
    );
  },

  /** Xoá khuyến mãi (soft delete) */
  deletePromotion: async (id: string) => {
    return axiosClient.delete<any, ApiResponse<null>>(
      `/admin/promotions/${id}`,
    );
  },

  /** Bật/tắt trạng thái */
  toggleStatus: async (id: string) => {
    return axiosClient.post<any, ApiResponse<PromotionResponse>>(
      `/admin/promotions/${id}/toggle-status`,
    );
  },
};
