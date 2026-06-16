import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Clock,
  CheckCircle,
  Play,
  Coffee,
  Volume2,
  VolumeX,
  Check,
  Search,
  Receipt,
  User,
  AlertTriangle,
  Info,
} from "lucide-react";
import { orderService } from "@/services/order.service";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";
import { toast } from "sonner";

interface QueueItem {
  id: string;
  orderNumber: string;
  customerName: string;
  type: string; // "POS" | "ONLINE" | "TẠI CHỖ" | "MANG ĐI"
  timeElapsed: number; // in seconds
  items: Array<{
    name: string;
    quantity: number;
    options: string[];
    notes?: string | null;
  }>;
  status: "WAITING" | "BREWING" | "DONE";
  notes?: string;
  createdAt: string;
  customerPhone?: string;
}



export default function PosQueuePage() {
  const [activeTab, setActiveTab] = useState<"WAITING" | "BREWING" | "DONE">("WAITING");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQueueItem, setSelectedQueueItem] = useState<QueueItem | null>(null);

  // Periodically update time elapsed
  useEffect(() => {
    const timer = setInterval(() => {
      setQueue((prev) =>
        prev.map((item) => {
          if (item.status !== "DONE") {
            return { ...item, timeElapsed: item.timeElapsed + 1 };
          }
          return item;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch actual orders to merge into the queue
  useEffect(() => {
    fetchLiveOrders();
  }, []);

  const fetchLiveOrders = async () => {
    try {
      const response = await orderService.getFullOrders();
      const orders = response.data?.content || [];

      // Filter and map to queue items
      const liveQueueItems: QueueItem[] = orders
        .filter((o) => {
          // Ignore merchandise orders as they don't need brewing
          if (o.orderType === "MERCHANDISE") return false;

          // 1. Order must be active: status PENDING or CONFIRMED
          const isNotFinished = o.status === "PENDING" || o.status === "CONFIRMED";
          if (!isNotFinished) return false;

          // 2. Brewing status must not be completed
          const isBrewingFinished = o.brewingStatus === "COMPLETED";
          if (isBrewingFinished) return false;

          // 3. Payment verification:
          // POS orders or completed payments or pay-later methods
          const isPOS = o.orderNumber.startsWith("POS-");
          const isPaid = o.paymentStatus === "COMPLETED";
          const isPayLater = o.paymentMethod === "COD" || o.paymentMethod === "CASH";

          if (!isPOS && !isPaid && !isPayLater) return false;

          return true;
        })
        .map((o) => {
          // Map brewingStatus to queue status
          let status: "WAITING" | "BREWING" | "DONE" = "WAITING";
          if (o.brewingStatus === "BREWING") status = "BREWING";
          else if (o.brewingStatus === "READY") status = "DONE";

          // Calculate elapsed time from createdAt
          const elapsed = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 1000);

          // Merge all item notes for order level notes
          const itemNotes = (o.items ?? []).map(item => item.notes).filter(Boolean).join("; ");

          return {
            id: o.orderId,
            orderNumber: o.orderNumber,
            customerName: o.customerName || "Khách mua lẻ",
            type: o.orderNumber.startsWith("POS-") ? "POS" : "ONLINE",
            timeElapsed: Math.max(0, elapsed),
            items: (o.items ?? []).map((item) => ({
              name: item.menuItemName,
              quantity: item.quantity,
              options: [
                item.sizeName ? `Size ${item.sizeName}` : "",
                ...(item.options || []),
                ...(item.toppings || []),
              ].filter(Boolean),
              notes: item.notes,
            })),
            status,
            createdAt: o.createdAt,
            customerPhone: o.customerPhone || undefined,
            notes: itemNotes || undefined,
          };
        });

      // Sort everything based on time elapsed descending (oldest first)
      setQueue(() => {
        return liveQueueItems.sort((a, b) => b.timeElapsed - a.timeElapsed);
      });

      // Update currently selected item if it's in the queue to keep it synced
      if (selectedQueueItem) {
        const updated = liveQueueItems.find(item => item.id === selectedQueueItem.id);
        if (updated) {
          setSelectedQueueItem(updated);
        }
      }
    } catch (err: any) {
      console.error("Error loading live orders for queue:", err);
    }
  };

  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.error("Sound play failed", e);
    }
  };

  const handleStartBrewing = async (id: string) => {
    playNotificationSound();

    try {
      await orderService.updateBrewingStatus(id, "BREWING");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi cập nhật trạng thái pha chế.");
      return;
    }

    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "BREWING" } : item))
    );
    
    // Sync active item if currently open
    if (selectedQueueItem?.id === id) {
      setSelectedQueueItem(prev => prev ? { ...prev, status: "BREWING" } : null);
    }

    toast.success("Bắt đầu pha chế!");
  };

  const handleCompleteBrewing = async (id: string) => {
    playNotificationSound();

    try {
      await orderService.updateBrewingStatus(id, "COMPLETED");
      toast.success("Đã hoàn thành pha chế!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi hoàn thành pha chế.");
      return;
    }

    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "DONE" } : item))
    );

    // Sync active item if currently open
    if (selectedQueueItem?.id === id) {
      setSelectedQueueItem(prev => prev ? { ...prev, status: "DONE" } : null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const filteredItems = queue.filter(
    (item) =>
      item.status === activeTab &&
      (item.orderNumber.includes(searchTerm) ||
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <PageContainer>
      <PageHeader
        title="Hàng đợi Pha chế (Barista KDS)"
        subtitle="Màn hình hiển thị và điều phối quy trình pha chế đồ uống tại quầy bar"
        onRefresh={fetchLiveOrders}
      />

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 mt-4">
        <div className="flex items-center gap-3">
          <Button
            variant={activeTab === "WAITING" ? "default" : "outline"}
            className={
              activeTab === "WAITING"
                ? "bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-md transition-all duration-200"
                : "bg-white hover:bg-slate-50 text-slate-700"
            }
            onClick={() => setActiveTab("WAITING")}
          >
            Chờ pha chế (
            {queue.filter((item) => item.status === "WAITING").length}
            )
          </Button>
          <Button
            variant={activeTab === "BREWING" ? "default" : "outline"}
            className={
              activeTab === "BREWING"
                ? "bg-roast hover:bg-roast/90 text-white font-medium shadow-md transition-all duration-200"
                : "bg-white hover:bg-slate-50 text-slate-700"
            }
            onClick={() => setActiveTab("BREWING")}
          >
            Đang pha chế (
            {queue.filter((item) => item.status === "BREWING").length}
            )
          </Button>
          <Button
            variant={activeTab === "DONE" ? "default" : "outline"}
            className={
              activeTab === "DONE"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md transition-all duration-200"
                : "bg-white hover:bg-slate-50 text-slate-700"
            }
            onClick={() => setActiveTab("DONE")}
          >
            Đã hoàn thành (
            {queue.filter((item) => item.status === "DONE").length}
            )
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm số đơn..."
              className="pl-9 h-9 bg-white border-slate-200 focus-visible:ring-roast focus-visible:border-roast"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="bg-white border-slate-200 hover:bg-slate-50"
            title={soundEnabled ? "Tắt âm thanh thông báo" : "Bật âm thanh thông báo"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-roast" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </Button>
        </div>
      </div>

      {/* Grid of Order Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <Coffee className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Không có đơn hàng nào trong hàng đợi</p>
          </div>
        ) : (
          filteredItems.map((order) => {
            const hasWarnings = order.items.some(item => item.notes?.toLowerCase().includes("allergy") || item.notes?.toLowerCase().includes("dị ứng"));
            return (
              <Card
                key={order.id}
                onClick={() => setSelectedQueueItem(order)}
                className={`shadow-sm hover:shadow-md cursor-pointer border flex flex-col justify-between overflow-hidden transition-all duration-200 active:scale-[0.99] ${
                  order.status === "WAITING"
                    ? hasWarnings ? "border-red-300 bg-red-50/5" : "border-amber-200 bg-amber-50/5"
                    : order.status === "BREWING"
                    ? "border-roast/20 bg-roast/10/5 ring-2 ring-roast/10"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div>
                  <div
                    className={`p-4 flex items-center justify-between border-b ${
                      order.status === "WAITING"
                        ? hasWarnings ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"
                        : order.status === "BREWING"
                        ? "bg-roast/10 border-foam"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xl text-slate-800">
                        #{order.orderNumber.length > 6 ? order.orderNumber.substring(order.orderNumber.length - 6) : order.orderNumber}
                      </span>
                      <Badge
                        variant="secondary"
                        className={
                          order.type === "POS"
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                            : "bg-roast/20 text-roast/90 hover:bg-roast/20"
                        }
                      >
                        {order.type}
                      </Badge>
                      {hasWarnings && (
                        <Badge className="bg-red-500 text-white font-bold animate-pulse">
                          CẢNH BÁO
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-white px-2 py-1 rounded-full border border-slate-200 shadow-sm">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatTime(order.timeElapsed)}</span>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-4">
                    <div className="text-sm">
                      <span className="text-slate-400 block mb-0.5">Khách hàng</span>
                      <span className="font-semibold text-slate-800">{order.customerName}</span>
                    </div>

                    <div className="space-y-3">
                      <span className="text-slate-400 text-sm block">Đồ uống cần pha</span>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => {
                          const isAllergyItem = item.notes?.toLowerCase().includes("allergy") || item.notes?.toLowerCase().includes("dị ứng");
                          return (
                            <div
                              key={idx}
                              className={`p-3 border rounded-xl space-y-1 ${
                                isAllergyItem ? "bg-red-50/50 border-red-200" : "bg-white border-slate-100"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-semibold text-slate-900 text-sm break-words leading-tight">
                                  {item.name}
                                  {item.options.length > 0 && (
                                    <span className="text-slate-500 font-normal">
                                      {" — "}{item.options.join(" — ")}
                                    </span>
                                  )}
                                </span>
                                <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 shrink-0">
                                  x{item.quantity}
                                </Badge>
                              </div>
                              {item.notes && (
                                <div className={`text-xs mt-1 p-1.5 rounded font-medium flex gap-1 ${
                                  isAllergyItem ? "text-red-700 bg-red-100/50" : "text-amber-700 bg-amber-50"
                                }`}>
                                  {isAllergyItem ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> : <Info className="w-3.5 h-3.5 shrink-0" />}
                                  <span>{item.notes}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                  {order.status === "WAITING" && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartBrewing(order.id);
                      }}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm transition-all active:scale-[0.98]"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Bắt đầu pha chế
                    </Button>
                  )}
                  {order.status === "BREWING" && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompleteBrewing(order.id);
                      }}
                      className="w-full bg-roast hover:bg-roast/90 text-white font-medium shadow-sm transition-all active:scale-[0.98]"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Hoàn thành pha
                    </Button>
                  )}
                  {order.status === "DONE" && (
                    <div className="w-full flex items-center justify-center gap-1.5 py-2 text-emerald-600 font-semibold text-sm">
                      <CheckCircle className="w-5 h-5" />
                      <span>Đã sẵn sàng giao khách</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Chi tiết đơn pha chế Modal */}
      <Dialog open={selectedQueueItem !== null} onOpenChange={(open) => { if (!open) setSelectedQueueItem(null); }}>
        <DialogContent className="max-w-2xl bg-white rounded-2xl overflow-hidden p-0 gap-0 border-0 shadow-2xl">
          {selectedQueueItem && (
            <div>
              {/* Header */}
              <div className={`p-6 text-white flex items-center justify-between ${
                selectedQueueItem.status === "WAITING"
                  ? "bg-amber-600"
                  : selectedQueueItem.status === "BREWING"
                  ? "bg-roast"
                  : "bg-emerald-600"
              }`}>
                <div className="flex items-center gap-3">
                  <Receipt className="w-8 h-8 opacity-90" />
                  <div>
                    <h2 className="text-xl font-bold font-mono">ĐƠN #{selectedQueueItem.orderNumber}</h2>
                    <p className="text-xs opacity-75 mt-0.5">
                      Loại đơn: {selectedQueueItem.type} | Đã trôi qua: {formatTime(selectedQueueItem.timeElapsed)}
                    </p>
                  </div>
                </div>
                <Badge className="bg-white/20 text-white font-semibold border-white/20">
                  {selectedQueueItem.status === "WAITING"
                    ? "Chờ pha chế"
                    : selectedQueueItem.status === "BREWING"
                    ? "Đang pha chế"
                    : "Đã hoàn thành"}
                </Badge>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Warnings / Notes */}
                {selectedQueueItem.items.some(item => item.notes?.toLowerCase().includes("allergy") || item.notes?.toLowerCase().includes("dị ứng")) && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">CẢNH BÁO DỊ ỨNG & VỆ SINH AN TOÀN</h4>
                      <p className="text-xs mt-1 leading-relaxed">
                        Đơn hàng này có yêu cầu dị ứng đặc biệt. Vui lòng đảm bảo sử dụng các dụng cụ pha chế (ca đong, thìa khuấy, máy xay) hoàn toàn riêng biệt để tránh nhiễm chéo.
                      </p>
                    </div>
                  </div>
                )}

                {/* Customer Info */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                  <h3 className="text-slate-700 font-bold text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    Thông tin khách hàng
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400 block text-xs">Tên khách hàng</span>
                      <span className="font-semibold text-slate-800">{selectedQueueItem.customerName}</span>
                    </div>
                    {selectedQueueItem.customerPhone && (
                      <div>
                        <span className="text-slate-400 block text-xs">Số điện thoại</span>
                        <span className="font-semibold text-slate-800">{selectedQueueItem.customerPhone}</span>
                      </div>
                    )}
                  </div>
                  {selectedQueueItem.notes && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <span className="text-slate-400 block text-xs">Ghi chú đơn hàng</span>
                      <span className="text-amber-800 font-medium text-xs bg-amber-50 px-2 py-1 rounded block mt-1">
                        {selectedQueueItem.notes}
                      </span>
                    </div>
                  )}
                </div>

                {/* Brewing List */}
                <div className="space-y-3">
                  <h3 className="text-slate-700 font-bold text-sm flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-slate-500" />
                    Danh sách món cần pha chế
                  </h3>
                  <div className="space-y-3">
                    {selectedQueueItem.items.map((item, idx) => {
                      const isAllergy = item.notes?.toLowerCase().includes("allergy") || item.notes?.toLowerCase().includes("dị ứng");
                      return (
                        <div
                          key={idx}
                          className={`p-4 border rounded-xl flex flex-col justify-between gap-2 transition-all ${
                            isAllergy ? "bg-red-50/55 border-red-200" : "bg-white border-slate-100"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <h4 className="font-bold text-slate-900 text-base leading-snug">
                                {item.name}
                              </h4>
                              {item.options.length > 0 && (
                                <p className="text-sm text-slate-500 font-medium">
                                  {item.options.join(" — ")}
                                </p>
                              )}
                            </div>
                            <span className="bg-slate-100 text-slate-800 font-bold px-3 py-1 rounded-lg text-sm shrink-0">
                              x{item.quantity}
                            </span>
                          </div>

                          {item.notes && (
                            <div className={`mt-2 p-2.5 rounded-lg text-xs font-semibold flex gap-2 ${
                              isAllergy ? "text-red-700 bg-red-100/50" : "text-amber-700 bg-amber-50"
                            }`}>
                              {isAllergy ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Info className="w-4 h-4 shrink-0" />}
                              <span className="leading-relaxed">{item.notes}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedQueueItem(null)}
                  className="border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  Đóng
                </Button>
                {selectedQueueItem.status === "WAITING" && (
                  <Button
                    onClick={() => handleStartBrewing(selectedQueueItem.id)}
                    className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Bắt đầu pha chế
                  </Button>
                )}
                {selectedQueueItem.status === "BREWING" && (
                  <Button
                    onClick={() => handleCompleteBrewing(selectedQueueItem.id)}
                    className="bg-roast hover:bg-roast/90 text-white rounded-xl font-bold shadow-md"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Hoàn thành pha
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
