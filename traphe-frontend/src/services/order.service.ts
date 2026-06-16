import axiosClient from "@/lib/axios-client";
import type { ApiResponse, PageResponse } from "@/types/api.types";

// Order response from backend (enriched)
export interface OrderResponse {
  orderId: string;
  orderNumber: string;
  orderType: string;
  status: string;
  brewingStatus: string | null;
  paymentMethod: string | null;
  paymentStatus: string;
  // Pricing
  subtotal: number;
  totalDiscount: number;
  shippingFee: number | null;
  finalAmount: number;
  loyaltyPointsUsed: number;
  // Branch
  branchId: string | null;
  branchName: string | null;
  // Customer (nullable for POS anonymous)
  customerId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  // Timing
  estimatedReadyTime: string | null;
  createdAt: string;
  // Items
  items?: OrderItemDetail[];
  itemCount?: number;
  paymentUrl: string | null;
  merchandiseOrderId?: string | null;
}

export interface OrderItemDetail {
  id: string;
  menuItemName: string;
  sizeName: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes: string | null;
  options: string[];
  toppings: string[];
}

// Request interfaces
export interface OrderItemRequest {
  productVariantId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  notes?: string | null;
  options?: { optionGroupId: string; optionValueId: string }[];
  toppings?: { toppingId: string; quantity: number }[];
}

export interface CreateOrderRequest {
  customerId?: string;
  employeeId?: string;
  orderType: "OFFLINE" | "ONLINE_COD" | "ONLINE_TRANSFER";
  paymentMethod: "CASH" | "VNPAY" | "MOMO" | "QR";
  items: OrderItemRequest[];
  promotionIds?: string[];
  loyaltyPointsToUse?: number;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  addressId?: string;
  shippingAddress?: string;
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
    sort?: string;
    branchId?: string;
  }) => {
    const queryParams = {
      page: params?.page || 0,
      size: params?.size || 20,
      ...(params?.status &&
        params.status !== "all-status" && {
          status: params.status,
        }),
      ...(params?.orderType &&
        params.orderType !== "all-type" && {
          orderType: params.orderType,
        }),
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate }),
      ...(params?.sort && { sort: params.sort }),
      ...(params?.branchId && { branchId: params.branchId }),
    };

    return axiosClient.get<any, ApiResponse<PageResponse<OrderResponse>>>(
      "/orders",
      { params: queryParams },
    );
  },

  getFullOrders: async (params?: {
    page?: number;
    size?: number;
    status?: string;
    orderType?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
    branchId?: string;
  }) => {
    const queryParams = {
      page: params?.page || 0,
      size: params?.size || 100,
      ...(params?.status &&
        params.status !== "all-status" && {
          status: params.status,
        }),
      ...(params?.orderType &&
        params.orderType !== "all-type" && {
          orderType: params.orderType,
        }),
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate }),
      ...(params?.sort && { sort: params.sort }),
      ...(params?.branchId && { branchId: params.branchId }),
    };

    return axiosClient.get<any, ApiResponse<PageResponse<OrderResponse>>>(
      "/orders/full",
      { params: queryParams },
    );
  },

  // Get orders for a specific customer
  getCustomerOrders: async (customerId: string, params?: {
    page?: number;
    size?: number;
  }) => {
    return axiosClient.get<any, ApiResponse<PageResponse<OrderResponse>>>(
      `/orders/customer/${customerId}`,
      { params: { page: params?.page || 0, size: params?.size || 10 } }
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
  ) => {
    return axiosClient.put<any, ApiResponse<OrderResponse>>(
      `/orders/${id}/status`,
      { status }
    );
  },

  // Confirm order (shortcut)
  confirmOrder: async (id: string) => {
    return axiosClient.put<any, ApiResponse<OrderResponse>>(
      `/orders/${id}/status`,
      { status: "CONFIRMED" }
    );
  },

  // Cancel order
  cancelOrder: async (id: string) => {
    return axiosClient.delete<any, ApiResponse<OrderResponse>>(`/orders/${id}`);
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

  // Update brewing status
  updateBrewingStatus: async (
    id: string,
    status: "WAITING" | "BREWING" | "COMPLETED"
  ) => {
    return axiosClient.put<any, ApiResponse<void>>(
      `/pos/orders/${id}/brewing-status`,
      { status }
    );
  },

  // Process POS payment
  processPayment: async (orderId: string, paymentMethod: string) => {
    return axiosClient.post<any, ApiResponse<void>>(`/pos/payment`, {
      paymentMethod,
    }, {
      params: { orderId }
    });
  },
};
