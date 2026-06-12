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
  active: boolean;
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
  dailyStartTime?: string | null;
  dailyEndTime?: string | null;
  targetSegments?: string[];
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
  dailyStartTime?: string | null;
  dailyEndTime?: string | null;
  targetSegments?: string[];
}

export interface VoucherBatchRequest {
  batchName: string;
  prefix: string;
  quantity: number;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
}

export interface VoucherBatchResponse {
  batchName: string;
  prefix: string;
  quantity: number;
  codes: string[];
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

  /** Lấy khuyến mãi đang hoạt động (Public) */
  getActivePromotions: async () => {
    return axiosClient.get<any, ApiResponse<PromotionResponse[]>>(
      "/promotions/active",
    );
  },

  /**
   * Lấy tất cả khuyến mãi kèm trạng thái eligible cho user hiện tại (Authenticated).
   * Server pre-validates: per-user usage, min order, time windows, target segments, etc.
   * Returns each promotion with `eligible` (boolean) + `ineligibleReason` (string | null).
   */
  getCheckoutEligible: async (payload: {
    subtotal: number;
    items: Array<{ productId?: string; productVariantId?: string; quantity: number; unitPrice: number }>;
  }) => {
    return axiosClient.post<any, ApiResponse<CheckoutEligiblePromotion[]>>(
      "/promotions/checkout-eligible",
      payload
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

  calculateCartDiscount: async (payload: {
    items: Array<{ productId?: string; productVariantId?: string; quantity: number; unitPrice: number }>;
    code: string;
    appliedCodes?: string[];
    customerId?: string;
  }) => {
    try {
      const response = await axiosClient.post<any, ApiResponse<{ discountAmount: number; finalAmount: number; promotionId?: string }>>(
        "/promotions/calculate",
        payload
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Không thể tính giảm giá");
      }

      const { discountAmount, finalAmount, promotionId } = response.data;

      return {
        data: {
          totalDiscount: discountAmount,
          finalAmount: finalAmount,
          orderPromotion: {
            promotionId: promotionId || "",
            code: payload.code,
            discountAmount: discountAmount,
          },
          productPromotions: [] as Array<{ promotionId: string }>,
        },
      };
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || "Mã khuyến mãi không tồn tại hoặc đã hết hạn";
      throw new Error(errMsg);
    }
  },

  // === Admin Voucher Batch ===
  generateVoucherBatch: async (data: VoucherBatchRequest) => {
    return axiosClient.post<any, ApiResponse<VoucherBatchResponse>>(
      "/admin/vouchers/batch",
      data,
    );
  },

  // ======================== Customer Voucher APIs ========================

  /** Lấy danh sách voucher cá nhân của user (My Vouchers) */
  getMyVouchers: async (status?: string) => {
    const params = status ? { status } : {};
    return axiosClient.get<any, ApiResponse<MyVoucherResponse[]>>(
      "/vouchers/me",
      { params },
    );
  },

  /** Đổi điểm tích lũy lấy phần thưởng (tạo voucher cá nhân) */
  redeemReward: async (data: {
    rewardId: string;
    rewardName: string;
    pointsCost: number;
    rewardDescription?: string;
    discountValue?: number;
    discountType?: string;
  }) => {
    return axiosClient.post<any, ApiResponse<RedeemRewardResponse>>(
      "/loyalty/redeem",
      data,
    );
  },
};

// ======================== Customer Voucher Types ========================

export interface MyVoucherResponse {
  id: string;
  promotionId: string;
  code: string;
  name: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number | null;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  status: "AVAILABLE" | "USED" | "EXPIRED";
  source: string | null;  // LOYALTY_REDEEM, ADMIN_BATCH, EVENT
  assignedAt: string;
  usedAt: string | null;
}

export interface RedeemRewardResponse {
  voucherCode: string;
  rewardName: string;
  pointsDeducted: number;
  remainingPoints: number;
}

// ======================== Checkout Eligible Types ========================

export interface CheckoutEligiblePromotion {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderValue: number | null;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  myVoucher: boolean;
  /** Pre-computed by server: true if this user can apply this voucher right now */
  eligible: boolean;
  /** Human-readable reason why not eligible (null if eligible) */
  ineligibleReason: string | null;
}

