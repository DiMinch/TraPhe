import { Button } from "@/components/ui/button";
import { userOrders } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

export default function OrderTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold mb-6">Orders History</h2>
      <div className="hidden md:grid grid-cols-12 gap-4 border-b border-gray-200 pb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
        <div className="col-span-3">Number ID</div>
        <div className="col-span-3">Date</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2 text-right">Price</div>
        <div className="col-span-2"></div>
      </div>

      <div className="space-y-4 md:space-y-0">
        {userOrders.map((order) => (
          <div
            key={order.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-4 border-b border-gray-100 md:hover:bg-gray-50 transition-colors"
          >
            <div className="col-span-3 font-semibold text-sm text-gray-900 flex justify-between md:block">
              <span className="md:hidden text-gray-500 font-normal">ID:</span>
              {order.id}
            </div>
            <div className="col-span-3 text-sm text-gray-600 flex justify-between md:block">
              <span className="md:hidden text-gray-500">Date:</span>
              {order.date}
            </div>
            <div className="col-span-2 flex justify-between md:block">
              <span className="md:hidden text-gray-500">Status:</span>
              <Badge
                variant={order.status === "Delivered" ? "default" : "secondary"}
                className={
                  order.status === "Delivered"
                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                }
              >
                {order.status}
              </Badge>
            </div>
            <div className="col-span-2 text-sm font-bold text-gray-900 text-right flex justify-between md:block">
              <span className="md:hidden text-gray-500 font-normal">
                Total:
              </span>
              {order.total.toLocaleString("vi-VN")}₫
            </div>
            <div className="col-span-2 text-right hidden md:block">
              <Button
                variant="ghost"
                size="sm"
                className="text-black hover:bg-transparent hover:underline"
              >
                View Item <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="md:hidden col-span-1 mt-2">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
