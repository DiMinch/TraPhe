import axiosClient from "@/lib/axios-client";

export type AuditModule =
  | "INVOICE"
  | "PRODUCT"
  | "INVENTORY"
  | "SUPPLIER"
  | "STAFF"
  | "PROMOTION"
  | "CONFIG"
  | "WARRANTY"
  | "LOYALTY_POINTS"
  | "PURCHASE_ORDER"
  | "ORDER";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOCK"
  | "UNLOCK"
  | "EARN_POINTS"
  | "REDEEM_POINTS"
  | "ADJUST_POINTS"
  | "RESET_POINTS"
  | "RECEIVE_GOODS"
  | "CLOSE_PO";

export interface AuditLogResponse {
  id: string;
  actorId: string;
  actorName?: string;
  module: AuditModule;
  action: AuditAction;
  resourceId: string;
  resourceType: string;
  oldValue: string | null;
  newValue: string | null;
  status: "SUCCESS" | "FAILED";
  createdAt: string;
}

export interface AuditLogFilters {
  module?: AuditModule;
  action?: AuditAction;
  actorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface AuditLogPageResponse {
  content: AuditLogResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

const BASE_URL = "/admin/audit-logs";

export const auditLogService = {
  getAllAuditLogs: async (filters?: AuditLogFilters) => {
    try {
      const params = new URLSearchParams();
      if (filters?.module) params.append("module", filters.module);
      if (filters?.action) params.append("action", filters.action);
      if (filters?.actorId) params.append("actorId", filters.actorId);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);
      if (filters?.page !== undefined)
        params.append("page", String(filters.page));
      if (filters?.size !== undefined)
        params.append("size", String(filters.size));
      params.append("sort", "createdAt,desc");

      // The axios interceptor returns response.data directly
      const apiResponse = await axiosClient.get<
        unknown,
        { statusCode: number; message: string; data: AuditLogPageResponse }
      >(`${BASE_URL}${params.toString() ? `?${params.toString()}` : ""}`);

      // Return full page response for pagination support
      return {
        statusCode: 200,
        message: "Success",
        data: apiResponse.data?.content || [],
        pageData: apiResponse.data,
      };
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };
      const status = axiosError.response?.status || 500;

      // Don't log 403 or 500 errors to avoid console spam
      if (status !== 403 && status !== 500) {
        console.warn("Audit log endpoint error:", axiosError.message);
      }

      return {
        statusCode: status,
        message:
          status === 403
            ? "You don't have permission to view audit logs. Admin role required."
            : status === 500
              ? "Server error. Please try again later or contact support."
              : axiosError.response?.data?.message ||
                "Failed to fetch audit logs",
        data: [],
        pageData: null,
      };
    }
  },

  // Get audit logs filtered by module
  getAuditLogsByModule: async (module: AuditModule, page = 0, size = 20) => {
    return auditLogService.getAllAuditLogs({ module, page, size });
  },

  // Get audit logs filtered by actor
  getAuditLogsByUser: async (actorId: string, page = 0, size = 20) => {
    return auditLogService.getAllAuditLogs({ actorId, page, size });
  },
};
