import { NotificationType } from "@/enums/notification.enum";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  entityType: string;
  entityId: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPageResponse {
  content: NotificationItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
