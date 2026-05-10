import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, PackageX, ShoppingBag } from "lucide-react";
import { orderService, type OrderResponse } from "@/services/order.service";
import { format } from "date-fns";
import { useNavigate } from "react-router";

const getStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-700 hover:bg-green-100 border-green-200";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200";
    case "CANCELLED":
      return "bg-red-100 text-red-700 hover:bg-red-100 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200";
  }
};

export default function OrderTab() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = await orderService.getMyOrders({ page: 0, size: 20 });
        if (res.statusCode === 200 && res.data) {
          setOrders(res.data.content);
        }
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold mb-6">Orders History</h2>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <PackageX className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No orders yet
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            You haven't placed any orders yet.
          </p>
          <Button
            onClick={() => navigate("/products")}
            className="bg-black text-white hover:bg-gray-800"
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <>
          <div className="hidden md:grid grid-cols-12 gap-4 border-b border-gray-200 pb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">Order Number</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-2"></div>
          </div>

          <div className="space-y-4 md:space-y-0">
            {orders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-4 border-b border-gray-100 md:hover:bg-gray-50 transition-colors group"
              >
                <div className="col-span-3 font-semibold text-sm text-gray-900 flex justify-between md:block">
                  <span className="md:hidden text-gray-500 font-normal">
                    Order #:
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-100 rounded md:hidden lg:block">
                      <ShoppingBag className="w-4 h-4 text-gray-500" />
                    </div>
                    <span>{order.orderNumber}</span>
                  </div>
                </div>
                <div className="col-span-3 text-sm text-gray-600 flex justify-between md:block">
                  <span className="md:hidden text-gray-500">Date:</span>
                  {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")}
                </div>
                <div className="col-span-2 flex justify-between md:block">
                  <span className="md:hidden text-gray-500">Status:</span>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(order.status)} border px-2 py-0.5 rounded-full font-medium`}
                  >
                    {order.status}
                  </Badge>
                </div>
                <div className="col-span-2 text-sm font-bold text-gray-900 text-right flex justify-between md:block">
                  <span className="md:hidden text-gray-500 font-normal">
                    Total:
                  </span>
                  {order.finalAmount.toLocaleString("vi-VN")}₫
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
