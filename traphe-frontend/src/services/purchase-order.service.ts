import axiosClient from "@/lib/axios-client";
import type { ApiResponse, PageResponse } from "@/types/api.types";

export interface PurchaseOrderResponse {
  id: string;
  poNumber: string;
  supplier: {
    id: string;
    name: string;
    contactName: string;
    phone: string;
    email: string;
  };
  status: "DRAFT" | "RECEIVED" | "CLOSED";
  totalAmount: number;
  expectedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  createdAt: string;
  updatedAt: string;
  items: PurchaseOrderItemResponse[];
  createdBy: string | null;
  updatedBy: string | null;
}

export interface PurchaseOrderItemResponse {
  id: string;
  itemType: "PRODUCT" | "PART_COMPONENT";
  productVariant: {
    id: string;
    sku: string;
    variantName: string;
    productName: string;
    purchasePriceAvg: number;
    sellingPrice: number;
  } | null;
  partComponent: {
    id: string;
    partNumber: string;
    partName: string;
    partType: string;
    purchasePrice: number;
    sellingPrice: number;
  } | null;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: number;
  subtotal: number;
  warrantyPeriod: number;
  referenceTicketId: string | null;
}

// Request interfaces for creating/updating
export interface PurchaseOrderItemRequest {
  productVariantId?: string;
  partComponentId?: string;
  quantityOrdered: number;
  unitPrice: number;
  warrantyPeriod?: number;
  referenceTicketId?: string;
}

export interface PurchaseOrderRequest {
  supplierId: string;
  expectedDeliveryDate?: string;
  items: PurchaseOrderItemRequest[];
}

export interface ReceiveGoodsItemRequest {
  productVariantId?: string;
  partComponentId?: string;
  quantityReceived: number;
  serialNumbers?: string[]; // Required for PRODUCT, not needed for PART_COMPONENT
}

export interface ReceiveGoodsRequest {
  actualDeliveryDate?: string;
  items: ReceiveGoodsItemRequest[];
}

export const purchaseOrderService = {
  // Get all purchase orders
  getAllPurchaseOrders: async (params?: {
    supplierId?: string;
    status?: string;
    page?: number;
    size?: number;
  }) => {
    const queryParams: Record<string, string | number> = {
      size: params?.size || 100, // Default to large page size
      page: params?.page || 0,
    };

    if (params?.supplierId && params.supplierId !== "all-suppliers") {
      queryParams.supplierId = params.supplierId;
    }
    if (params?.status && params.status !== "all-status") {
      queryParams.status = params.status.toUpperCase();
    }

    return axiosClient.get<
      unknown,
      ApiResponse<PageResponse<PurchaseOrderResponse>>
    >("/purchase-orders", { params: queryParams });
  },

  // Get purchase order by ID
  getPurchaseOrderById: async (id: string) => {
    return axiosClient.get<any, ApiResponse<PurchaseOrderResponse>>(
      `/purchase-orders/${id}`,
    );
  },

  // Get purchase orders by supplier ID
  getPurchaseOrdersBySupplierId: async (supplierId: string) => {
    return axiosClient.get<any, ApiResponse<PurchaseOrderResponse[]>>(
      `/purchase-orders/supplier/${supplierId}`,
    );
  },

  // Create purchase order (DRAFT status)
  createPurchaseOrder: async (data: PurchaseOrderRequest) => {
    return axiosClient.post<any, ApiResponse<PurchaseOrderResponse>>(
      "/purchase-orders",
      data,
    );
  },

  // Receive goods (Stock In) - changes status to RECEIVED
  receiveGoods: async (id: string, data: ReceiveGoodsRequest) => {
    return axiosClient.post<any, ApiResponse<PurchaseOrderResponse>>(
      `/purchase-orders/${id}/receive`,
      data,
    );
  },

  // Close purchase order (RECEIVED -> CLOSED)
  closePurchaseOrder: async (id: string) => {
    return axiosClient.put<any, ApiResponse<PurchaseOrderResponse>>(
      `/purchase-orders/${id}/close`,
    );
  },

  // Delete purchase order (only DRAFT status)
  deletePurchaseOrder: async (id: string) => {
    return axiosClient.delete<any, ApiResponse<void>>(`/purchase-orders/${id}`);
  },
};
