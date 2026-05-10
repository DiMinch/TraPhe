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
  resourceId?: string;
}

export const auditLogService = {
  getAllAuditLogs: async (filters?: AuditLogFilters) => {
    try {
      const params = new URLSearchParams();
      if (filters?.module) params.append("module", filters.module);
      if (filters?.action) params.append("action", filters.action);
      if (filters?.actorId) params.append("actorId", filters.actorId);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);
      if (filters?.resourceId) params.append("resourceId", filters.resourceId);

      const response = await axiosClient.get<{
        statusCode: number;
        message: string;
        data: AuditLogResponse[];
      }>(`/audit-logs${params.toString() ? `?${params.toString()}` : ""}`);
      return response.data;
    } catch (error: any) {
      console.warn("Audit log endpoint not available:", error.message);
      return {
        statusCode: error.response?.status || 500,
        message:
          "Audit log feature is not yet available. Backend endpoint needs to be created.",
        data: [],
      };
    }
  },

  getAuditLogById: async (id: string) => {
    const response = await axiosClient.get<{
      statusCode: number;
      message: string;
      data: AuditLogResponse;
    }>(`/audit-logs/${id}`);
    return response.data;
  },

  getAuditLogsByModule: async (module: AuditModule) => {
    const response = await axiosClient.get<{
      statusCode: number;
      message: string;
      data: AuditLogResponse[];
    }>(`/audit-logs/module/${module}`);
    return response.data;
  },

  getAuditLogsByUser: async (userId: string) => {
    const response = await axiosClient.get<{
      statusCode: number;
      message: string;
      data: AuditLogResponse[];
    }>(`/audit-logs/user/${userId}`);
    return response.data;
  },

  getAuditLogsByResource: async (resourceId: string) => {
    const response = await axiosClient.get<{
      statusCode: number;
      message: string;
      data: AuditLogResponse[];
    }>(`/audit-logs/resource/${resourceId}`);
    return response.data;
  },
};
