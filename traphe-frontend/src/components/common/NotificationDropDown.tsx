import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotification } from "@/contexts/NotificationContext";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router";

export default function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    hasMore,
    loadMore,
    isLoadingMore,
  } = useNotification();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.entityType === "ORDER" && notification.entityId) {
      navigate(`/sales/orders/${notification.entityId}`);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-500 hover:text-black cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white animate-in zoom-in duration-300">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0 mr-4 bg-white shadow-lg border border-gray-200"
        align="end"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead()}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3 h-3" /> Mark all read
            </button>
          )}
        </div>

        <ScrollArea className="h-[350px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
              <Bell className="w-10 h-10 mb-2 opacity-10" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={cn(
                    "flex flex-col items-start gap-1 p-4 text-left w-full hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer",
                    !item.isRead ? "bg-blue-50/30" : "bg-white",
                  )}
                >
                  <div className="flex items-start justify-between w-full mb-1">
                    <span
                      className={cn(
                        "text-sm font-medium line-clamp-1",
                        !item.isRead ? "text-blue-700" : "text-gray-900",
                      )}
                    >
                      {item.title}
                    </span>
                    {!item.isRead && (
                      <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                  <span className="text-[10px] text-gray-400 mt-2 block">
                    {item.createdAt
                      ? formatDistanceToNow(new Date(item.createdAt), {
                          addSuffix: true,
                        })
                      : ""}
                  </span>
                </button>
              ))}

              {hasMore && (
                <div className="p-2 text-center bg-gray-50/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      loadMore();
                    }}
                    disabled={isLoadingMore}
                    className="w-full text-xs text-blue-600 h-8 hover:bg-blue-50 cursor-pointer"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />{" "}
                        Loading...
                      </>
                    ) : (
                      "Load more notifications"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t border-gray-100 bg-gray-50/50">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs h-8 text-gray-600 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-200 shadow-sm cursor-pointer"
          >
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
