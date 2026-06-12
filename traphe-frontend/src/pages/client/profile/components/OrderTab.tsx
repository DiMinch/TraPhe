import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  PackageX, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck, 
  Info, 
  ExternalLink
} from "lucide-react";
import { orderService, type OrderResponse, type OrderItemDetail } from "@/services/order.service";
import { format } from "date-fns";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Unsplash images matching the luxurious TraPhe look
const COFFEE_IMAGES = [
  "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600", // Iced Vietnamese Coffee
  "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=600", // Espresso extraction
  "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600", // Hot Latte art
  "https://images.unsplash.com/photo-1559056191-72a7f0abc3e8?auto=format&fit=crop&q=80&w=600"  // Retail coffee bag
];

const getOrderImage = (orderId: string, isMerch: boolean) => {
  if (isMerch) return COFFEE_IMAGES[3]; // Bag image for merchandise
  // Deterministic index based on orderId string hash
  let hash = 0;
  for (let i = 0; i < orderId.length; i++) {
    hash = orderId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 3;
  return COFFEE_IMAGES[index];
};

export default function OrderTab() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [filterType, setFilterType] = useState<"ALL" | "DRINKS" | "MERCHANDISE">("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "COMPLETED" | "DELIVERING" | "CANCELLED">("ALL");
  
  // Details Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = await orderService.getMyOrders({ page: 0, size: 50 });
        if (res.statusCode === 200 && res.data) {
          setOrders(res.data.content);
        }
      } catch (error) {
        console.error("Failed to fetch orders", error);
        toast.error("Không thể tải danh sách đơn hàng");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filter application
  useEffect(() => {
    let result = [...orders];

    // Filter by Type
    if (filterType === "DRINKS") {
      result = result.filter(o => o.orderType === "DRINK_PICKUP" || o.orderType === "DRINK_DELIVERY");
    } else if (filterType === "MERCHANDISE") {
      result = result.filter(o => o.orderType === "MERCHANDISE");
    }

    // Filter by Status
    if (filterStatus === "COMPLETED") {
      result = result.filter(o => o.status === "COMPLETED");
    } else if (filterStatus === "DELIVERING") {
      result = result.filter(o => o.status === "PENDING" || o.status === "CONFIRMED");
    } else if (filterStatus === "CANCELLED") {
      result = result.filter(o => o.status === "CANCELLED");
    }

    setFilteredOrders(result);
  }, [orders, filterType, filterStatus]);

  const handleReorder = (order: OrderResponse) => {
    toast.success("Đang chuyển bạn đến thực đơn để chọn món tương tự.");
    if (order.orderType === "MERCHANDISE") {
      navigate("/shop");
    } else {
      navigate("/menu");
    }
  };

  const handlePayment = (paymentUrl: string) => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
    } else {
      toast.error("Không tìm thấy liên kết thanh toán cho đơn hàng này.");
    }
  };

  const handleOpenDetails = async (order: OrderResponse) => {
    setSelectedOrder(order);
    setIsFetchingDetails(true);
    try {
      const res = await orderService.getOrderById(order.orderId);
      if (res.statusCode === 200 && res.data) {
        setSelectedOrder(res.data);
      }
    } catch (error) {
      toast.error("Không thể tải chi tiết đơn hàng");
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <div className="flex items-center gap-1.5 text-green-700 font-medium">
            <CheckCircle className="w-4 h-4 fill-green-700/10" />
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
          </div>
        );
      case "CONFIRMED":
        return (
          <div className="flex items-center gap-1.5 text-blue-700 font-medium">
            <Truck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Confirmed</span>
          </div>
        );
      case "PENDING":
        return (
          <div className="flex items-center gap-1.5 text-yellow-800 font-medium">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
          </div>
        );
      case "CANCELLED":
        return (
          <div className="flex items-center gap-1.5 text-red-700 font-medium">
            <XCircle className="w-4 h-4 fill-red-700/10" />
            <span className="text-xs font-bold uppercase tracking-wider">Cancelled</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 text-gray-600 font-medium">
            <Info className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">{status}</span>
          </div>
        );
    }
  };

  const formatItemsSummary = (items?: OrderItemDetail[]) => {
    if (!items || items.length === 0) return "No items";
    return items.map(item => `${item.quantity}x ${item.menuItemName}${item.sizeName ? ` (${item.sizeName})` : ""}`).join(", ");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-[#A0622A]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Filter Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#D4C9BC] pb-6">
        <div>
          <h1 className="font-display-md text-3xl font-semibold text-espresso mb-2">Order History</h1>
          <p className="font-body-md text-sm text-smoke">Review your past indulgences and repeat favorites.</p>
        </div>
        
        {/* Filters */}
        <div className="flex gap-3 w-full md:w-auto font-sans">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="flex-grow md:flex-grow-0 bg-[#EFE5D3] border border-[#D4C9BC] text-espresso rounded-xl px-4 py-2 text-sm focus:ring-[#5C3317] focus:border-[#5C3317] outline-none cursor-pointer font-medium"
          >
            <option value="ALL">All Types</option>
            <option value="DRINKS">Drinks</option>
            <option value="MERCHANDISE">Merchandise</option>
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="flex-grow md:flex-grow-0 bg-[#EFE5D3] border border-[#D4C9BC] text-espresso rounded-xl px-4 py-2 text-sm focus:ring-[#5C3317] focus:border-[#5C3317] outline-none cursor-pointer font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="DELIVERING">Delivering</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#EFE5D3] to-[#FFFFFF] rounded-3xl border border-[#D4C9BC]/50 shadow-sm min-h-[400px] flex items-center justify-center p-8 group">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-cream rounded-full blur-[80px] opacity-60"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-parchment rounded-full blur-[100px] opacity-50"></div>
          
          <div className="relative z-10 text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-white/80 transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2">
              <PackageX className="w-10 h-10 text-[#A0622A]/80" />
            </div>
            
            <h3 className="font-serif text-2xl font-bold text-espresso mb-3">
              Chưa có đơn hàng nào
            </h3>
            
            <p className="text-smoke text-sm mb-8 leading-relaxed px-4">
              Bạn chưa có đơn hàng nào khớp với bộ lọc hiện tại. Hãy bắt đầu khám phá thực đơn đa dạng của TraPhe và thưởng thức ngay những hương vị tuyệt vời nhất!
            </p>
            
            <Button
              onClick={() => navigate("/menu")}
              className="bg-espresso hover:bg-[#2C1A0E] text-white rounded-xl px-8 h-12 text-sm font-medium tracking-wide shadow-md hover:shadow-lg transition-all duration-300"
            >
              Khám phá thực đơn
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map((order) => {
            const isActive = order.status === "PENDING" || order.status === "CONFIRMED";
            const isCancelled = order.status === "CANCELLED";
            const isMerch = order.orderType === "MERCHANDISE";
            const imageUrl = getOrderImage(order.orderId, isMerch);

            // Large Featured Card for Active/Delivering Orders
            if (isActive) {
              return (
                <div 
                  key={order.orderId}
                  className="col-span-1 lg:col-span-2 bg-[#EFE5D3] rounded-2xl shadow-sm border border-[#D4C9BC] overflow-hidden flex flex-col md:flex-row hover:-translate-y-1 transition-transform duration-300 group cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div 
                    className="w-full md:w-1/3 h-48 md:h-auto bg-cover bg-center min-h-[180px] relative overflow-hidden" 
                    style={{ backgroundImage: `url('${imageUrl}')` }}
                  >
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-2.5 py-1 bg-yellow-100/80 text-yellow-800 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 animate-bounce" />
                          {order.status === "PENDING" ? "Processing" : "Delivering"}
                        </span>
                        <span className="font-sans text-smoke text-xs font-medium">
                          {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-espresso mb-1 group-hover:text-[#A0622A] transition-colors">
                        Đơn hàng #{order.orderNumber}
                      </h3>
                      <p className="font-sans text-sm text-smoke mb-4 line-clamp-2">
                        {formatItemsSummary(order.items)}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#D4C9BC]/60">
                      <span className="font-sans text-xl font-bold text-roast">
                        {(order.finalAmount ?? 0).toLocaleString("vi-VN")}₫
                      </span>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        {order.paymentStatus === "PENDING" && order.paymentUrl && (
                          <Button 
                            onClick={() => handlePayment(order.paymentUrl!)}
                            className="bg-[#A0622A] text-white hover:bg-[#854d1d] h-9 px-4 rounded-xl text-xs font-medium shadow-sm flex items-center gap-1"
                          >
                            Thanh toán
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleOpenDetails(order)}
                          className="bg-[#5C3317] text-white hover:bg-espresso h-9 px-4 rounded-xl text-xs font-medium shadow-sm"
                        >
                          Chi Tiết
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Normal Card for Completed or Cancelled Orders
            return (
              <div 
                key={order.orderId}
                className={`bg-surface-bright rounded-2xl shadow-sm border border-[#D4C9BC] p-6 hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between cursor-pointer ${isCancelled ? 'opacity-80' : ''}`}
                onClick={() => handleOpenDetails(order)}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    {getStatusBadge(order.status)}
                    <span className="font-sans text-smoke text-xs font-medium">
                      {format(new Date(order.createdAt), "dd MMM yyyy")}
                    </span>
                  </div>
                  
                  <h3 className={`font-serif text-lg font-bold text-espresso mb-1 ${isCancelled ? 'line-through decoration-[#D4C9BC]' : ''}`}>
                    Đơn hàng #{order.orderNumber}
                  </h3>
                  <p className="font-sans text-sm text-smoke mb-4 line-clamp-2">
                    {formatItemsSummary(order.items)}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#D4C9BC]/50">
                  <span className={`font-sans text-lg font-bold ${isCancelled ? 'text-smoke line-through decoration-[#D4C9BC]' : 'text-roast'}`}>
                    {(order.finalAmount ?? 0).toLocaleString("vi-VN")}₫
                  </span>
                  
                  <div onClick={(e) => e.stopPropagation()}>
                    {isCancelled ? (
                      <Button 
                        variant="ghost"
                        onClick={() => handleOpenDetails(order)}
                        className="text-smoke hover:text-[#5C3317] text-xs font-medium underline"
                      >
                        Chi Tiết
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        {order.paymentStatus === "PENDING" && order.paymentUrl && (
                          <Button 
                            onClick={() => handlePayment(order.paymentUrl!)}
                            className="bg-[#A0622A] text-white hover:bg-[#854d1d] h-9 px-3 rounded-xl text-xs font-medium shadow-sm flex items-center gap-1"
                          >
                            Thanh toán
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleReorder(order)}
                          className="bg-transparent border border-[#5C3317] text-[#5C3317] hover:bg-[#F5EAD8] h-9 px-3 rounded-xl text-xs font-medium"
                        >
                          Đặt lại
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="bg-white border-[#EFE5D3] max-w-lg p-6 rounded-2xl shadow-xl overflow-y-auto max-h-[85vh] font-sans">
          {selectedOrder && (
            <>
              <DialogHeader className="border-b border-gray-100 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="font-serif text-2xl font-bold text-[#2C1A0E]">
                      Chi tiết đơn hàng
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 text-xs mt-1">
                      Mã đơn: #{selectedOrder.orderNumber} • Đặt ngày {format(new Date(selectedOrder.createdAt), "dd/MM/yyyy HH:mm")}
                    </DialogDescription>
                  </div>
                  <div>
                    {selectedOrder.status === "COMPLETED" && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 rounded-full font-bold">COMPLETED</Badge>
                    )}
                    {selectedOrder.status === "CANCELLED" && (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 rounded-full font-bold">CANCELLED</Badge>
                    )}
                    {(selectedOrder.status === "PENDING" || selectedOrder.status === "CONFIRMED") && (
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 rounded-full font-bold">PROCESSING</Badge>
                    )}
                  </div>
                </div>
              </DialogHeader>

              {/* Items List */}
              <div className="py-4 space-y-4">
                <h4 className="font-serif text-[#5C3317] font-bold text-sm uppercase tracking-wider">Danh sách món</h4>
                <div className="space-y-3">
                  {isFetchingDetails ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-[#A0622A]" />
                    </div>
                  ) : !selectedOrder.items || selectedOrder.items.length === 0 ? (
                    <div className="text-gray-500 italic text-sm text-center py-2">Chưa có thông tin món</div>
                  ) : (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-sm">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#5C3317]">{item.quantity}x</span>
                            <span className="font-medium text-[#2C1A0E]">{item.menuItemName}</span>
                            {item.sizeName && (
                              <span className="text-xs text-gray-500 font-semibold">({item.sizeName})</span>
                            )}
                          </div>
                          {/* Options & Toppings */}
                          {((item.options && item.options.length > 0) || (item.toppings && item.toppings.length > 0) || item.notes) && (
                            <div className="text-xs text-[#8C7B6E] mt-1 space-y-0.5 ml-5">
                              {item.options && item.options.map((opt, oIdx) => (
                                <div key={oIdx}>• Option: {opt}</div>
                              ))}
                              {item.toppings && item.toppings.map((top, tIdx) => (
                                <div key={tIdx}>• Topping: {top}</div>
                              ))}
                              {item.notes && <div className="text-gray-500 italic">Ghi chú: {item.notes}</div>}
                            </div>
                          )}
                        </div>
                        <div className="text-right font-semibold text-[#2C1A0E]">
                          {(item.subtotal ?? 0).toLocaleString("vi-VN")}₫
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Order Info (Branch / Address / Payment) */}
              <div className="py-4 border-t border-b border-gray-100 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h5 className="font-bold text-gray-500 uppercase mb-1">Phương thức thanh toán</h5>
                  <p className="text-gray-900 font-semibold">{selectedOrder.paymentMethod || "Chưa chọn"}</p>
                  <p className="text-gray-500 mt-0.5">Trạng thái: {selectedOrder.paymentStatus}</p>
                </div>
                <div>
                  <h5 className="font-bold text-gray-500 uppercase mb-1">Chi nhánh</h5>
                  <p className="text-gray-900 font-semibold">{selectedOrder.branchName || "TraPhe Center"}</p>
                </div>
                <div className="col-span-2">
                  <h5 className="font-bold text-gray-500 uppercase mb-1">Loại đơn hàng</h5>
                  <p className="text-gray-900 font-semibold">
                    {selectedOrder.orderType === "DRINK_DELIVERY" ? "Giao hàng tận nơi (Delivery)" : selectedOrder.orderType === "DRINK_PICKUP" ? "Đến lấy tại quầy (Pickup)" : "Đơn hàng Merchandise"}
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="py-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Tạm tính</span>
                  <span>{(selectedOrder.subtotal ?? 0).toLocaleString("vi-VN")}₫</span>
                </div>
                {selectedOrder.totalDiscount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Khuyến mãi</span>
                    <span>-{(selectedOrder.totalDiscount ?? 0).toLocaleString("vi-VN")}₫</span>
                  </div>
                )}
                {selectedOrder.shippingFee !== null && selectedOrder.shippingFee > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Phí vận chuyển</span>
                    <span>{(selectedOrder.shippingFee ?? 0).toLocaleString("vi-VN")}₫</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base text-espresso pt-2 border-t border-gray-100">
                  <span>Tổng tiền</span>
                  <span>{(selectedOrder.finalAmount ?? 0).toLocaleString("vi-VN")}₫</span>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-grow border-[#D4C9BC] hover:bg-[#F5EAD8] text-gray-700 rounded-xl"
                >
                  Đóng
                </Button>
                {selectedOrder.status !== "CANCELLED" && selectedOrder.status !== "COMPLETED" && (
                  <Button
                    onClick={async () => {
                      try {
                        const res = await orderService.cancelOrder(selectedOrder.orderId);
                        if (res.statusCode === 200) {
                          toast.success("Đã huỷ đơn hàng thành công.");
                          setSelectedOrder(null);
                          // Refresh orders
                          const refreshRes = await orderService.getMyOrders({ page: 0, size: 50 });
                          if (refreshRes.data) setOrders(refreshRes.data.content);
                        }
                      } catch (error: any) {
                        toast.error(error.response?.data?.message || "Không thể huỷ đơn hàng này");
                      }
                    }}
                    className="flex-grow bg-white border border-red-200 hover:bg-red-50 hover:text-red-700 text-red-600 rounded-xl"
                  >
                    Huỷ đơn hàng
                  </Button>
                )}
                {selectedOrder.status !== "CANCELLED" && selectedOrder.status !== "COMPLETED" && selectedOrder.paymentStatus === "PENDING" && selectedOrder.paymentUrl && (
                  <Button
                    onClick={() => handlePayment(selectedOrder.paymentUrl!)}
                    className="flex-grow bg-[#A0622A] hover:bg-[#854d1d] text-white rounded-xl flex items-center justify-center gap-1.5"
                  >
                    Thanh toán ngay
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
                {selectedOrder.status === "COMPLETED" && (
                  <Button
                    onClick={() => {
                      setSelectedOrder(null);
                      handleReorder(selectedOrder);
                    }}
                    className="flex-grow bg-[#5C3317] hover:bg-[#2C1A0E] text-white rounded-xl"
                  >
                    Đặt lại đơn này
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
