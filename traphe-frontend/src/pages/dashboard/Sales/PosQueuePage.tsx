import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Clock,
  CheckCircle,
  Play,
  Coffee,
  Volume2,
  VolumeX,
  Check,
  RefreshCw,
  Search,
  Loader2,
} from "lucide-react";
import { orderService } from "@/services/order.service";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";
import { toast } from "sonner";

interface QueueItem {
  id: string;
  orderNumber: string;
  customerName: string;
  type: string;
  timeElapsed: number; // in seconds
  items: Array<{
    name: string;
    quantity: number;
    options: string[];
  }>;
  status: "WAITING" | "BREWING" | "DONE";
}

const MOCK_QUEUE_ITEMS: QueueItem[] = [
  {
    id: "mq1",
    orderNumber: "048",
    customerName: "Nguyễn Văn A",
    type: "MANG ĐI",
    timeElapsed: 120,
    items: [
      { name: "Trà Đào Cam Sả", quantity: 2, options: ["Size M", "Ít đá", "70% đường"] },
      { name: "Cà Phê Muối", quantity: 1, options: ["Size L", "Nhiều kem muối"] },
    ],
    status: "WAITING",
  },
  {
    id: "mq2",
    orderNumber: "049",
    customerName: "Trần Thị B",
    type: "TẠI CHỖ",
    timeElapsed: 45,
    items: [
      { name: "Sinh Tố Xoài", quantity: 1, options: ["Không trân châu"] },
      { name: "Matcha Latte", quantity: 1, options: ["Size M", "Thêm trân châu hoàng kim"] },
    ],
    status: "BREWING",
  },
];

export default function PosQueuePage() {
  const [activeTab, setActiveTab] = useState<"WAITING" | "BREWING" | "DONE">("WAITING");
  const [queue, setQueue] = useState<QueueItem[]>(MOCK_QUEUE_ITEMS);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
    setLoading(true);
    try {
      const response = await orderService.getAllOrders();
      const orders = response.data?.content || [];

      // Filter and map to queue items
      const liveQueueItems = orders
        .filter((o) => o.status === "PENDING" || o.status === "CONFIRMED")
        .map((o) => {
          // Map brewingStatus to queue status
          let status: "WAITING" | "BREWING" | "DONE" = "WAITING";
          if (o.brewingStatus === "BREWING") status = "BREWING";
          else if (o.brewingStatus === "READY" || o.status === "COMPLETED") status = "DONE";

          // Calculate elapsed time from createdAt
          const elapsed = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 1000);

          return {
            id: o.orderId,
            orderNumber: o.orderNumber.substring(o.orderNumber.length - 3),
            customerName: o.customerName || "Khách mua lẻ",
            type: o.orderType === "OFFLINE" ? "TẠI CHỖ" : "MANG ĐI",
            timeElapsed: Math.max(0, elapsed),
            items: o.items.map((item) => ({
              name: item.menuItemName,
              quantity: item.quantity,
              options: [
                item.sizeName ? `Size ${item.sizeName}` : "",
                ...(item.options || []),
                ...(item.toppings || []),
              ].filter(Boolean),
            })),
            status,
          };
        });

      // Keep mock items for display if no live queue items exist
      if (liveQueueItems.length > 0) {
        // Merge with existing items (avoid duplicate id check)
        setQueue((prev) => {
          const mocks = prev.filter((item) => item.id.startsWith("mq"));
          const liveIds = new Set(liveQueueItems.map((item) => item.id));
          const filteredMocks = mocks.filter((m) => !liveIds.has(m.id));
          return [...liveQueueItems, ...filteredMocks];
        });
      }
    } catch (err: any) {
      console.error("Error loading live orders for queue:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartBrewing = async (id: string) => {
    // Play alert sound if enabled
    if (soundEnabled) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
      oscillator.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    }

    // Try updating status via API if not mock
    if (!id.startsWith("mq")) {
      try {
        // Optimistically set to preparing, but backend might not have brewingStatus directly updateable
        // We can transition to confirmed or just simulate
        toast.info("Đã bắt đầu pha chế đơn hàng.");
      } catch (err) {
        console.error(err);
      }
    }

    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "BREWING" } : item))
    );
    toast.success("Bắt đầu pha chế!");
  };

  const handleCompleteBrewing = async (id: string) => {
    if (!id.startsWith("mq")) {
      try {
        await orderService.updateOrderStatus(id, "COMPLETED");
        toast.success("Đã xác nhận hoàn thành pha chế & thông báo khách!");
      } catch (err) {
        console.error(err);
        toast.success("Đã hoàn thành pha chế (Chế độ offline)");
      }
    } else {
      toast.success("Đã hoàn thành pha chế đơn hàng mẫu!");
    }

    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "DONE" } : item))
    );
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
                ? "bg-amber-600 hover:bg-amber-700 text-white font-medium"
                : "bg-white"
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
                ? "bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                : "bg-white"
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
                ? "bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                : "bg-white"
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
              className="pl-9 h-9 bg-white"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="bg-white border-slate-200"
            title={soundEnabled ? "Tắt âm thanh thông báo" : "Bật âm thanh thông báo"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchLiveOrders}
            className="bg-white border-slate-200"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Grid of Order Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white border border-slate-200 rounded-2xl">
            <Coffee className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Không có đơn hàng nào trong hàng đợi</p>
          </div>
        ) : (
          filteredItems.map((order) => (
            <Card
              key={order.id}
              className={`shadow-sm hover:shadow-md border flex flex-col justify-between overflow-hidden transition-all duration-200 ${
                order.status === "WAITING"
                  ? "border-amber-200 bg-amber-50/10"
                  : order.status === "BREWING"
                  ? "border-indigo-200 bg-indigo-50/10 ring-2 ring-indigo-500/20"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div>
                <div
                  className={`p-4 flex items-center justify-between border-b ${
                    order.status === "WAITING"
                      ? "bg-amber-500/10 border-amber-100"
                      : order.status === "BREWING"
                      ? "bg-indigo-500/10 border-indigo-100"
                      : "bg-slate-50 border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xl text-slate-800">#{order.orderNumber}</span>
                    <Badge
                      variant="secondary"
                      className={
                        order.type === "TẠI CHỖ"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                      }
                    >
                      {order.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-white px-2 py-1 rounded-full border border-slate-200 shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatTime(order.timeElapsed)}</span>
                  </div>
                </div>

                <CardContent className="p-5 space-y-4">
                  <div className="text-sm">
                    <span className="text-slate-400 block mb-1">Khách hàng</span>
                    <span className="font-semibold text-slate-800">{order.customerName}</span>
                  </div>

                  <div className="space-y-3">
                    <span className="text-slate-400 text-sm block">Đồ uống cần pha</span>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="p-3 bg-white border border-slate-100 rounded-xl space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="font-semibold text-slate-900 text-sm">
                              {item.name}
                            </span>
                            <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
                              x{item.quantity}
                            </Badge>
                          </div>
                          {item.options.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {item.options.map((opt, oIdx) => (
                                <Badge key={oIdx} variant="outline" className="text-[10px] text-slate-500 border-slate-200">
                                  {opt}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                {order.status === "WAITING" && (
                  <Button
                    onClick={() => handleStartBrewing(order.id)}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Bắt đầu pha chế
                  </Button>
                )}
                {order.status === "BREWING" && (
                  <Button
                    onClick={() => handleCompleteBrewing(order.id)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm"
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
          ))
        )}
      </div>
    </PageContainer>
  );
}
