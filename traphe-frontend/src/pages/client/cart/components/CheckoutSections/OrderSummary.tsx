import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Tag, X, Ticket, ArrowRight } from "lucide-react";
import type { CartItem } from "@/types/cart.types";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  couponCode: string;
  onChangeCoupon: (code: string) => void;
  isApplyingCoupon: boolean;
  availablePromotions: any[];
  isLoadingPromotions: boolean;
  displayTotal: number;
  onApplyCoupon: (code?: string) => void;
  onRemoveCoupon: () => void;
  onPlaceOrder: () => void;
  isPlacingOrder: boolean;
  isGuest?: boolean;
  pointsAvailable?: number;
  pointsUsed?: number;
  onChangePointsUsed?: (points: number) => void;
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
  pointsAvailable = 0,
  pointsUsed = 0,
  onChangePointsUsed,
}: OrderSummaryProps) {
  const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const publicPromotions = availablePromotions.filter((p) => !p.isMyVoucher);
  const myVouchers = availablePromotions.filter((p) => p.isMyVoucher);

  return (
    <div className="bg-surface-container-lowest border border-admin-border rounded-xl p-6 lg:p-8 sticky top-24 shadow-sm font-ui-body">
      <h2 className="font-heading-lg text-heading-lg text-roast mb-6 pb-4 border-b border-mist">Order Summary</h2>

      <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar divide-y divide-mist/30">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`flex gap-4 items-start ${idx > 0 ? "pt-4" : ""}`}
          >
            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-mist shadow-sm bg-foam flex items-center justify-center text-xs text-dust">
              {item.menuItemImageUrl ? (
                <img
                  src={item.menuItemImageUrl}
                  alt={item.menuItemName}
                  className="w-full h-full object-cover"
                />
              ) : (
                "Img"
              )}
            </div>
            <div className="flex-1 flex flex-col justify-between min-h-[64px]">
              <div className="flex justify-between items-start gap-2">
                <span className="font-ui-heading text-[15px] text-roast leading-tight">{item.menuItemName}</span>
                <span className="font-ui-body text-sm font-bold text-roast shrink-0">
                  {item.subtotal.toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="text-[12px] text-smoke leading-snug">
                {item.sizeName && <span>Size: {item.sizeName}</span>}
                {item.selectedToppings && item.selectedToppings.length > 0 && (
                  <span className="block mt-0.5">
                    +{item.selectedToppings.map(t => t.toppingName).join(", ")}
                  </span>
                )}
              </div>
              <div className="font-ui-body text-[12px] text-roast mt-1 font-medium">Qty: {item.quantity}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon Input */}
      {!isGuest && (
        <div className="mb-6 space-y-3 pt-4 border-t border-mist/30">
          <label className="font-ui-heading text-xs font-bold text-smoke uppercase tracking-wider block">
            Voucher / Coupon Code
          </label>
          {discountAmount > 0 ? (
            <div className="flex items-center justify-between bg-cream border border-roast/20 rounded-lg p-3 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-2 text-roast">
                <Tag className="w-4 h-4" />
                <span className="text-sm font-semibold">{couponCode}</span>
              </div>
              <button
                onClick={onRemoveCoupon}
                className="text-roast hover:text-espresso cursor-pointer p-1 hover:bg-foam rounded-full transition-colors"
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
                className="bg-foam border-mist focus:border-roast focus:ring-roast rounded-lg text-sm text-roast font-ui-body"
              />
              <Button
                variant="outline"
                onClick={() => onApplyCoupon()}
                disabled={isApplyingCoupon || !couponCode}
                className="border-roast text-roast hover:bg-cream rounded-lg transition-colors cursor-pointer"
              >
                {isApplyingCoupon ? (
                  <Loader2 className="w-4 h-4 animate-spin text-roast" />
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
          )}

          {!discountAmount && availablePromotions.length > 0 && (
            <div className="mt-4">
              <p className="font-ui-heading text-xs font-bold text-smoke uppercase tracking-wider mb-2 flex items-center gap-1">
                <Ticket className="w-3.5 h-3.5" /> Available Vouchers
              </p>
              <ScrollArea className="h-[120px] rounded-lg border border-mist/30 p-2 bg-foam">
                <div className="space-y-2">
                  {isLoadingPromotions ? (
                    <div className="text-center py-2">
                      <Loader2 className="w-4 h-4 animate-spin mx-auto text-roast" />
                    </div>
                  ) : (
                    <>
                      {publicPromotions.map((promo) => (
                        <div
                          key={promo.id}
                          onClick={() => onApplyCoupon(promo.code)}
                          className="flex items-center justify-between p-2 rounded-md border border-dashed border-mist/50 hover:border-roast hover:bg-cream cursor-pointer transition-all group"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-roast group-hover:text-espresso">
                              {promo.code}
                            </span>
                            <span className="text-[10px] text-smoke">
                              {promo.discountType === "PERCENTAGE"
                                ? `Giảm ${promo.discountValue ?? 0}%`
                                : `Giảm ${(promo.discountValue ?? 0).toLocaleString()}₫`}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-cream text-roast border border-roast/10 group-hover:bg-roast group-hover:text-white pointer-events-none transition-colors"
                          >
                            Apply
                          </Badge>
                        </div>
                      ))}

                      {myVouchers.length > 0 && (
                        <>
                          <div className="flex items-center gap-2 py-1">
                            <div className="h-px bg-mist/50 flex-1"></div>
                            <span className="text-[10px] font-bold text-dust uppercase tracking-wider">My Vouchers</span>
                            <div className="h-px bg-mist/50 flex-1"></div>
                          </div>
                          {myVouchers.map((promo) => (
                            <div
                              key={promo.id}
                              onClick={() => onApplyCoupon(promo.code)}
                              className="flex items-center justify-between p-2 rounded-md border border-solid border-roast/30 bg-white hover:border-roast hover:bg-cream cursor-pointer transition-all group"
                            >
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-bold text-roast group-hover:text-espresso">
                                  {promo.code}
                                </span>
                                <span className="text-[10px] text-smoke">
                                  {promo.discountType === "PERCENTAGE"
                                    ? `Giảm ${promo.discountValue ?? 0}%`
                                    : `Giảm ${(promo.discountValue ?? 0).toLocaleString()}₫`}
                                </span>
                              </div>
                              <Badge
                                variant="secondary"
                                className="text-[10px] bg-roast text-white border border-roast/10 group-hover:bg-espresso pointer-events-none transition-colors"
                              >
                                Apply
                              </Badge>
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}

      {/* Loyalty Points Section */}
      {!isGuest && pointsAvailable > 0 && (
        <div className="mb-6 space-y-3 pt-4 border-t border-mist/30">
          <label className="font-ui-heading text-xs font-bold text-smoke uppercase tracking-wider block">
            Redeem Loyalty Points
          </label>
          <div className="bg-foam border border-mist/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-smoke">Available Points:</span>
              <span className="text-roast font-bold">{pointsAvailable} pts</span>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                max={Math.min(pointsAvailable, Math.floor(Math.max(0, subtotal + shippingFee - discountAmount) / 1000))}
                placeholder="Points to use"
                value={pointsUsed || ""}
                onChange={(e) => {
                  const maxPointsAllowed = Math.min(pointsAvailable, Math.floor(Math.max(0, subtotal + shippingFee - discountAmount) / 1000));
                  const val = Math.min(maxPointsAllowed, Math.max(0, parseInt(e.target.value) || 0));
                  onChangePointsUsed?.(val);
                }}
                className="bg-white border-mist focus:border-roast focus:ring-roast rounded-lg text-sm text-roast font-ui-body"
              />
              <Button
                variant="outline"
                onClick={() => {
                  const maxPointsAllowed = Math.min(pointsAvailable, Math.floor(Math.max(0, subtotal + shippingFee - discountAmount) / 1000));
                  onChangePointsUsed?.(maxPointsAllowed);
                }}
                className="border-roast text-roast hover:bg-cream rounded-lg transition-colors cursor-pointer text-xs shrink-0"
              >
                Use Max
              </Button>
            </div>
            {pointsUsed > 0 && (
              <div className="text-[12px] text-latte font-medium animate-in fade-in duration-300">
                Redeeming {pointsUsed} points = -{(pointsUsed * 1000).toLocaleString("vi-VN")}₫ discount
              </div>
            )}
          </div>
        </div>
      )}

      <Separator className="bg-mist/30 mb-6" />

      {/* Calculations */}
      <div className="space-y-3 text-sm font-ui-body text-smoke mb-6">
        <div className="flex justify-between">
          <span>Subtotal ({itemsCount} items)</span>
          <span className="text-roast font-medium">{subtotal.toLocaleString("vi-VN")}₫</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Fee</span>
          <span className="text-roast font-medium">
            {shippingFee ? `${shippingFee.toLocaleString("vi-VN")}₫` : "Free"}
          </span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-latte">
            <span>Promo Discount</span>
            <span>-{discountAmount.toLocaleString("vi-VN")}₫</span>
          </div>
        )}
        {pointsUsed > 0 && (
          <div className="flex justify-between text-latte">
            <span>Loyalty Discount</span>
            <span>-{(pointsUsed * 1000).toLocaleString("vi-VN")}₫</span>
          </div>
        )}
      </div>

      <Separator className="bg-mist/30 mb-6" />

      {/* Total */}
      <div className="flex justify-between items-end mb-6">
        <span className="font-ui-heading text-ui-heading text-smoke">Total</span>
        <div className="flex flex-col items-end font-ui-body">
          <span className="text-[11px] text-smoke mb-0.5">VAT included</span>
          <span className="font-pos-total text-pos-total text-roast">
            {displayTotal.toLocaleString("vi-VN")}₫
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      <Button
        onClick={onPlaceOrder}
        disabled={isPlacingOrder}
        className="w-full bg-roast text-white font-ui-body text-[15px] font-bold py-[14px] rounded-full hover:bg-espresso transition-all duration-200 flex items-center justify-center gap-2 group shadow-sm cursor-pointer disabled:opacity-50 h-auto"
      >
        {isPlacingOrder ? (
          <Loader2 className="animate-spin text-white" />
        ) : (
          <>
            Place Order
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>

      <p className="text-center text-[11px] text-smoke mt-4 leading-relaxed font-ui-body">
        By placing your order, you agree to TraPhe's <a className="underline hover:text-roast" href="#">Terms of Service</a> and <a className="underline hover:text-roast" href="#">Privacy Policy</a>.
      </p>
    </div>
  );
}

