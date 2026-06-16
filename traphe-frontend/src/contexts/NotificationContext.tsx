import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
  useCallback,
} from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { notificationService } from "@/services/notification.service";
import type { NotificationItem } from "@/types/notification.types";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { authService } from "@/services/auth.service";

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  isAdmin: boolean;
  loadMore: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const PAGE_SIZE = 20;

  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if user has admin or staff dashboard role
  const checkAdminRole = useCallback(() => {
    const user = authService.getCurrentUser();
    if (user && user.roles) {
      const hasDashboardRole = user.roles.some(
        (role: string) =>
          role === "ROLE_ADMIN" ||
          role === "ADMIN" ||
          role === "ROLE_BRANCH_MANAGER" ||
          role === "BRANCH_MANAGER" ||
          role === "ROLE_CASHIER" ||
          role === "CASHIER" ||
          role === "ROLE_BARISTA" ||
          role === "BARISTA",
      );
      setIsAdmin(hasDashboardRole);
      return hasDashboardRole;
    }
    return false;
  }, []);

  const fetchBasicData = async () => {
    // Only fetch if user has dashboard role
    if (!checkAdminRole()) {
      return;
    }

    setIsLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        notificationService.getNotifications(0, PAGE_SIZE),
        notificationService.getUnreadCount(),
      ]);

      if (listRes.statusCode === 200) {
        setNotifications(listRes.data.content);
        setHasMore(!listRes.data.last);
        setPage(0);
      }
      if (countRes.statusCode === 200) {
        setUnreadCount(countRes.data.unreadCount);
      }
    } catch (error: any) {
      // Silently handle 403 (forbidden) and 500 (server error) - don't spam console
      const status = error.response?.status;
      if (status !== 403 && status !== 500) {
        console.error("Failed to load notifications", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (isLoadingMore || !hasMore || !isAdmin) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await notificationService.getNotifications(
        nextPage,
        PAGE_SIZE,
      );
      if (res.statusCode === 200) {
        setNotifications((prev) => [...prev, ...res.data.content]);
        setPage(nextPage);
        setHasMore(!res.data.last);
      }
    } catch (error) {
      console.error("Failed to load more", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    // Check admin role first
    const hasAdminRole = checkAdminRole();
    if (!hasAdminRole) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const init = async () => {
      await fetchBasicData();

      try {
        await fetchEventSource(notificationService.getStreamUrl(), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
          signal: controller.signal,
          async onopen(res) {
            if (res.ok && res.status === 200) {
              return; // everything's good
            } else if (
              res.status >= 400 &&
              res.status < 500 &&
              res.status !== 429
            ) {
              console.error("[SSE] Client error:", res.status);
              throw new Error(`SSE error: ${res.status}`);
            }
          },
          onmessage(event) {
            // Handle "connected" event
            if (event.event === "connected") return;

            try {
              const newNotification: NotificationItem = JSON.parse(
                event.data,
              );

              setNotifications((prev) => [newNotification, ...prev]);
              setUnreadCount((prev) => prev + 1);

              let toastTitle = "Thông báo mới";
              let actionLabel = "Xem";
              let targetUrl = "/admin/notifications";

              if (event.event === "ORDER_NEW") {
                toastTitle = "Đơn hàng mới";
                actionLabel = "Xem đơn";
                targetUrl = "/admin/orders";
              } else if (event.event === "ORDER_CONFIRMED") {
                toastTitle = "Đơn hàng được xác nhận";
                actionLabel = "Xem đơn";
                targetUrl = "/admin/orders";
              } else if (event.event === "ORDER_COMPLETED") {
                toastTitle = "Đơn hàng hoàn thành";
                actionLabel = "Xem đơn";
                targetUrl = "/admin/orders";
              } else if (event.event === "ORDER_CANCELLED") {
                toastTitle = "Đơn hàng bị hủy";
                actionLabel = "Xem đơn";
                targetUrl = "/admin/orders";
              } else if (event.event === "LOW_STOCK") {
                toastTitle = "Cảnh báo tồn kho thấp";
                actionLabel = "Xem kho";
                targetUrl = "/admin/stock/all";
              }

              toast.info(toastTitle, {
                description: newNotification.content,
                action: {
                  label: actionLabel,
                  onClick: () => navigate(targetUrl),
                },
              });
            } catch (e) {
              console.error("[SSE] Error parsing notification:", e);
            }
          },
          onerror(err) {
            // Don't retry on abort
            if (controller.signal.aborted) {
              throw err;
            }
            // Otherwise, fetchEventSource will automatically retry
          },
          openWhenHidden: true,
        });
      } catch (error: any) {
        if (error?.response?.status !== 403) {
          console.error("[SSE] Connection error:", error);
        }
      }
    };

    init();

    return () => controller.abort();
  }, [token, navigate, checkAdminRole]);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        hasMore,
        isLoadingMore,
        loadMore,
        isAdmin,
        fetchNotifications: fetchBasicData,
        markAsRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error("useNotification must be used within NotificationProvider");
  return context;
};
