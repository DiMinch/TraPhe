import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";

// Revenue Report Types
export interface RevenueReportResponse {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueGrowth: number;
  breakdown: RevenueBreakdown;
  comparison: RevenueComparison;
  dailyRevenue: DailyRevenue[];
}

export interface RevenueBreakdown {
  onlineRevenue: number;
  offlineRevenue: number;
  cashPayments: number;
  transferPayments: number;
  codPayments: number;
}

export interface RevenueComparison {
  previousPeriod: number;
  growthPercentage: number;
  growthAmount: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

// Profit Report Types
export interface ProfitReportResponse {
  period: string;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
  products: ProductProfit[];
}

export interface ProductProfit {
  productId: string;
  productName: string;
  variantName: string;
  quantitySold: number;
  revenue: number;
  cost: number;
  profit: number;
  profitMargin: number;
}

// Inventory Report Types
export interface InventoryReportResponse {
  totalProducts: number;
  totalVariants: number;
  totalStockValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  items: InventoryReportItem[];
  alerts: InventoryAlert[];
}

export interface InventoryReportItem {
  id: string;
  sku: string;
  productName: string;
  variantName: string;
  quantityPhysical: number;
  quantityReserved: number;
  quantityAvailable: number;
  minThreshold: number;
  stockValue: number;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
}

export interface InventoryAlert {
  id: string;
  sku: string;
  productName: string;
  variantName: string;
  quantityAvailable: number;
  minThreshold: number;
  severity: "CRITICAL" | "WARNING";
}

// Top Products Report Types
export interface TopProductsReportResponse {
  period: string;
  sortBy: "quantity" | "revenue";
  products: TopProduct[];
}

export interface TopProduct {
  rank: number;
  productId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantitySold: number;
  revenue: number;
  orders: number;
  averagePrice: number;
}

// Export Request Types
export type ReportType = "REVENUE" | "PROFIT" | "TOP_PRODUCTS" | "INVENTORY";
export type ExportFormat = "CSV" | "PDF";

export interface ExportReportRequest {
  reportType: ReportType;
  format: ExportFormat;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  limit?: number;
}

export interface ExportInventoryRequest {
  format: ExportFormat;
  includeAlerts?: boolean;
  status?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
}

// Query Parameters
export interface ReportQueryParams {
  startDate?: string;
  endDate?: string;
  groupBy?: "DAY" | "WEEK" | "MONTH";
}

export interface TopProductsQueryParams extends ReportQueryParams {
  sortBy?: "QUANTITY" | "REVENUE";
  limit?: number;
}

export interface InventoryReportQueryParams {
  startDate?: string;
  endDate?: string;
  lowStockOnly?: boolean;
  fastMovingOnly?: boolean;
  categoryId?: string;
}

const BASE_URL = "/v1/reports";

export const reportService = {
  /**
   * Get revenue report with breakdown and comparison
   * @param params Query parameters for date range and groupBy
   */
  getRevenueReport: async (params?: ReportQueryParams) => {
    return axiosClient.get<any, ApiResponse<RevenueReportResponse>>(
      `${BASE_URL}/revenue`,
      { params },
    );
  },

  /**
   * Get profit report by products
   * @param params Query parameters for date range and groupBy
   */
  getProfitReport: async (params?: ReportQueryParams) => {
    return axiosClient.get<any, ApiResponse<ProfitReportResponse>>(
      `${BASE_URL}/profit`,
      { params },
    );
  },

  /**
   * Get inventory report with low stock alerts
   * @param params Query parameters for filtering inventory
   */
  getInventoryReport: async (params?: InventoryReportQueryParams) => {
    return axiosClient.get<any, ApiResponse<InventoryReportResponse>>(
      `${BASE_URL}/inventory`,
      { params },
    );
  },

  /**
   * Get top products report by quantity or revenue
   * @param params Query parameters including sortBy, limit, and date range
   */
  getTopProductsReport: async (params?: TopProductsQueryParams) => {
    return axiosClient.get<any, ApiResponse<TopProductsReportResponse>>(
      `${BASE_URL}/top-products`,
      { params },
    );
  },

  /**
   * Export report to CSV or PDF (Revenue, Profit, or Top Products)
   * @param data Export request with report type and format
   * @returns Blob data for file download
   */
  exportReport: async (data: ExportReportRequest) => {
    return axiosClient.post<any, Blob>(`${BASE_URL}/export`, data, {
      responseType: "blob",
      headers: {
        Accept: data.format === "PDF" ? "application/pdf" : "text/csv",
      },
    });
  },

  /**
   * Export inventory report to CSV or PDF
   * @param data Export request with format and filters
   * @returns Blob data for file download
   */
  exportInventoryReport: async (data: ExportInventoryRequest) => {
    return axiosClient.post<any, Blob>(`${BASE_URL}/export/inventory`, data, {
      responseType: "blob",
      headers: {
        Accept: data.format === "PDF" ? "application/pdf" : "text/csv",
      },
    });
  },

  /**
   * Helper function to download exported file
   * @param blob File blob data
   * @param filename Name for the downloaded file
   */
  downloadFile: (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Export and download revenue report
   */
  exportAndDownloadRevenue: async (
    format: ExportFormat,
    startDate?: string,
    endDate?: string,
  ) => {
    const blob = await reportService.exportReport({
      reportType: "REVENUE",
      format,
      startDate,
      endDate,
    });
    const filename = `revenue-report-${new Date().toISOString().split("T")[0]}.${format.toLowerCase()}`;
    reportService.downloadFile(blob, filename);
  },

  /**
   * Export and download profit report
   */
  exportAndDownloadProfit: async (
    format: ExportFormat,
    startDate?: string,
    endDate?: string,
  ) => {
    const blob = await reportService.exportReport({
      reportType: "PROFIT",
      format,
      startDate,
      endDate,
    });
    const filename = `profit-report-${new Date().toISOString().split("T")[0]}.${format.toLowerCase()}`;
    reportService.downloadFile(blob, filename);
  },

  /**
   * Export and download top products report
   */
  exportAndDownloadTopProducts: async (
    format: ExportFormat,
    sortBy?: "quantity" | "revenue",
    limit?: number,
    startDate?: string,
    endDate?: string,
  ) => {
    const blob = await reportService.exportReport({
      reportType: "TOP_PRODUCTS",
      format,
      sortBy,
      limit,
      startDate,
      endDate,
    });
    const filename = `top-products-report-${new Date().toISOString().split("T")[0]}.${format.toLowerCase()}`;
    reportService.downloadFile(blob, filename);
  },

  /**
   * Export and download inventory report
   */
  exportAndDownloadInventory: async (
    format: ExportFormat,
    lowStockOnly?: boolean,
    fastMovingOnly?: boolean,
  ) => {
    const blob = await reportService.exportInventoryReport({
      format,
      lowStockOnly,
      fastMovingOnly,
    });
    const filename = `inventory-report-${new Date().toISOString().split("T")[0]}.${format.toLowerCase()}`;
    reportService.downloadFile(blob, filename);
  },
};
