import axiosClient from "@/lib/axios-client";
import type { ApiResponse, PageResponse } from "@/types/api.types";

// Order response from backend
export interface OrderResponse {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
  } | null;
  guestName: string | null;
  guestPhone: string | null;
  orderType: string;
  status: string;
  paymentMethod: string;
  items: OrderItemResponse[];
  promotions: any[];
  subtotal: number;
  totalDiscount: number;
  finalAmount: number;
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
  createdAt: string;
}

export interface OrderItemResponse {
  id: string;
  productVariantId: string;
  sku: string;
  productName: string;
  variantName: string;
  productImage: string | null;
  serialNumber: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  warrantyExpireDate: string | null;
}

// Request interfaces
export interface OrderItemRequest {
  productVariantId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface CreateOrderRequest {
  customerId?: string;
  employeeId?: string;
  orderType: "OFFLINE" | "ONLINE_COD" | "ONLINE_TRANSFER";
  paymentMethod: "CASH" | "TRANSFER" | "COD";
  items: OrderItemRequest[];
  promotionIds?: string[];
  loyaltyPointsToUse?: number;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  addressId?: string;
}

export const orderService = {
  // Get all orders with filters
  getAllOrders: async (params?: {
    page?: number;
    size?: number;
    status?: string;
    orderType?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const queryParams = {
      page: params?.page || 0,
      size: params?.size || 100,
      ...(params?.status &&
        params.status !== "all-status" && {
          status: params.status.toUpperCase(),
        }),
      ...(params?.orderType &&
        params.orderType !== "all-type" && {
          orderType: params.orderType.toUpperCase().replace("-", "_"),
        }),
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate }),
    };

    return axiosClient.get<any, ApiResponse<PageResponse<OrderResponse>>>(
      "/orders",
      { params: queryParams },
    );
  },

  // Get order by ID
  getOrderById: async (id: string) => {
    return axiosClient.get<any, ApiResponse<OrderResponse>>(`/orders/${id}`);
  },

  // Create order
  createOrder: async (data: CreateOrderRequest) => {
    return axiosClient.post<any, ApiResponse<OrderResponse>>("/orders", data);
  },

  // Update order status
  updateOrderStatus: async (
    id: string,
    status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED",
    reason?: string,
  ) => {
    return axiosClient.put<any, ApiResponse<OrderResponse>>(
      `/orders/${id}/status`,
      null,
      {
        params: { status, reason },
      },
    );
  },

  // Confirm order (shortcut)
  confirmOrder: async (id: string) => {
    return axiosClient.put<any, ApiResponse<OrderResponse>>(
      `/orders/${id}/confirm`,
    );
  },

  // Cancel order (shortcut)
  cancelOrder: async (id: string, reason: string) => {
    return axiosClient.put<any, ApiResponse<OrderResponse>>(
      `/orders/${id}/cancel`,
      null,
      {
        params: { reason },
      },
    );
  },

  // Delete order
  deleteOrder: async (id: string) => {
    return axiosClient.delete<any, ApiResponse<void>>(`/orders/${id}`);
  },

  getMyOrders: async (params?: {
    page?: number;
    size?: number;
    sort?: string[];
  }) => {
    return axiosClient.get<any, ApiResponse<PageResponse<OrderResponse>>>(
      "/orders/user",
      {
        params: {
          page: params?.page || 0,
          size: params?.size || 20,
          sort: params?.sort || ["createdAt,desc"],
        },
      },
    );
  },
};
