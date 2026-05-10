import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { notificationService } from "@/services/notification.service";
import type { NotificationItem } from "@/types/notification.types";
import { toast } from "sonner";
import { useNavigate } from "react-router";

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
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

  // Pagination
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const PAGE_SIZE = 20;

  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchBasicData = async () => {
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
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
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

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const init = async () => {
      await fetchBasicData();

      await fetchEventSource(notificationService.getStreamUrl(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
        },
        signal: controller.signal,
        onopen(res) {
          if (res.ok) return Promise.resolve();
          return Promise.resolve();
        },
        onmessage(event) {
          if (event.event === "ORDER_NEW") {
            try {
              const newNotification: NotificationItem = JSON.parse(event.data);
              setNotifications((prev) => [newNotification, ...prev]);
              setUnreadCount((prev) => prev + 1);

              toast.info("New Order Received", {
                description: newNotification.content,
                action: {
                  label: "View",
                  onClick: () =>
                    navigate(`/sales/orders/${newNotification.entityId}`),
                },
              });
            } catch (e) {
              console.error(e);
            }
          }
        },
        onerror(err) {
          /* retry */
        },
      });
    };

    init();

    return () => controller.abort();
  }, [token, navigate]);

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
