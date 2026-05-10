import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  AddPartRequest,
  AddServiceRequest,
  CreateTicketRequest,
  ReassignTechnicianRequest,
  UpdateTicketRequest,
  WarrantyDashboardStats,
  WarrantyHistory,
  WarrantyTicket,
  WarrantyTicketDetail,
} from "@/types/warranty.types";
import type { WarrantyStatus } from "@/enums/warranty.enum";

export const warrantyService = {
  getAllTickets: async () => {
    return axiosClient.get<any, ApiResponse<WarrantyTicket[]>>(
      "/warranty-tickets/admin",
    );
  },

  getTicketDetail: async (id: string) => {
    return axiosClient.get<any, ApiResponse<WarrantyTicketDetail>>(
      `/warranty-tickets/admin/warranty-tickets/${id}`,
    );
  },

  searchAdminTickets: async (keyword: string) => {
    return axiosClient.get<any, ApiResponse<WarrantyTicket[]>>(
      "/warranty-tickets/admin/search",
      {
        params: { keyword },
      },
    );
  },

  getOverdueTickets: async () => {
    return axiosClient.get<any, ApiResponse<WarrantyTicket[]>>(
      "/warranty-tickets/admin/overdue",
    );
  },

  getDashboardStats: async () => {
    return axiosClient.get<any, ApiResponse<WarrantyDashboardStats>>(
      "/warranty-tickets/admin/dashboard",
    );
  },

  getTicketHistory: async (id: string) => {
    return axiosClient.get<any, ApiResponse<WarrantyHistory[]>>(
      `/warranty-tickets/admin/${id}/history`,
    );
  },

  createTicket: async (data: CreateTicketRequest) => {
    return axiosClient.post<any, ApiResponse<WarrantyTicket>>(
      "/warranty-tickets/admin",
      data,
    );
  },

  updateTicket: async (id: string, data: UpdateTicketRequest) => {
    return axiosClient.put<any, ApiResponse<WarrantyTicketDetail>>(
      `/warranty-tickets/admin/${id}`,
      data,
    );
  },

  deleteTicket: async (id: string) => {
    return axiosClient.delete<any, ApiResponse<null>>(
      `/warranty-tickets/admin/${id}`,
    );
  },

  reassignTechnician: async (id: string, data: ReassignTechnicianRequest) => {
    return axiosClient.put<any, ApiResponse<null>>(
      `/warranty-tickets/admin/${id}/technician`,
      data,
    );
  },

  startRepair: async (id: string) => {
    return axiosClient.post<any, ApiResponse<null>>(
      `/warranty-tickets/admin/${id}/start`,
    );
  },

  completeRepair: async (id: string) => {
    return axiosClient.post<any, ApiResponse<null>>(
      `/warranty-tickets/admin/${id}/complete`,
    );
  },

  returnDevice: async (id: string) => {
    return axiosClient.post<any, ApiResponse<null>>(
      `/warranty-tickets/admin/${id}/return`,
    );
  },

  cancelTicket: async (id: string, reason?: string) => {
    return axiosClient.post<any, ApiResponse<null>>(
      `/warranty-tickets/admin/${id}/cancel`,
      { reason },
    );
  },

  updateStatus: async (id: string, status: WarrantyStatus) => {
    return axiosClient.patch<any, ApiResponse<null>>(
      `/warranty-tickets/admin/${id}/status`,
      { status },
    );
  },

  checkStatus: async (id: string) => {
    return axiosClient.get<any, ApiResponse<{ status: WarrantyStatus }>>(
      `/warranty-tickets/admin/${id}/status`,
    );
  },

  addService: async (id: string, data: AddServiceRequest) => {
    return axiosClient.post<any, ApiResponse<null>>(
      `/warranty-tickets/admin/${id}/services`,
      data,
    );
  },

  removeService: async (ticketId: string, serviceId: string) => {
    return axiosClient.delete<any, ApiResponse<null>>(
      `/warranty-tickets/admin/${ticketId}/services/${serviceId}`,
    );
  },

  addPart: async (id: string, data: AddPartRequest) => {
    return axiosClient.post<any, ApiResponse<null>>(
      `/warranty-tickets/admin/${id}/parts`,
      data,
    );
  },

  removePart: async (ticketId: string, partId: string) => {
    return axiosClient.delete<any, ApiResponse<null>>(
      `/warranty-tickets/admin/${ticketId}/parts/${partId}`,
    );
  },

  searchWarrantyPublic: async (serialNumber: string) => {
    return axiosClient.post<any, ApiResponse<WarrantyTicket[]>>(
      "/warranty-tickets/search",
      { serialNumber },
    );
  },

  getMyTickets: async () => {
    return axiosClient.get<any, ApiResponse<WarrantyTicket[]>>(
      "/warranty-tickets/my-tickets",
    );
  },
};
