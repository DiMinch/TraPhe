import { Button } from "@/components/ui/button";
import { cartItems } from "@/data/mockData";
import { useNavigate } from "react-router";
import {
  CheckCircle2,
  Package,
  CalendarDays,
  Receipt,
  CreditCard,
} from "lucide-react";

export default function OrderCompleteStep() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center animate-in fade-in duration-500">
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
        Thank you for shopping with VITI. We have received your order and will
        begin processing it right away.
      </p>

      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-10">
        <div className="bg-gray-50 border-b border-gray-100 p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                <Package className="w-4 h-4" /> Order Code
              </div>
              <p className="font-bold text-sm md:text-base text-gray-900 break-all">
                #ORD-8291
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                <CalendarDays className="w-4 h-4" /> Date
              </div>
              <p className="font-bold text-sm md:text-base text-gray-900">
                Oct 19, 2023
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                <Receipt className="w-4 h-4" /> Total
              </div>
              <p className="font-bold text-sm md:text-base text-gray-900">
                58.970.000₫
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                <CreditCard className="w-4 h-4" /> Payment
              </div>
              <p className="font-bold text-sm md:text-base text-gray-900">
                Credit Card
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm md:text-base">
            Order Items ({cartItems.length})
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
            {cartItems.map((item) => (
              <div key={item.id} className="group relative w-full">
                <div className="aspect-3/4 w-full bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden transition-transform group-hover:border-black/20">
                  <span className="text-[10px] md:text-xs text-gray-400 font-medium select-none">
                    Img
                  </span>
                </div>

                <div className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-10">
                  {item.quantity}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
        <Button
          onClick={() => navigate("/products")}
          className="bg-black hover:bg-gray-800 text-white rounded-full h-12 md:h-14 px-8 text-sm md:text-base font-medium shadow-lg hover:shadow-xl transition-all w-full sm:w-auto cursor-pointer"
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
