import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Clock,
  Coffee,
  Eye,
  Search,
  Volume2,
  VolumeX,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  X,
  Check,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { orderService, type OrderResponse } from "@/services/order.service";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageLayout";
import { authService } from "@/services/auth.service";
import { UserRole } from "@/enums/roles.enum";
import axiosClient from "@/lib/axios-client";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "WAITING" | "BREWING">("ALL");
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Modal for quick details
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // For sound notification tracking
  const previousOrderIdsRef = useRef<string[]>([]);
  
  // Real-time counter tick for elapsed time display
  const [, setTick] = useState(0);

  // Play alert sound for new orders
  const playAlertSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // Play a nice double-beep sound
      const playBeep = (time: number, freq: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + duration);
      };

      const now = audioCtx.currentTime;
      playBeep(now, 587.33, 0.12); // D5
      playBeep(now + 0.15, 880, 0.2); // A5
    } catch (e) {
      console.warn("Failed to play notification sound:", e);
    }
  }, []);

  // Fetch orders from backend
  const fetchQueueOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      // Fetch the last 100 orders
      const response = await orderService.getFullOrders({
        page: 0,
        size: 100,
        sort: "createdAt,asc", // Chronological oldest first
      });

      const allOrders = response.data?.content || [];

      // Filter for active brewing queue items
      const queueItems = allOrders.filter((o) => {
        // 1. Order must be active: status PENDING or CONFIRMED
        const isNotFinished = o.status === "PENDING" || o.status === "CONFIRMED";
        if (!isNotFinished) return false;

        // 2. Brewing status must not be completed
        const isBrewingFinished = o.brewingStatus === "COMPLETED";
        if (isBrewingFinished) return false;

        // 3. Must be drink orders
        const isDrink = o.orderType === "DRINK_PICKUP" || o.orderType === "DRINK_DELIVERY";
        if (!isDrink) return false;

        // 4. Payment verification:
        // Local POS orders (starting with POS-) are in the queue once created.
        // Online orders (starting with TP-) must be paid (COMPLETED) OR pay-later method (COD/CASH).
        const isPOS = o.orderNumber.startsWith("POS-");
        const isPaid = o.paymentStatus === "COMPLETED";
        const isPayLater = o.paymentMethod === "COD" || o.paymentMethod === "CASH";

        if (!isPOS && !isPaid && !isPayLater) return false;

        return true;
      });

      // Sort by creation date ascending (oldest first)
      queueItems.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Check if new orders arrived in the queue to trigger sound
      const currentIds = queueItems.map((o) => o.orderId);
      if (previousOrderIdsRef.current.length > 0) {
        const hasNewOrder = currentIds.some((id) => !previousOrderIdsRef.current.includes(id));
        if (hasNewOrder && soundEnabled) {
          playAlertSound();
          toast.info("Đơn hàng mới đã được thêm vào hàng đợi pha chế!", {
            icon: "☕",
          });
        }
      }
      
      previousOrderIdsRef.current = currentIds;
      setOrders(queueItems);
    } catch (err: unknown) {
      console.error("Error loading brewing queue:", err);
      setError("Không thể tải danh sách hàng đợi. Vui lòng thử lại.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [soundEnabled, playAlertSound]);

  // Initial fetch on mount
  useEffect(() => {
    fetchQueueOrders();
  }, [fetchQueueOrders]);

  // Set up auto-refresh every 10 seconds and tick timer every second
  useEffect(() => {
    const refreshTimer = setInterval(() => {
      fetchQueueOrders(true);
    }, 10000);

    const tickTimer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => {
      clearInterval(refreshTimer);
      clearInterval(tickTimer);
    };
  }, [fetchQueueOrders]);

  // Calculate elapsed time from creation
  const getElapsedTime = (createdAt: string) => {
    const createdTime = new Date(createdAt).getTime();
    const diffMs = Date.now() - createdTime;
    const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
    
    const hrs = Math.floor(diffSecs / 3600);
    const mins = Math.floor((diffSecs % 3600) / 60);
    const secs = diffSecs % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Determine elapsed time text color depending on urgency
  const getElapsedColor = (createdAt: string) => {
    const createdTime = new Date(createdAt).getTime();
    const diffMins = (Date.now() - createdTime) / 60000;
    if (diffMins > 15) return "text-red-500 font-bold animate-pulse";
    if (diffMins > 8) return "text-amber-500 font-semibold";
    return "text-smoke";
  };

  // Filter orders based on active tab and search query
  const filteredOrders = orders.filter((o) => {
    // 1. Tab filter
    if (activeTab === "WAITING" && o.brewingStatus === "BREWING") return false;
    if (activeTab === "BREWING" && o.brewingStatus !== "BREWING") return false;

    // 2. Search query filter (order number, customer name, customer phone)
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(search) ||
      (o.customerName && o.customerName.toLowerCase().includes(search)) ||
      (o.customerPhone && o.customerPhone.includes(search))
    );
  });

  // Calculate stats
  const waitingCount = orders.filter((o) => o.brewingStatus !== "BREWING").length;
  const brewingCount = orders.filter((o) => o.brewingStatus === "BREWING").length;

  const handleOpenDetail = async (order: any) => {
    try {
      setLoading(true);
      const res = await orderService.getOrderById(order.orderId);
      setSelectedOrder(res.data || order);
      setIsDetailOpen(true);
    } catch (e) {
      toast.error("Không thể tải chi tiết đơn hàng.");
      // Fallback
      setSelectedOrder(order);
      setIsDetailOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedOrder) return;
    try {
      await orderService.processPayment(selectedOrder.orderId, selectedOrder.paymentMethod || "CASH");
      toast.success("Xác nhận thanh toán thành công!");
      
      const updatedOrder = { ...selectedOrder, paymentStatus: "COMPLETED" };
      setSelectedOrder(updatedOrder);
      setOrders(orders.map(o => o.orderId === selectedOrder.orderId ? updatedOrder : o));
    } catch (error) {
      console.error("Lỗi khi xác nhận thanh toán:", error);
      toast.error("Lỗi khi xác nhận thanh toán.");
    }
  };

  // ==================== ADMIN & BRANCH MANAGER CODE ====================
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roles?.includes(UserRole.ADMIN);
  const isBranchManager = currentUser?.roles?.includes(UserRole.BRANCH_MANAGER) && !isAdmin;
  const isAdminOrManager = isAdmin || isBranchManager;

  // Admin Table State
  const [adminOrders, setAdminOrders] = useState<OrderResponse[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminStatus, setAdminStatus] = useState("all-status");
  const [adminChannel, setAdminChannel] = useState("all-channel"); // all-channel, POS, ONLINE
  const [adminType, setAdminType] = useState("all-type"); // all-type, DRINK_PICKUP, DRINK_DELIVERY, MERCHANDISE
  const [adminBranch, setAdminBranch] = useState("all-branch");
  const [adminStartDate, setAdminStartDate] = useState("");
  const [adminEndDate, setAdminEndDate] = useState("");
  const [adminPage, setAdminPage] = useState(1);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const adminItemsPerPage = 10;

  const fetchAdminOrders = useCallback(async () => {
    setAdminLoading(true);
    try {
      const params: any = {
        page: 0,
        size: 200, // Fetch top 200 orders for local search & paging
        sort: "createdAt,desc", // Newest first
      };

      if (adminStatus !== "all-status") {
        params.status = adminStatus;
      }

      if (isBranchManager && currentUser?.branchId) {
        params.branchId = currentUser.branchId;
      } else if (adminBranch !== "all-branch") {
        params.branchId = adminBranch;
      }

      const response = await orderService.getAllOrders(params);
      setAdminOrders(response.data?.content || []);
    } catch (err) {
      console.error("Error loading admin orders:", err);
      toast.error("Không thể tải danh sách đơn hàng.");
    } finally {
      setAdminLoading(false);
    }
  }, [adminStatus, adminBranch, isBranchManager, currentUser?.branchId]);

  useEffect(() => {
    if (isAdminOrManager) {
      fetchAdminOrders();
    }
  }, [fetchAdminOrders, isAdminOrManager]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        if (isBranchManager && currentUser?.branchId) {
          setBranches([{ id: currentUser.branchId, name: "Chi nhánh của tôi" }]);
          return;
        }
        const res = await axiosClient.get<unknown, any>("/branches");
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.content || [];
        setBranches(list.map((b: any) => ({ id: b.id, name: b.name })));
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    if (isAdminOrManager) {
      fetchBranches();
    }
  }, [isAdminOrManager, isBranchManager, currentUser?.branchId]);

  // Reset page on filter changes
  useEffect(() => {
    setAdminPage(1);
  }, [adminSearch, adminStatus, adminChannel, adminType, adminBranch, adminStartDate, adminEndDate]);

  const handleUpdateStatus = async (orderId: string, newStatus: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED") => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success("Cập nhật trạng thái đơn hàng thành công!");
      fetchAdminOrders();
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error: any) {
      console.error("Lỗi cập nhật trạng thái đơn hàng:", error);
      toast.error(error.response?.data?.message || "Cập nhật trạng thái thất bại.");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await orderService.cancelOrder(orderId);
      toast.success("Hủy đơn hàng thành công!");
      fetchAdminOrders();
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder({ ...selectedOrder, status: "CANCELLED" });
      }
    } catch (error: any) {
      console.error("Lỗi hủy đơn hàng:", error);
      toast.error(error.response?.data?.message || "Hủy đơn hàng thất bại.");
    }
  };

  const getFilteredAdminOrders = () => {
    let result = [...adminOrders];

    if (adminSearch.trim()) {
      const search = adminSearch.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(search) ||
          o.customerName?.toLowerCase().includes(search) ||
          o.customerPhone?.includes(search)
      );
    }

    if (adminChannel !== "all-channel") {
      if (adminChannel === "POS") {
        result = result.filter((o) => o.orderNumber?.startsWith("POS-"));
      } else if (adminChannel === "ONLINE") {
        result = result.filter((o) => o.orderNumber?.startsWith("TP-"));
      }
    }

    if (adminType !== "all-type") {
      result = result.filter((o) => o.orderType === adminType);
    }

    if (adminStartDate) {
      const start = new Date(adminStartDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter((o) => new Date(o.createdAt) >= start);
    }
    if (adminEndDate) {
      const end = new Date(adminEndDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((o) => new Date(o.createdAt) <= end);
    }

    return result;
  };

  const handleExportCSV = () => {
    const filtered = getFilteredAdminOrders();
    if (filtered.length === 0) {
      toast.warning("Không có dữ liệu để xuất.");
      return;
    }

    const headers = [
      "Mã đơn",
      "Khách hàng",
      "Số điện thoại",
      "Kênh",
      "Tổng tiền",
      "Phương thức thanh toán",
      "Trạng thái thanh toán",
      "Trạng thái đơn hàng",
      "Trạng thái pha chế",
      "Chi nhánh",
      "Ngày đặt"
    ];

    const rows = filtered.map((o) => [
      o.orderNumber,
      o.customerName || "Khách mua lẻ",
      o.customerPhone || "",
      o.orderNumber.startsWith("POS-") ? "POS" : "Online",
      o.finalAmount,
      o.paymentMethod || "CASH",
      o.paymentStatus === "COMPLETED" ? "Đã thanh toán" : "Chưa thanh toán",
      o.status,
      o.brewingStatus || "N/A",
      o.branchName || "",
      new Date(o.createdAt).toLocaleString("vi-VN")
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Danh_sach_don_hang_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDetailDialog = () => {
    if (!selectedOrder) return null;
    return (
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md bg-white border border-admin-border rounded-2xl p-0 overflow-hidden shadow-2xl">
          <>
            {/* Modal Header */}
            <div className="p-5 border-b border-admin-border bg-foam/40">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-lg font-serif text-espresso font-bold">
                      Đơn hàng #{selectedOrder.orderNumber}
                    </DialogTitle>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-2 py-0.5 rounded-full border-0 font-medium ${
                        selectedOrder.orderNumber.startsWith("TP-")
                          ? "bg-sky-50 text-sky-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {selectedOrder.orderNumber.startsWith("TP-") ? "Online" : "POS"}
                    </Badge>
                  </div>
                  <DialogDescription className="text-xs text-smoke mt-1">
                    Đặt lúc {new Date(selectedOrder.createdAt).toLocaleString("en-GB")}
                  </DialogDescription>
                </div>
                
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    selectedOrder.brewingStatus === "BREWING"
                      ? "bg-orange-50 text-orange-700 border border-orange-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}>
                    {selectedOrder.brewingStatus === "BREWING" ? "Đang pha chế" : "Chờ pha chế"}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Customer Information */}
              <div>
                <h4 className="text-xs font-bold text-smoke uppercase tracking-wider mb-2">Khách hàng</h4>
                <div className="bg-admin-bg p-3 rounded-xl border border-admin-border">
                  <p className="text-sm font-semibold text-espresso">
                    {selectedOrder.customerName || "Khách mua lẻ"}
                  </p>
                  <p className="text-xs text-smoke mt-1">
                    SĐT: {selectedOrder.customerPhone || "N/A"}
                  </p>
                  {selectedOrder.orderType && (
                    <p className="text-xs text-smoke mt-1">
                      Hình thức: {selectedOrder.orderType === "DRINK_PICKUP" ? "Lấy tại quầy (Pick-up)" : "Giao hàng (Delivery)"}
                    </p>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold text-smoke uppercase tracking-wider mb-2">Sản phẩm F&B</h4>
                <div className="divide-y divide-admin-border">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-slate-800">
                          {item.menuItemName}
                          {item.sizeName && (
                            <span className="text-smoke text-xs font-normal ml-1">
                              (Size {item.sizeName})
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-espresso font-bold">
                          x{item.quantity}
                        </span>
                      </div>

                      {/* Options details */}
                      {item.options && item.options.length > 0 && (
                        <div className="text-xs text-smoke pl-3 mt-1 space-y-0.5">
                          {item.options.map((opt: string, oIdx: number) => (
                            <p key={oIdx}>• {opt}</p>
                          ))}
                        </div>
                      )}

                      {/* Toppings details */}
                      {item.toppings && item.toppings.length > 0 && (
                        <div className="text-xs text-caramel pl-3 mt-1 space-y-0.5 font-medium">
                          {item.toppings.map((top: string, tIdx: number) => (
                            <p key={tIdx}>+ {top}</p>
                          ))}
                        </div>
                      )}

                      {/* Item Note */}
                      {item.notes && (
                        <div className="mt-1.5 bg-amber-50 border border-amber-100 rounded-lg p-2 text-xs text-amber-800 italic">
                          Ghi chú: {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment summary */}
              <div>
                <h4 className="text-xs font-bold text-smoke uppercase tracking-wider mb-2">Thanh toán</h4>
                <div className="bg-admin-bg p-3 rounded-xl border border-admin-border flex justify-between items-center">
                  <div>
                    <p className="text-xs text-smoke">Phương thức</p>
                    <p className="text-sm font-semibold text-espresso mt-0.5">
                      {selectedOrder.paymentMethod || "CASH"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-smoke">Trạng thái</p>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                      selectedOrder.paymentStatus === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {selectedOrder.paymentStatus === "COMPLETED" ? "Đã thanh toán" : "Chưa thanh toán"}
                    </span>
                  </div>
                  <div className="text-right border-l border-admin-border pl-4">
                    <p className="text-xs text-smoke">Tổng tiền</p>
                    <p className="text-sm font-bold text-caramel mt-0.5">
                      {selectedOrder.finalAmount?.toLocaleString() || 0}đ
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <DialogFooter className="p-4 border-t border-admin-border bg-admin-bg flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDetailOpen(false)}
                className="w-full sm:w-auto border-admin-border bg-white hover:bg-foam rounded-xl h-10 px-4 text-xs font-semibold"
              >
                Đóng
              </Button>
              
              {isAdminOrManager ? (
                <>
                  {selectedOrder.status === "PENDING" && (
                    <Button
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.orderId, "CONFIRMED");
                        setIsDetailOpen(false);
                      }}
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4 text-xs font-semibold shadow-sm flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Duyệt đơn
                    </Button>
                  )}
                  
                  {selectedOrder.status === "CONFIRMED" && (
                    <Button
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.orderId, "COMPLETED");
                        setIsDetailOpen(false);
                      }}
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-4 text-xs font-semibold shadow-sm flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Hoàn thành
                    </Button>
                  )}

                  {selectedOrder.status !== "COMPLETED" && selectedOrder.status !== "CANCELLED" && (
                    <Button
                      onClick={() => {
                        handleCancelOrder(selectedOrder.orderId);
                        setIsDetailOpen(false);
                      }}
                      className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-10 px-4 text-xs font-semibold shadow-sm flex items-center justify-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Hủy đơn
                    </Button>
                  )}
                </>
              ) : (
                selectedOrder.paymentStatus !== "COMPLETED" && (
                  <Button
                    onClick={handleConfirmPayment}
                    className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-10 px-4 text-xs font-semibold shadow-sm"
                  >
                    Xác nhận đã thu tiền
                  </Button>
                )
              )}

              <Button
                onClick={() => {
                  setIsDetailOpen(false);
                  navigate(`/admin/orders/${selectedOrder.orderId}`);
                }}
                className="w-full sm:w-auto bg-espresso hover:bg-roast text-white rounded-xl h-10 px-4 text-xs font-semibold flex items-center justify-center gap-1 shadow-sm"
              >
                Trang chi tiết <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </DialogFooter>
          </>
        </DialogContent>
      </Dialog>
    );
  };

  if (isAdminOrManager) {
    const filteredAdminOrders = getFilteredAdminOrders();
    const totalAdminPages = Math.ceil(filteredAdminOrders.length / adminItemsPerPage) || 1;
    const paginatedAdminOrders = filteredAdminOrders.slice(
      (adminPage - 1) * adminItemsPerPage,
      adminPage * adminItemsPerPage
    );

    // Calculate admin stats based on filtered list
    const totalCount = filteredAdminOrders.length;
    const completedRevenue = filteredAdminOrders
      .filter((o) => o.status === "COMPLETED")
      .reduce((sum, o) => sum + (o.finalAmount || 0), 0);
    const pendingCount = filteredAdminOrders.filter((o) => o.status === "PENDING").length;
    const confirmedCount = filteredAdminOrders.filter((o) => o.status === "CONFIRMED").length;

    return (
      <PageContainer>
        {/* Header Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-espresso font-bold tracking-tight">
              Quản lý tất cả đơn hàng
            </h1>
            <p className="text-sm text-smoke font-medium">
              Theo dõi, lọc và cập nhật trạng thái các đơn hàng F&B và Merchandise trên toàn hệ thống.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="border-admin-border bg-white text-smoke hover:bg-foam rounded-xl h-10 px-4 flex items-center gap-2 font-semibold text-xs transition-all duration-200 shadow-sm"
            >
              <Download className="w-4 h-4 text-caramel" />
              Xuất CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchAdminOrders}
              disabled={adminLoading}
              className="border-admin-border bg-white text-smoke hover:bg-foam rounded-xl h-10 w-10 flex items-center justify-center p-0 transition-all duration-200 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${adminLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Admin Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border border-admin-border bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-smoke font-bold uppercase tracking-wider">Tổng số đơn hàng</p>
                <h3 className="text-2xl font-bold text-espresso mt-1 font-serif">{totalCount} đơn</h3>
                <p className="text-[11px] text-smoke mt-1 font-sans">Trong khoảng lọc hiện tại</p>
              </div>
              <div className="p-3 bg-foam rounded-xl text-caramel">
                <Filter className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-admin-border bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-smoke font-bold uppercase tracking-wider">Doanh thu hoàn thành</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1 font-serif">{completedRevenue.toLocaleString()}đ</h3>
                <p className="text-[11px] text-smoke mt-1 font-sans">Từ các đơn hoàn thành</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 flex items-center justify-center w-12 h-12">
                <span className="text-xl font-bold font-serif">₫</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-admin-border bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-smoke font-bold uppercase tracking-wider">Đơn hàng chờ duyệt</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1 font-serif">{pendingCount} đơn</h3>
                <p className="text-[11px] text-smoke mt-1 font-sans">Cần admin xác nhận</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-admin-border bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-smoke font-bold uppercase tracking-wider">Đơn đang thực hiện</p>
                <h3 className="text-2xl font-bold text-blue-600 mt-1 font-serif">{confirmedCount} đơn</h3>
                <p className="text-[11px] text-smoke mt-1 font-sans">Đang pha chế/Giao hàng</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Coffee className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Controls Panel */}
        <div className="bg-white border border-admin-border rounded-2xl p-4 shadow-sm space-y-4 mb-6 transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Primary filters row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 flex-1">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-smoke" />
                <Input
                  placeholder="Tìm mã đơn, khách..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="pl-9 h-10 border-admin-border bg-white rounded-xl focus:ring-1 focus:ring-caramel focus:border-caramel text-xs shadow-none"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={adminStatus}
                  onChange={(e) => setAdminStatus(e.target.value)}
                  className="w-full h-10 border border-admin-border bg-white text-xs text-espresso rounded-xl px-3 outline-none focus:ring-1 focus:ring-caramel"
                >
                  <option value="all-status">Tất cả trạng thái ĐH</option>
                  <option value="PENDING">Chờ xử lý (PENDING)</option>
                  <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
                  <option value="COMPLETED">Đã hoàn thành (COMPLETED)</option>
                  <option value="CANCELLED">Đã hủy (CANCELLED)</option>
                </select>
              </div>

              {/* Channel Filter */}
              <div>
                <select
                  value={adminChannel}
                  onChange={(e) => setAdminChannel(e.target.value)}
                  className="w-full h-10 border border-admin-border bg-white text-xs text-espresso rounded-xl px-3 outline-none focus:ring-1 focus:ring-caramel"
                >
                  <option value="all-channel">Tất cả kênh đặt hàng</option>
                  <option value="POS">Tại quầy (POS)</option>
                  <option value="ONLINE">Trực tuyến (App/Web)</option>
                </select>
              </div>
            </div>

            {/* Advanced Filters Trigger and Reset */}
            <div className="flex items-center justify-end gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="h-10 text-xs font-semibold text-caramel hover:text-roast hover:bg-foam rounded-xl px-3 flex items-center gap-1.5 border border-dashed border-caramel/30"
              >
                <Filter className="w-3.5 h-3.5" />
                {showAdvancedFilters ? "Ẩn bộ lọc phụ" : "Hiện bộ lọc phụ"}
                {showAdvancedFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </Button>

              {(adminSearch || adminStatus !== "all-status" || adminChannel !== "all-channel" || adminType !== "all-type" || adminBranch !== "all-branch" || adminStartDate || adminEndDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAdminSearch("");
                    setAdminStatus("all-status");
                    setAdminChannel("all-channel");
                    setAdminType("all-type");
                    setAdminBranch("all-branch");
                    setAdminStartDate("");
                    setAdminEndDate("");
                  }}
                  className="h-10 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl px-3 border border-rose-200"
                >
                  Thiết lập lại
                </Button>
              )}
            </div>
          </div>

          {/* Collapsible Advanced Filters Section */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-4 border-t border-dashed border-admin-border animate-in fade-in slide-in-from-top-1 duration-200">
              {/* Order Type Filter */}
              <div>
                <label className="block text-[10px] font-bold text-smoke uppercase tracking-wider mb-1">Loại đơn hàng</label>
                <select
                  value={adminType}
                  onChange={(e) => setAdminType(e.target.value)}
                  className="w-full h-10 border border-admin-border bg-white text-xs text-espresso rounded-xl px-3 outline-none focus:ring-1 focus:ring-caramel"
                >
                  <option value="all-type">Tất cả loại đơn</option>
                  <option value="DRINK_PICKUP">Lấy tại quầy (Pick-up)</option>
                  <option value="DRINK_DELIVERY">Giao đồ uống (Delivery)</option>
                  <option value="MERCHANDISE">Mua Merchandise</option>
                </select>
              </div>

              {/* Branch Filter */}
              <div>
                <label className="block text-[10px] font-bold text-smoke uppercase tracking-wider mb-1">Chi nhánh</label>
                <select
                  value={adminBranch}
                  onChange={(e) => setAdminBranch(e.target.value)}
                  disabled={isBranchManager}
                  className="w-full h-10 border border-admin-border bg-white text-xs text-espresso rounded-xl px-3 outline-none focus:ring-1 focus:ring-caramel disabled:opacity-60"
                >
                  <option value="all-branch">Tất cả chi nhánh</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date Filter */}
              <div>
                <label className="block text-[10px] font-bold text-smoke uppercase tracking-wider mb-1">Từ ngày</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-smoke" />
                  <Input
                    type="date"
                    value={adminStartDate}
                    onChange={(e) => setAdminStartDate(e.target.value)}
                    className="pl-9 h-10 border-admin-border bg-white rounded-xl text-xs shadow-none"
                  />
                </div>
              </div>

              {/* End Date Filter */}
              <div>
                <label className="block text-[10px] font-bold text-smoke uppercase tracking-wider mb-1">Đến ngày</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-smoke" />
                  <Input
                    type="date"
                    value={adminEndDate}
                    onChange={(e) => setAdminEndDate(e.target.value)}
                    className="pl-9 h-10 border-admin-border bg-white rounded-xl text-xs shadow-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table View */}
        <div className="bg-white border border-admin-border rounded-2xl shadow-sm overflow-hidden mb-6">
          {adminLoading && adminOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-10 h-10 animate-spin text-caramel mb-4" />
              <span className="text-sm text-smoke font-medium">Đang tải danh sách đơn hàng...</span>
            </div>
          ) : filteredAdminOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-foam flex items-center justify-center text-caramel mb-4">
                <Coffee className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-serif text-espresso font-semibold">
                Không tìm thấy đơn hàng nào
              </h4>
              <p className="text-sm text-smoke max-w-sm mt-1">
                Không có dữ liệu đơn hàng nào khớp với các tiêu chí lọc hiện tại.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-admin-border text-left">
                <thead className="bg-foam/30 border-b border-admin-border">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-espresso uppercase tracking-wider">Mã đơn</th>
                    <th className="px-6 py-4 text-xs font-bold text-espresso uppercase tracking-wider">Khách hàng</th>
                    <th className="px-6 py-4 text-xs font-bold text-espresso uppercase tracking-wider">Chi tiết món</th>
                    <th className="px-6 py-4 text-xs font-bold text-espresso uppercase tracking-wider">Tổng tiền / TT</th>
                    <th className="px-6 py-4 text-xs font-bold text-espresso uppercase tracking-wider">Trạng thái ĐH</th>
                    <th className="px-6 py-4 text-xs font-bold text-espresso uppercase tracking-wider">Chi nhánh / Kênh</th>
                    <th className="px-6 py-4 text-xs font-bold text-espresso uppercase tracking-wider">Ngày đặt</th>
                    <th className="px-6 py-4 text-xs font-bold text-espresso uppercase tracking-wider text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-admin-border text-xs">
                  {paginatedAdminOrders.map((order) => {
                    const isOnline = order.orderNumber.startsWith("TP-");
                    return (
                      <tr key={order.orderId} className="hover:bg-foam/10 transition-colors">
                        {/* Order Number */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenDetail(order)}
                            className="font-mono font-bold text-caramel hover:text-roast hover:underline flex items-center gap-1 bg-foam/30 px-2.5 py-1 rounded-lg border border-caramel/10"
                          >
                            #{order.orderNumber}
                          </button>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">
                            {order.customerName || "Khách mua lẻ"}
                          </div>
                          <div className="text-[11px] text-smoke mt-0.5 font-mono">
                            {order.customerPhone || "N/A"}
                          </div>
                        </td>

                        {/* Item Details (Inline list) */}
                        <td className="px-6 py-4 max-w-[280px]">
                          <div className="space-y-1">
                            {order.items?.map((item) => (
                              <div key={item.id} className="text-[11px] text-slate-700 flex items-start gap-1">
                                <span className="font-bold text-espresso bg-foam/60 px-1 rounded text-[10px] shrink-0 mt-0.5">
                                  {item.quantity}x
                                </span>
                                <div className="truncate">
                                  <span className="font-medium">{item.menuItemName}</span>
                                  {item.sizeName && (
                                    <span className="text-smoke text-[10px] ml-1">
                                      ({item.sizeName})
                                    </span>
                                  )}
                                  {((item.options && item.options.length > 0) || (item.toppings && item.toppings.length > 0) || item.notes) && (
                                    <span className="ml-1 text-[9px] px-1 bg-amber-50 text-amber-700 rounded font-semibold border border-amber-100">
                                      Tùy chỉnh
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Final Amount & Payment info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-espresso text-sm">
                            {order.finalAmount?.toLocaleString() || 0}đ
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-mono text-smoke bg-slate-100 px-1.5 py-0.5 rounded">
                              {order.paymentMethod || "CASH"}
                            </span>
                            <span className={`inline-block px-1.5 py-0.2 text-[9px] font-bold uppercase rounded-full ${
                              order.paymentStatus === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : order.paymentStatus === "REFUNDED"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {order.paymentStatus === "COMPLETED" ? "Đã trả" : order.paymentStatus === "REFUNDED" ? "Hoàn tiền" : "Chưa trả"}
                            </span>
                          </div>
                        </td>

                        {/* Order Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-1 text-[11px] font-bold uppercase rounded-xl border ${
                            order.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : order.status === "CONFIRMED"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : order.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}>
                            {order.status === "PENDING" && "Chờ duyệt"}
                            {order.status === "CONFIRMED" && "Đã duyệt"}
                            {order.status === "COMPLETED" && "Hoàn thành"}
                            {order.status === "CANCELLED" && "Đã hủy"}
                          </span>
                        </td>

                        {/* Branch & Channel */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-slate-700">{order.branchName || "Hệ thống"}</div>
                          <div className="mt-1">
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-2 py-0.5 rounded-full border-0 font-medium ${
                                isOnline ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {isOnline ? "Online" : "POS"}
                            </Badge>
                          </div>
                        </td>

                        {/* Created At */}
                        <td className="px-6 py-4 whitespace-nowrap text-smoke font-mono">
                          {new Date(order.createdAt).toLocaleString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDetail(order)}
                            className="h-8 w-8 p-0 rounded-lg text-smoke hover:text-espresso hover:bg-foam transition-colors"
                          >
                            <Eye className="w-4 h-4 text-caramel" />
                          </Button>
                          
                          {order.status === "PENDING" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(order.orderId, "CONFIRMED")}
                              className="h-8 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-colors shadow-sm"
                            >
                              Duyệt
                            </Button>
                          )}

                          {order.status === "CONFIRMED" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(order.orderId, "COMPLETED")}
                              className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors shadow-sm"
                            >
                              Xong
                            </Button>
                          )}

                          {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCancelOrder(order.orderId)}
                              className="h-8 w-8 p-0 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredAdminOrders.length > 0 && (
            <div className="px-6 py-4 bg-foam/10 border-t border-admin-border flex items-center justify-between">
              <span className="text-xs text-smoke font-medium">
                Hiển thị {(adminPage - 1) * adminItemsPerPage + 1} -{" "}
                {Math.min(adminPage * adminItemsPerPage, filteredAdminOrders.length)} trên tổng số{" "}
                {filteredAdminOrders.length} đơn hàng
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={adminPage === 1}
                  onClick={() => setAdminPage((p) => p - 1)}
                  className="h-8 px-3 border-admin-border bg-white rounded-xl text-xs hover:bg-foam disabled:opacity-50"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Trước
                </Button>
                <span className="text-xs text-espresso font-semibold">
                  Trang {adminPage} / {totalAdminPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={adminPage === totalAdminPages}
                  onClick={() => setAdminPage((p) => p + 1)}
                  className="h-8 px-3 border-admin-border bg-white rounded-xl text-xs hover:bg-foam disabled:opacity-50"
                >
                  Sau <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {renderDetailDialog()}
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-espresso font-bold tracking-tight">
            Hàng đợi pha chế (Cashier)
          </h1>
          <p className="text-sm text-smoke font-medium">
            Hàng đợi các đơn hàng tại quầy và ứng dụng theo thứ tự thời gian.
          </p>
        </div>

        {/* Action Controls & Sound Toggle */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="border-admin-border bg-white text-smoke hover:bg-foam rounded-xl h-10 px-4"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 mr-2 text-caramel animate-bounce" />
                Âm báo: Bật
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 mr-2" />
                Âm báo: Tắt
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchQueueOrders()}
            disabled={loading}
            className="border-admin-border bg-white text-smoke hover:bg-foam rounded-xl h-10 w-10 flex items-center justify-center p-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border border-admin-border bg-white shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-smoke font-bold uppercase tracking-wider">Hàng đợi hiện tại</p>
              <h3 className="text-2xl font-bold text-espresso mt-1">{orders.length} đơn</h3>
            </div>
            <div className="p-3 bg-foam rounded-xl text-caramel">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-admin-border bg-white shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-smoke font-bold uppercase tracking-wider">Đang chờ pha</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{waitingCount} đơn</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-admin-border bg-white shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-smoke font-bold uppercase tracking-wider">Đang thực hiện</p>
              <h3 className="text-2xl font-bold text-caramel mt-1">{brewingCount} đơn</h3>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl text-caramel">
              <Coffee className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Tabs Filter Panel */}
      <div className="bg-white border border-admin-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        {/* Tab Filters */}
        <div className="flex bg-admin-bg p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-lg transition-colors duration-150 ${
              activeTab === "ALL"
                ? "bg-white text-espresso shadow-sm"
                : "text-smoke hover:text-espresso"
            }`}
          >
            Tất cả ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("WAITING")}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-lg transition-colors duration-150 ${
              activeTab === "WAITING"
                ? "bg-white text-espresso shadow-sm"
                : "text-smoke hover:text-espresso"
            }`}
          >
            Chờ pha chế ({waitingCount})
          </button>
          <button
            onClick={() => setActiveTab("BREWING")}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-lg transition-colors duration-150 ${
              activeTab === "BREWING"
                ? "bg-white text-espresso shadow-sm"
                : "text-smoke hover:text-espresso"
            }`}
          >
            Đang pha chế ({brewingCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-smoke" />
          <Input
            placeholder="Tìm mã đơn, tên khách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 border-admin-border bg-white rounded-xl focus:ring-1 focus:ring-caramel focus:border-caramel text-sm shadow-none"
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-admin-border rounded-2xl">
          <RefreshCw className="w-10 h-10 animate-spin text-caramel mb-4" />
          <span className="text-sm text-smoke font-medium">Đang đồng bộ hàng đợi...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-admin-border rounded-2xl text-center px-4">
          <div className="w-16 h-16 rounded-full bg-foam flex items-center justify-center text-caramel mb-4">
            <Coffee className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-serif text-espresso font-semibold">
            Không có đơn hàng nào trong hàng đợi
          </h4>
          <p className="text-sm text-smoke max-w-sm mt-1">
            Mọi thứ đã được pha chế xong hoặc không tìm thấy đơn nào khớp với bộ lọc của bạn.
          </p>
        </div>
      ) : (
        /* Queue Card Grid (Oldest first) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
          {filteredOrders.map((order) => {
            const isBrewing = order.brewingStatus === "BREWING";
            const isOnline = order.orderNumber.startsWith("TP-");
            
            return (
              <Card
                key={order.orderId}
                className={`border bg-white shadow-sm rounded-xl overflow-hidden flex flex-col relative transition-all duration-200 hover:shadow-md ${
                  isBrewing ? "border-caramel" : "border-admin-border"
                }`}
              >
                {/* Accent top border for brewing items */}
                {isBrewing && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-caramel" />
                )}

                {/* Card Header */}
                <div className="p-4 border-b border-admin-border flex justify-between items-center bg-foam/40">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-espresso text-base">
                      #{order.orderNumber.substring(order.orderNumber.length - 4)}
                    </span>
                    
                    {/* Order Type Badge */}
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-2 py-0.5 rounded-full border-0 font-medium ${
                        isOnline
                          ? "bg-sky-50 text-sky-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {isOnline ? "Online" : "POS"}
                    </Badge>
                  </div>

                  {/* Status Badge */}
                  {isBrewing ? (
                    <span className="bg-caramel/10 text-caramel px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Coffee className="w-3.5 h-3.5 animate-bounce" /> Đang pha
                    </span>
                  ) : (
                    <span className="bg-smoke/10 text-smoke px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Chờ pha
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col gap-3 min-h-[140px]">
                  {/* Timer & Customer */}
                  <div className="flex justify-between items-start text-xs border-b border-dashed border-admin-border pb-2">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {order.customerName || "Khách mua lẻ"}
                      </p>
                      <p className="text-[11px] text-smoke mt-0.5">
                        {order.customerPhone || "Không có SĐT"}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-mono ${getElapsedColor(order.createdAt)}`}>
                        {getElapsedTime(order.createdAt)}
                      </p>
                      <p className="text-[9px] text-smoke">Đợi từ {new Date(order.createdAt).toLocaleTimeString("en-GB", {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="flex-1 space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.id} className="text-xs text-slate-700">
                        <div className="flex justify-between font-medium">
                          <span>
                            {item.menuItemName}
                            {item.sizeName && (
                              <span className="text-smoke text-[11px] ml-1">
                                (Size {item.sizeName})
                              </span>
                            )}
                          </span>
                          <span className="font-mono text-espresso bg-foam px-1.5 py-0.5 rounded font-bold">
                            x{item.quantity}
                          </span>
                        </div>
                        
                        {/* Options */}
                        {item.options && item.options.length > 0 && (
                          <p className="text-[11px] text-smoke pl-3 mt-0.5 italic">
                            * {item.options.map(opt => opt.split(": ")[1] || opt).join(", ")}
                          </p>
                        )}
                        
                        {/* Toppings */}
                        {item.toppings && item.toppings.length > 0 && (
                          <p className="text-[11px] text-caramel pl-3 mt-0.5">
                            + Topping: {item.toppings.map(t => t.split(" x")[0]).join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Order Notes */}
                  {order.items?.some(item => item.notes) && (
                    <div className="mt-2 bg-amber-50/70 border border-amber-100 rounded-lg p-2 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-amber-800 leading-tight">
                        {order.items
                          ?.filter(item => item.notes)
                          .map((item, idx) => (
                            <p key={idx}>
                              <span className="font-semibold">{item.menuItemName}:</span> {item.notes}
                            </p>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Action */}
                <div className="p-3 border-t border-admin-border bg-admin-bg/60">
                  <Button
                    onClick={() => handleOpenDetail(order)}
                    className="w-full bg-white border border-admin-border hover:bg-foam text-espresso font-semibold py-1.5 h-9 rounded-lg flex items-center justify-center gap-1.5 transition-colors text-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-caramel" /> Xem chi tiết
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {renderDetailDialog()}
    </PageContainer>
  );
}
