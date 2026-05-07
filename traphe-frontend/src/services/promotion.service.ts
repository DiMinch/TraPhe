import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";

// Enums matching backend
export type PromotionType = "PERCENTAGE" | "FIXED_AMOUNT" | "BUY_X_GET_Y";
export type PromotionScope = "ORDER" | "PRODUCT" | "CATEGORY" | "SHIPPING";
export type PromotionStatus = "ACTIVE" | "INACTIVE" | "SCHEDULED" | "EXPIRED";

// Response interface matching backend PromotionResponse
export interface PromotionResponse {
  id: string;
  code: string;
  name: string;
  type: PromotionType;
  scope: PromotionScope;
  value: number;
  minOrderValue: number | null;
  maxDiscountAmount: number | null;
  applicableCustomerTiers: string[] | null;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  usageLimit: number | null;
  usageCount: number | null;
  usagePerCustomer: number | null;
  priority: number;
  description: string | null;
  applicableCategoryIds: string[] | null;
  applicableProductIds: string[] | null;
  conflictingPromotionIds: string[] | null;
  isActive: boolean;
  hasQuota: boolean;
  remainingQuota: number | null;
  createdAt: string;
  updatedAt: string;
}

// Request interface matching backend PromotionRequest
export interface PromotionRequest {
  code: string;
  name: string;
  type: PromotionType;
  scope: PromotionScope;
  value: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  applicableCustomerTiers?: string[];
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usagePerCustomer?: number;
  priority: number;
  description?: string;
  applicableCategoryIds?: string[];
  applicableProductIds?: string[];
  conflictingPromotionIds?: string[];
}

// Usage report interface
export interface PromotionUsageReportResponse {
  promotionId: string;
  promotionCode: string;
  promotionName: string;
  totalUsage: number;
  totalDiscountGiven: number;
  averageDiscountPerUse: number;
  usageByDate: Record<string, number>;
}

// Apply promotion request
export interface ApplyPromotionCodeRequest {
  cartItems: Array<{
    productVariantId: string;
    quantity: number;
    unitPrice: number;
  }>;
  promotionCode?: string;
  customerId?: string;
}

// Cart discount calculation response
export interface CartDiscountCalculationResponse {
  originalTotal: number;
  totalDiscount: number;
  finalTotal: number;
  appliedPromotions: Array<{
    promotionId: string;
    promotionCode: string;
    discountAmount: number;
  }>;
}

export const promotionService = {
  // ========================================
  // ADMIN ENDPOINTS
  // ========================================

  // Get all promotions (Admin)
  getAllPromotions: async () => {
    return axiosClient.get<any, ApiResponse<PromotionResponse[]>>(
      "/admin/promotions",
    );
  },

  // Get promotion by ID (Admin)
  getPromotionById: async (id: string) => {
    return axiosClient.get<any, ApiResponse<PromotionResponse>>(
      `/admin/promotions/${id}`,
    );
  },

  // Create new promotion (Admin)
  createPromotion: async (data: PromotionRequest) => {
    return axiosClient.post<any, ApiResponse<PromotionResponse>>(
      "/admin/promotions",
      data,
    );
  },

  // Update promotion (Admin)
  updatePromotion: async (id: string, data: PromotionRequest) => {
    return axiosClient.put<any, ApiResponse<PromotionResponse>>(
      `/admin/promotions/${id}`,
      data,
    );
  },

  // Delete promotion (Admin)
  deletePromotion: async (id: string) => {
    return axiosClient.delete<any, ApiResponse<void>>(
      `/admin/promotions/${id}`,
    );
  },

  // Toggle promotion status (Admin)
  togglePromotionStatus: async (id: string) => {
    return axiosClient.patch<any, ApiResponse<PromotionResponse>>(
      `/admin/promotions/${id}/toggle`,
    );
  },

  // Get promotion usage report (Admin)
  getPromotionUsageReport: async (id: string) => {
    return axiosClient.get<any, ApiResponse<PromotionUsageReportResponse>>(
      `/admin/promotions/${id}/report`,
    );
  },

  // Get top promotions by usage (Admin)
  getTopPromotions: async (limit: number = 10) => {
    return axiosClient.get<any, ApiResponse<PromotionUsageReportResponse[]>>(
      `/admin/promotions/top?limit=${limit}`,
    );
  },

  // ========================================
  // PUBLIC ENDPOINTS
  // ========================================

  // Get all active promotions (Public)
  getActivePromotions: async () => {
    return axiosClient.get<any, ApiResponse<PromotionResponse[]>>(
      "/promotions",
    );
  },

  // Get promotion detail (Public)
  getPromotionDetail: async (id: string) => {
    return axiosClient.get<any, ApiResponse<PromotionResponse>>(
      `/promotions/${id}`,
    );
  },

  // Calculate cart discount (auto-apply promotions)
  calculateCartDiscount: async (data: ApplyPromotionCodeRequest) => {
    return axiosClient.post<any, ApiResponse<CartDiscountCalculationResponse>>(
      "/promotions/calculate-discount",
      data,
    );
  },

  // Apply promotion code to cart
  applyPromotionCode: async (data: ApplyPromotionCodeRequest) => {
    return axiosClient.post<any, ApiResponse<CartDiscountCalculationResponse>>(
      "/promotions/apply-code",
      data,
    );
  },

  // Remove promotion code from cart
  removePromotionCode: async (data: ApplyPromotionCodeRequest) => {
    return axiosClient.post<any, ApiResponse<CartDiscountCalculationResponse>>(
      "/promotions/remove-code",
      data,
    );
  },

  // ========================================
  // EMPLOYEE ENDPOINTS
  // ========================================

  // Validate promotion code (for POS)
  validatePromotionCode: async (code: string) => {
    return axiosClient.post<any, ApiResponse<PromotionResponse>>(
      "/employee/promotions/validate",
      { code },
    );
  },

  // Get active promotions for employees
  getEmployeePromotions: async () => {
    return axiosClient.get<any, ApiResponse<PromotionResponse[]>>(
      "/employee/promotions",
    );
  },
};

export default promotionService;
