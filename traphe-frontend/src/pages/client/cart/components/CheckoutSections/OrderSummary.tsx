import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Tag, X, Ticket } from "lucide-react";
import type { CartItem } from "@/types/cart.types";
import type { PromotionResponse } from "@/services/promotion.service";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  couponCode: string;
  onChangeCoupon: (code: string) => void;
  isApplyingCoupon: boolean;
  availablePromotions: PromotionResponse[];
  isLoadingPromotions: boolean;
  displayTotal: number;
  onApplyCoupon: (code?: string) => void;
  onRemoveCoupon: () => void;
  onPlaceOrder: () => void;
  isPlacingOrder: boolean;
  isGuest?: boolean;
}

export default function OrderSummary({
  items,
  subtotal,
  shippingFee,
  discountAmount,
  couponCode,
  onChangeCoupon,
  isApplyingCoupon,
  availablePromotions,
  isLoadingPromotions,
  displayTotal,
  onApplyCoupon,
  onRemoveCoupon,
  onPlaceOrder,
  isPlacingOrder,
  isGuest = false,
}: OrderSummaryProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 lg:p-8 sticky top-24">
      <h2 className="text-xl font-bold mb-6 text-gray-900">Order Summary</h2>

      <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 items-start py-2 border-b border-gray-200 last:border-0 border-dashed"
          >
            <div className="relative w-12 h-12 bg-white border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
              {item.productImageUrl ? (
                <img
                  src={item.productImageUrl}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[10px] text-gray-400">Img</span>
              )}
              <span className="absolute -top-1.5 -right-1.5 bg-gray-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-gray-900 truncate">
                {item.productName}
              </h4>
              <p className="text-[10px] text-gray-500">{item.variantName}</p>
            </div>
            <div className="text-xs font-bold text-gray-900">
              {item.subtotal.toLocaleString("vi-VN")}₫
            </div>
          </div>
        ))}
      </div>

      {/* Coupon Input */}
      {!isGuest && (
        <div className="mb-6 space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase block">
            Coupon Code
          </label>
          {discountAmount > 0 ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-2 text-green-700">
                <Tag className="w-4 h-4" />
                <span className="text-sm font-medium">{couponCode}</span>
              </div>
              <button
                onClick={onRemoveCoupon}
                className="text-green-700 hover:text-green-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter code"
                value={couponCode}
                onChange={(e) => onChangeCoupon(e.target.value)}
                className="bg-white"
              />
              <Button
                variant="outline"
                onClick={() => onApplyCoupon()}
                disabled={isApplyingCoupon || !couponCode}
              >
                {isApplyingCoupon ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
          )}

          {!discountAmount && availablePromotions.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                <Ticket className="w-3 h-3" /> Available Vouchers
              </p>
              <ScrollArea className="h-[120px] rounded-md border p-2 bg-white">
                <div className="space-y-2">
                  {isLoadingPromotions ? (
                    <div className="text-center py-2">
                      <Loader2 className="w-4 h-4 animate-spin mx-auto text-gray-400" />
                    </div>
                  ) : (
                    availablePromotions.map((promo) => (
                      <div
                        key={promo.id}
                        onClick={() => onApplyCoupon(promo.code)}
                        className="flex items-center justify-between p-2 rounded-md border border-dashed border-gray-200 hover:border-black hover:bg-gray-50 cursor-pointer transition-all group"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-gray-900 group-hover:text-black">
                            {promo.code}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {promo.type === "PERCENTAGE"
                              ? `Giảm ${promo.value ?? 0}%`
                              : `Giảm ${(promo.value ?? 0).toLocaleString()}₫`}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-gray-100 group-hover:bg-black group-hover:text-white pointer-events-none"
                        >
                          Apply
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}

      <Separator className="bg-gray-200 mb-6" />

      <div className="space-y-3 text-sm text-gray-600 mb-6">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{subtotal.toLocaleString("vi-VN")}₫</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>
            {shippingFee ? shippingFee.toLocaleString("vi-VN") + "₫" : "Free"}
          </span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Discount</span>
            <span>-{discountAmount.toLocaleString("vi-VN")}₫</span>
          </div>
        )}
      </div>
      <div className="flex justify-between items-end mb-8">
        <span className="text-base font-medium text-gray-900">Total</span>
        <span className="text-2xl font-bold text-gray-900">
          {displayTotal.toLocaleString("vi-VN")}₫
        </span>
      </div>

      <Button
        onClick={onPlaceOrder}
        disabled={isPlacingOrder}
        className="w-full bg-black hover:bg-gray-800 text-white h-14 text-lg font-medium rounded-lg cursor-pointer"
      >
        {isPlacingOrder ? <Loader2 className="animate-spin" /> : "Place Order"}
      </Button>
    </div>
  );
}
