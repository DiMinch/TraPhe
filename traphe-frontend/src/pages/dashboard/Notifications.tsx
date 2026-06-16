import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Bell,
  Check,
  CheckCheck,
  Loader2,
  ShoppingBag,
  AlertTriangle,
  Info,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { notificationService } from "@/services/notification.service";
import { useNotification } from "@/contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { PageContainer, PageHeader, EmptyState } from "@/components/layout/PageLayout";
import type { NotificationItem } from "@/types/notification.types";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { markAsRead, markAllRead, unreadCount } = useNotification();
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering & Pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const size = 15;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getNotifications(page, size);
      
      if (response.data) {
        setNotifications(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      } else if (response.message) {
        setError(response.message);
      }
    } catch (err: any) {
      console.error("Failed to fetch notifications:", err);
      setError("Không thể tải danh sách thông báo. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const handleRefresh = () => {
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      toast.success("Đã đánh dấu đọc tất cả thông báo");
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      toast.error("Không thể đánh dấu đọc tất cả");
    }
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      toast.success("Đã đánh dấu đọc thông báo");
      // Update local state
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      toast.error("Thao tác thất bại");
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await markAsRead(item.id);
        // Update local state
        setNotifications(prev =>
          prev.map(n => (n.id === item.id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    }
    
    // Navigate based on entity type
    if (item.entityType === "ORDER" && item.entityId) {
      navigate(`/admin/orders/${item.entityId}`);
    } else if (item.entityType === "ORDER") {
      navigate("/admin/orders");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ORDER_NEW":
        return (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <ShoppingBag className="w-5 h-5" />
          </div>
        );
      case "ORDER_CONFIRMED":
      case "ORDER_COMPLETED":
        return (
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Check className="w-5 h-5" />
          </div>
        );
      case "ORDER_CANCELLED":
        return (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case "SYSTEM":
      default:
        return (
          <div className="p-3 rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
            <Info className="w-5 h-5" />
          </div>
        );
    }
  };

  // Filter notifications locally based on status and search query
  const filteredNotifications = notifications.filter(item => {
    // 1. Status Filter
    if (statusFilter === "UNREAD" && item.isRead) return false;
    if (statusFilter === "READ" && !item.isRead) return false;

    // 2. Search Term Filter
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query)
    );
  });

  return (
    <PageContainer>
      <PageHeader
        title="Thông báo hệ thống"
        subtitle="Quản lý và xem tất cả thông báo liên quan đến đơn hàng và hệ thống"
        onRefresh={handleRefresh}
        isLoading={loading}
      />

      <div className="grid grid-cols-1 gap-6">
        {/* Controls Card */}
        <Card className="shadow-sm border border-slate-200/60 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button
                variant={statusFilter === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("ALL")}
                className="rounded-xl px-4 text-xs font-semibold"
              >
                Tất cả
              </Button>
              <Button
                variant={statusFilter === "UNREAD" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("UNREAD")}
                className="rounded-xl px-4 text-xs font-semibold relative"
              >
                Chưa đọc
                {unreadCount > 0 && (
                  <Badge className="ml-1.5 bg-red-500 text-white rounded-full px-1.5 py-0 text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant={statusFilter === "READ" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("READ")}
                className="rounded-xl px-4 text-xs font-semibold"
              >
                Đã đọc
              </Button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm thông báo..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 border-slate-200 bg-white rounded-xl focus:ring-1 focus:ring-caramel focus:border-caramel text-xs shadow-none"
                />
              </div>

              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl h-9 px-3 flex items-center gap-1.5 font-semibold text-xs transition-all duration-200 shadow-sm shrink-0"
                >
                  <CheckCheck className="w-4 h-4 text-blue-600" />
                  Đọc tất cả
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden min-h-[400px]">
          <CardContent className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-foam to-purple-100 flex items-center justify-center animate-pulse">
                  <Loader2 className="w-8 h-8 animate-spin text-roast" />
                </div>
                <span className="ml-3 text-slate-600 mt-4 text-sm font-medium">
                  Đang tải danh sách thông báo...
                </span>
              </div>
            ) : error ? (
              <EmptyState
                icon={<Bell className="w-8 h-8 text-red-400" />}
                title="Lỗi tải thông báo"
                description={error}
              />
            ) : filteredNotifications.length === 0 ? (
              <EmptyState
                icon={<Bell className="w-8 h-8 text-slate-300" />}
                title="Không có thông báo nào"
                description={
                  searchTerm
                    ? "Không tìm thấy thông báo khớp với từ khóa tìm kiếm"
                    : "Bạn đã xem hết tất cả thông báo của mình"
                }
              />
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm cursor-pointer transition-all duration-250 relative ${
                      !item.isRead ? "bg-blue-50/10 border-l-4 border-l-blue-600" : "bg-white"
                    }`}
                  >
                    {/* Icon */}
                    <div className="shrink-0 mt-0.5">
                      {getNotificationIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1.5 min-w-0 pr-12">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-semibold truncate ${
                          !item.isRead ? "text-slate-900" : "text-slate-700"
                        }`}>
                          {item.title}
                        </h4>
                        {!item.isRead && (
                          <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {item.content}
                      </p>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold pt-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {item.createdAt
                            ? formatDistanceToNow(new Date(item.createdAt), {
                                addSuffix: true,
                                locale: vi,
                              })
                            : ""}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {!item.isRead && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                          className="h-8 w-8 hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-lg"
                          title="Đánh dấu đã đọc"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                <span className="text-xs text-slate-500 font-medium">
                  Hiển thị trang {page + 1} / {totalPages} (tổng số {totalElements} thông báo)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    className="border-slate-200 hover:bg-slate-50 rounded-xl h-8 px-3 text-xs font-semibold"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Trang trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="border-slate-200 hover:bg-slate-50 rounded-xl h-8 px-3 text-xs font-semibold"
                  >
                    Trang sau
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
