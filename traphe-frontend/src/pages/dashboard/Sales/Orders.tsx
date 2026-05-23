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
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { orderService, type OrderResponse } from "@/services/order.service";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageLayout";

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
  const [previousOrderIds, setPreviousOrderIds] = useState<string[]>([]);
  
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
      const response = await orderService.getAllOrders({
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
      if (previousOrderIds.length > 0) {
        const hasNewOrder = currentIds.some((id) => !previousOrderIds.includes(id));
        if (hasNewOrder && soundEnabled) {
          playAlertSound();
          toast.info("Đơn hàng mới đã được thêm vào hàng đợi pha chế!", {
            icon: "☕",
          });
        }
      }
      
      setPreviousOrderIds(currentIds);
      setOrders(queueItems);
    } catch (err: unknown) {
      console.error("Error loading brewing queue:", err);
      setError("Không thể tải danh sách hàng đợi. Vui lòng thử lại.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [previousOrderIds, soundEnabled, playAlertSound]);

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

  const handleOpenDetail = (order: OrderResponse) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
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
                    {order.items.map((item) => (
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
                  {order.items.some(item => item.notes) && (
                    <div className="mt-2 bg-amber-50/70 border border-amber-100 rounded-lg p-2 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-amber-800 leading-tight">
                        {order.items
                          .filter(item => item.notes)
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

      {/* Quick Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md bg-white border border-admin-border rounded-2xl p-0 overflow-hidden shadow-2xl">
          {selectedOrder && (
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
                    {selectedOrder.items.map((item) => (
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
                            {item.options.map((opt, oIdx) => (
                              <p key={oIdx}>• {opt}</p>
                            ))}
                          </div>
                        )}

                        {/* Toppings details */}
                        {item.toppings && item.toppings.length > 0 && (
                          <div className="text-xs text-caramel pl-3 mt-1 space-y-0.5 font-medium">
                            {item.toppings.map((top, tIdx) => (
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
              <DialogFooter className="p-4 border-t border-admin-border bg-admin-bg flex flex-col sm:flex-row items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                  className="w-full sm:w-auto border-admin-border bg-white hover:bg-foam rounded-xl h-10 px-4 text-xs font-semibold"
                >
                  Đóng
                </Button>
                
                {selectedOrder.paymentStatus !== "COMPLETED" && (
                  <Button
                    onClick={handleConfirmPayment}
                    className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-10 px-4 text-xs font-semibold shadow-sm"
                  >
                    Xác nhận đã thu tiền
                  </Button>
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
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
