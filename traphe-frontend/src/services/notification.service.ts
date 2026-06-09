import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  NotificationPageResponse,
  UnreadCountResponse,
} from "@/types/notification.types";

const BASE_URL = "/admin/notifications";

export const notificationService = {
  getNotifications: async (page = 0, size = 20) => {
    return axiosClient.get<any, ApiResponse<NotificationPageResponse>>(
      `${BASE_URL}`,
      {
        params: { page, size, sort: "createdAt,desc" },
      },
    );
  },

  getUnreadCount: async () => {
    return axiosClient.get<any, ApiResponse<UnreadCountResponse>>(
      `${BASE_URL}/unread-count`,
    );
  },

  markAsRead: async (id: string) => {
    return axiosClient.patch<any, ApiResponse<null>>(`${BASE_URL}/${id}/read`);
  },

  markAllRead: async () => {
    return axiosClient.patch<any, ApiResponse<null>>(
      `${BASE_URL}/mark-all-read`,
    );
  },

  getStreamUrl: () => {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
    return `${apiBase}${BASE_URL}/stream`;
  },
};
