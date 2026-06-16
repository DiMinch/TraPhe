import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";

// Revenue Report Types - matching backend structure
export interface RevenueReportResponse {
  totalRevenue: number;
  totalOrders: number;
  breakdown: RevenueByPeriod[];
  byOrderType: RevenueByType[];
  comparison: ComparisonData | null;
  byBranch?: RevenueByBranch[];
}

export interface RevenueByBranch {
  branchId: string;
  branchName: string;
  revenue: number;
  orderCount: number;
}

export interface RevenueByPeriod {
  period: string; // date string like "2026-01-12"
  revenue: number;
  orderCount: number;
}

export interface RevenueByType {
  orderType: string; // ONLINE_COD, OFFLINE, etc.
  revenue: number;
  orderCount: number;
}

export interface ComparisonData {
  previousRevenue: number;
  difference: number;
  percentageChange: number;
}

// Legacy interfaces for backwards compatibility
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

// Profit Report Types - matching backend structure
export interface ProfitReportResponse {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
  details: ProductProfit[];
}

export interface ProductProfit {
  productVariantId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantitySold: number;
  revenue: number;
  cost: number;
  grossProfit: number;
  profitMargin: number;
}

// Inventory Report Types - matching backend structure
export interface InventoryReportResponse {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  items: InventoryReportItem[];
  fastMovingItems: FastMovingItem[];
}

export interface InventoryReportItem {
  productVariantId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantityPhysical: number;
  quantityReserved: number;
  quantityAvailable: number;
  minThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export interface FastMovingItem {
  productVariantId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantitySold: number;
  daysSinceFirstSale: number;
  averageDailySales: number;
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

export interface StockForecastResponse {
  menuItemId: string;
  productName: string;
  averageDailySales: number;
  projected7DayDemand: number;
}

// Top Products Report Types - matching backend structure
export interface TopProductsReportResponse {
  topProducts: TopProduct[];
}

export interface TopProduct {
  rank: number;
  productVariantId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantitySold: number;
  totalRevenue: number;
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
  branchId?: string;
}

export interface ExportInventoryRequest {
  format: ExportFormat;
  lowStockOnly?: boolean;
  fastMovingOnly?: boolean;
  status?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  branchId?: string;
}

// Query Parameters
export interface ReportQueryParams {
  startDate?: string;
  endDate?: string;
  groupBy?: "DAY" | "WEEK" | "MONTH";
  branchId?: string;
}

export interface TopProductsQueryParams extends ReportQueryParams {
  sortBy?: "QUANTITY" | "REVENUE";
  limit?: number;
  branchId?: string;
}

export interface InventoryReportQueryParams {
  startDate?: string;
  endDate?: string;
  lowStockOnly?: boolean;
  fastMovingOnly?: boolean;
  categoryId?: string;
  branchId?: string;
}

const BASE_URL = "/reports";

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
   * Get stock forecast for next 7 days based on 30-day velocity
   */
  getStockForecast: async (params?: { branchId?: string }) => {
    return axiosClient.get<any, ApiResponse<StockForecastResponse[]>>(
      `${BASE_URL}/stock-forecast`,
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
    const { reportType, format, startDate, endDate, sortBy, limit, branchId } = data;

    // Build request body matching ReportFilterRequest
    const requestBody: Record<string, unknown> = {};
    if (startDate) requestBody.startDate = startDate;
    if (endDate) requestBody.endDate = endDate;
    if (sortBy) requestBody.sortBy = sortBy.toUpperCase();
    if (limit) requestBody.limit = limit;
    if (branchId) requestBody.branchId = branchId;

    const response = await axiosClient.post(`${BASE_URL}/export`, requestBody, {
      params: {
        type: reportType,
        format: format,
      },
      responseType: "blob",
      headers: {
        Accept: format === "PDF" ? "application/pdf" : "text/csv",
      },
    });
    return response as unknown as Blob;
  },

  /**
   * Export inventory report to CSV or PDF
   * @param data Export request with format and filters
   * @returns Blob data for file download
   */
  exportInventoryReport: async (data: ExportInventoryRequest) => {
    const { format, ...filterParams } = data;
    return axiosClient.post<any, Blob>(
      `${BASE_URL}/export/inventory`,
      filterParams,
      {
        params: {
          format: format,
        },
        responseType: "blob",
        headers: {
          Accept: format === "PDF" ? "application/pdf" : "text/csv",
        },
      },
    );
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
    branchId?: string,
  ) => {
    const blob = await reportService.exportReport({
      reportType: "REVENUE",
      format,
      startDate,
      endDate,
      branchId,
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
    branchId?: string,
  ) => {
    const blob = await reportService.exportReport({
      reportType: "PROFIT",
      format,
      startDate,
      endDate,
      branchId,
    });
    const filename = `profit-report-${new Date().toISOString().split("T")[0]}.${format.toLowerCase()}`;
    reportService.downloadFile(blob, filename);
  },

  /**
   * Export and download top products report
   */
  exportAndDownloadTopProducts: async (
    format: ExportFormat,
    sortBy?: "QUANTITY" | "REVENUE",
    limit?: number,
    startDate?: string,
    endDate?: string,
    branchId?: string,
  ) => {
    const blob = await reportService.exportReport({
      reportType: "TOP_PRODUCTS",
      format,
      sortBy: sortBy?.toLowerCase(),
      limit,
      startDate,
      endDate,
      branchId,
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
    branchId?: string,
  ) => {
    const blob = await reportService.exportInventoryReport({
      format,
      lowStockOnly,
      fastMovingOnly,
      branchId,
    });
    const filename = `inventory-report-${new Date().toISOString().split("T")[0]}.${format.toLowerCase()}`;
    reportService.downloadFile(blob, filename);
  },
};
