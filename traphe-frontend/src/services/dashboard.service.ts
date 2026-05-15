import axiosClient from "@/lib/axios-client";
import type { ApiResponse, PageResponse } from "@/types/api.types";
import type { OrderResponse } from "./order.service";
import type { WarrantyDashboardStats } from "@/types/warranty.types";

// Dashboard Stats Response
export interface DashboardStats {
  revenue: number;
  revenueGrowth: number;
  grossProfit: number;
  grossProfitGrowth: number;
}

// Top Selling Product
export interface TopSellingProduct {
  id: string;
  productName: string;
  totalOrders: number;
  totalSales: number;
}

// Top Selling Category
export interface TopSellingCategory {
  categoryId: string;
  categoryName: string;
  totalSales: number;
}

// Low Stock Item
export interface LowStockItem {
  id: string;
  sku: string;
  productName: string;
  variantName: string;
  quantityAvailable: number;
  minThreshold: number;
}

// Pending Order (simplified)
export interface PendingOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
}

// Warranty Ticket (simplified for dashboard)
export interface DashboardWarrantyTicket {
  id: string;
  ticketNumber: string;
  technicianName: string;
  status: string;
}

// Audit Log
export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  description: string;
  createdAt: string;
}

// Chart Data Point
export interface ChartDataPoint {
  month: string;
  revenue: number;
  grossProfit: number;
}

export const dashboardService = {
  // Get warranty dashboard stats (includes revenue data)
  getWarrantyDashboard: async () => {
    return axiosClient.get<unknown, ApiResponse<WarrantyDashboardStats>>(
      "/warranty-tickets/admin/dashboard",
    );
  },

  // Get all inventory items (for low stock)
  getLowStockItems: async () => {
    return axiosClient.get<unknown, ApiResponse<LowStockItem[]>>("/inventory");
  },

  // Get pending orders
  getPendingOrders: async () => {
    return axiosClient.get<unknown, ApiResponse<PageResponse<OrderResponse>>>(
      "/orders",
      {
        params: { page: 0, size: 10, status: "PENDING" },
      },
    );
  },

  // Get all orders for dashboard
  getRecentOrders: async () => {
    return axiosClient.get<unknown, ApiResponse<PageResponse<OrderResponse>>>(
      "/orders",
      {
        params: { page: 0, size: 100 },
      },
    );
  },

  // Get warranty tickets for dashboard
  getWarrantyTickets: async () => {
    return axiosClient.get<unknown, ApiResponse<unknown[]>>(
      "/warranty-tickets/admin",
    );
  },
};
