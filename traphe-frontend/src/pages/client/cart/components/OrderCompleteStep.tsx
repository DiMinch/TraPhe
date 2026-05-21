import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import {
  CheckCircle2,
  Package,
  CalendarDays,
  Receipt,
  CreditCard,
} from "lucide-react";
import type { OrderResponse } from "@/services/order.service";
import { format } from "date-fns";

interface OrderCompleteStepProps {
  order?: OrderResponse | null;
}

export default function OrderCompleteStep({ order }: OrderCompleteStepProps) {
  const navigate = useNavigate();

  if (!order) {
    return (
      <div className="text-center py-20 animate-in fade-in duration-500">
        <div className="mb-4 text-gray-300">
          <Package className="w-16 h-16 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          No order details found
        </h2>
        <p className="text-gray-500 mt-2 mb-6">
          Your session might have expired or you refreshed the page.
        </p>
        <Button
          onClick={() => navigate("/menu")}
          className="bg-black text-white hover:bg-gray-800"
        >
          Back to Shop
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center animate-in fade-in duration-500">
      <div className="mb-6 animate-in zoom-in duration-500 delay-150">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
          <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-[#38CB89]" />
        </div>
      </div>

      <h2 className="text-xs md:text-sm font-bold text-[#38CB89] uppercase tracking-wider mb-2">
        Success
      </h2>
      <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4 text-center">
        Your order is confirmed!
      </h1>
      <p className="text-sm md:text-base text-gray-500 text-center max-w-md mb-8 md:mb-10 px-4">
        Thank you for shopping with VITI. We have received your order{" "}
        <b className="text-black">#{order.orderNumber}</b> and will begin
        processing it right away.
      </p>

      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-10">
        <div className="bg-gray-50 border-b border-gray-100 p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <Package className="w-4 h-4" /> Order Code
              </div>
              <p className="font-bold text-sm md:text-base text-gray-900 break-words">
                #{order.orderNumber}
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <CalendarDays className="w-4 h-4" /> Date
              </div>
              <p className="font-bold text-sm md:text-base text-gray-900">
                {order.createdAt
                  ? format(new Date(order.createdAt), "MMM dd, yyyy")
                  : "N/A"}
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <Receipt className="w-4 h-4" /> Total
              </div>
              <p className="font-bold text-sm md:text-base text-gray-900">
                {order.finalAmount.toLocaleString("vi-VN")}₫
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <CreditCard className="w-4 h-4" /> Payment
              </div>
              <p className="font-bold text-sm md:text-base text-gray-900 capitalize">
                {(order.paymentMethod || "N/A").replace("_", " ").toLowerCase()}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <h3 className="font-semibold text-gray-900 mb-6 text-sm md:text-lg">
            Order Items ({order.items.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="group relative w-full flex flex-col gap-3"
              >
                <div className="aspect-square w-full bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-black/20 group-hover:shadow-md relative">
                  <Package className="w-8 h-8 text-slate-400" />

                  <div className="absolute top-2 right-2 bg-black text-white text-[10px] font-bold h-6 w-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-10">
                    {item.quantity}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-black transition-colors">
                    {item.menuItemName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {item.sizeName || "Default Size"}
                  </p>
                  <p className="text-sm font-bold text-black pt-1">
                    {item.unitPrice.toLocaleString("vi-VN")}₫
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
        <Button
          onClick={() => navigate("/menu")}
          className="bg-black hover:bg-gray-800 text-white rounded-full h-12 md:h-14 px-10 text-sm md:text-base font-medium shadow-lg hover:shadow-xl transition-all w-full sm:w-auto cursor-pointer"
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
