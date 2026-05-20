import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";

// ============================
// Promotion Types (matching backend)
// ============================

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";
export type PromotionStatus = "ACTIVE" | "INACTIVE" | "EXPIRED" | "SCHEDULED";
export type PromotionType = "PERCENTAGE" | "FIXED_AMOUNT" | "BUY_X_GET_Y";

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

  // Frontend compatibility fields
  status?: PromotionStatus;
  type?: PromotionType;
  value?: number;
  scope?: string;
  priority?: number;
  usagePerCustomer?: number;
  applicableCategoryIds?: string[];
  applicableProductIds?: string[];
  applicableCustomerTiers?: string[];
  conflictingPromotionIds?: string[];
  hasQuota?: boolean;
  remainingQuota?: number;
}

export interface PromotionRequest {
  code: string;
  name: string;
  description?: string;
  discountType?: DiscountType;
  discountValue?: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  startDate: string;
  endDate: string;

  // Frontend compatibility fields
  type?: PromotionType;
  value?: number;
  scope?: string;
  priority?: number;
  usagePerCustomer?: number;
  applicableCategoryIds?: string[];
  applicableProductIds?: string[];
  applicableCustomerTiers?: string[];
  conflictingPromotionIds?: string[];
}

export interface PromotionUsageReportResponse {
  totalUsage: number;
  totalDiscountGiven: number;
  averageDiscountPerUse: number;
  usageByDate?: Record<string, number>;
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

  /** Bật/tắt trạng thái (alias cho frontend) */
  togglePromotionStatus: async (id: string) => {
    return axiosClient.post<any, ApiResponse<PromotionResponse>>(
      `/admin/promotions/${id}/toggle-status`,
    );
  },

  /** Lấy báo cáo sử dụng khuyến mãi (mocked) */
  getPromotionUsageReport: async (id: string) => {
    console.log("Mock usage report for:", id);
    return {
      data: {
        success: true,
        message: "Promotion usage report fetched successfully",
        data: {
          totalUsage: 25,
          totalDiscountGiven: 1250000,
          averageDiscountPerUse: 50000,
          usageByDate: {
            "2026-05-18": 5,
            "2026-05-19": 12,
            "2026-05-20": 8
          }
        }
      }
    } as any;
  },

  /** Tính toán giảm giá giỏ hàng (Client side fallback) */
  calculateCartDiscount: async (payload: {
    items: Array<{ productId?: string; productVariantId?: string; quantity: number; unitPrice: number }>;
    code: string;
    appliedCodes?: string[];
    customerId?: string;
  }) => {
    // 1. Fetch active promotions
    const activeRes = await promotionService.getActivePromotions();
    const promotions = activeRes.data || [];
    const promo = promotions.find(
      (p) => p.code.toUpperCase() === payload.code.toUpperCase()
    );

    if (!promo) {
      throw new Error("Mã khuyến mãi không tồn tại hoặc đã hết hạn");
    }

    // 2. Calculate cart subtotal
    const subtotal = payload.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    // 3. Check min order value
    if (promo.minOrderValue && subtotal < promo.minOrderValue) {
      throw new Error(`Đơn hàng tối thiểu ${promo.minOrderValue.toLocaleString()}₫ để áp dụng`);
    }

    // 4. Calculate discount
    let totalDiscount = 0;
    const discountVal = promo.discountValue ?? (promo as any).value ?? 0;
    const discType = promo.discountType ?? (promo as any).type ?? "PERCENTAGE";

    if (discType === "PERCENTAGE") {
      totalDiscount = (subtotal * discountVal) / 100;
      if (promo.maxDiscountAmount && totalDiscount > promo.maxDiscountAmount) {
        totalDiscount = promo.maxDiscountAmount;
      }
    } else {
      totalDiscount = discountVal;
    }

    // Ensure discount doesn't exceed subtotal
    totalDiscount = Math.min(totalDiscount, subtotal);

    const finalAmount = subtotal - totalDiscount;

    return {
      data: {
        totalDiscount,
        finalAmount,
        orderPromotion: {
          promotionId: promo.id,
          code: promo.code,
          discountAmount: totalDiscount,
        },
        productPromotions: [] as Array<{ promotionId: string }>,
      },
    };
  }
};
