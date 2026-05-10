import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Truck,
  Loader2,
  MapPin,
  Plus,
  Wallet,
  CreditCard,
  Tag,
  X,
  Ticket,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { orderService, type OrderResponse } from "@/services/order.service";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import {
  promotionService,
  type PromotionResponse,
} from "@/services/promotion.service";
import type { UserAddress } from "@/types/user.types";
import AddressDialog from "@/components/common/address/AddressDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface CheckoutStepProps {
  onNext: () => void;
  onOrderSuccess: (order: OrderResponse) => void;
}

export default function CheckoutStep({
  onNext,
  onOrderSuccess,
}: CheckoutStepProps) {
  const { cart, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "banking">("cod");
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPromotionId, setAppliedPromotionId] = useState<string | null>(
    null,
  );
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [availablePromotions, setAvailablePromotions] = useState<
    PromotionResponse[]
  >([]);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false);

  const user = authService.getCurrentUser();

  const fetchAddresses = async (selectNewId?: string) => {
    if (!user) return;
    setIsLoadingAddresses(true);
    try {
      const res = await userService.getAddresses();
      if (res.statusCode === 200 && res.data) {
        setSavedAddresses(res.data);
        if (selectNewId) {
          setSelectedAddressId(selectNewId);
        } else if (!selectedAddressId) {
          const defaultAddr = res.data.find((a) => a.isPrimary);
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
          else if (res.data.length > 0) setSelectedAddressId(res.data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load addresses", error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const fetchPromotions = async () => {
    setIsLoadingPromotions(true);
    try {
      const res = await promotionService.getActivePromotions();
      if (res.statusCode === 200 && res.data) {
        const promotions = Array.isArray(res.data)
          ? res.data
          : (res.data as any).content || [];
        setAvailablePromotions(promotions);
      }
    } catch (error) {
      console.error("Failed to load promotions", error);
    } finally {
      setIsLoadingPromotions(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    fetchPromotions();
  }, []);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = codeToApply || couponCode;

    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }
    if (!cart?.items || cart.items.length === 0) return;

    if (codeToApply) setCouponCode(codeToApply);

    setIsApplyingCoupon(true);
    try {
      const payload = {
        items: cart.items.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          unitPrice: item.currentPrice || 0,
        })),
        code: code,
        customerId: user?.id,
      };

      const res = await promotionService.calculateCartDiscount(payload);

      if (res.statusCode === 200 && res.data) {
        if (res.data.totalDiscount > 0) {
          setDiscountAmount(res.data.totalDiscount);
          if (res.data.appliedPromotions.length > 0) {
            setAppliedPromotionId(res.data.appliedPromotions[0].promotionId);
          }
          toast.success(
            `Applied! Saved ${res.data.totalDiscount.toLocaleString()}₫`,
          );
        } else {
          toast.info(
            "Coupon is valid but no discount applicable for these items.",
          );
          setDiscountAmount(0);
          setAppliedPromotionId(null);
        }
      }
    } catch (error: any) {
      setDiscountAmount(0);
      setAppliedPromotionId(null);
      toast.error(error.response?.data?.message || "Invalid coupon code");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setDiscountAmount(0);
    setAppliedPromotionId(null);
    toast.info("Coupon removed");
  };

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!selectedAddressId) {
      toast.warning("Please select a shipping address");
      return;
    }

    setIsLoading(true);
    try {
      const orderItems = cart.items.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        unitPrice: item.currentPrice || 0,
        discount: 0,
      }));

      const res = await orderService.createOrder({
        customerId: user?.id,
        items: orderItems,
        orderType: paymentMethod === "cod" ? "ONLINE_COD" : "ONLINE_TRANSFER",
        paymentMethod: paymentMethod === "cod" ? "COD" : "TRANSFER",
        addressId: selectedAddressId,
        loyaltyPointsToUse: 0,
        promotionIds: appliedPromotionId ? [appliedPromotionId] : [],
      });

      if (res.statusCode === 200 || res.statusCode === 201) {
        await clearCart();
        onOrderSuccess(res.data);
        onNext();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  const cartSubtotal = cart?.totalAmount || 0;
  const shippingFee = 0;
  const total = Math.max(0, cartSubtotal + shippingFee - discountAmount);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12">
      <div className="lg:col-span-7 space-y-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-black" />
            <h3 className="font-bold text-lg text-gray-900">
              Shipping Address
            </h3>
          </div>

          {isLoadingAddresses ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
            </div>
          ) : (
            <RadioGroup
              value={selectedAddressId}
              onValueChange={setSelectedAddressId}
              className="space-y-4"
            >
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={cn(
                    "relative flex items-start space-x-4 border rounded-lg p-4 cursor-pointer transition-all",
                    selectedAddressId === addr.id
                      ? "border-black bg-gray-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <RadioGroupItem
                    value={addr.id}
                    id={addr.id}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={addr.id}
                      className="font-semibold text-base cursor-pointer"
                    >
                      {addr.type} - {addr.contactName || user?.fullName}
                      {addr.isPrimary && (
                        <span className="ml-2 text-xs font-normal text-gray-500 bg-white border px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </Label>
                    <p className="text-sm text-gray-600">
                      {addr.contactPhone || user?.phone}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {addr.detailAddress}
                    </p>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => setIsAddressDialogOpen(true)}
                className="w-full border-dashed border-gray-300 text-gray-600 hover:text-black hover:border-black h-12 flex items-center gap-2 mt-2"
              >
                <Plus className="w-4 h-4" /> Ship to a different address
              </Button>
            </RadioGroup>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Wallet className="w-5 h-5 text-black" />
            <h3 className="font-bold text-lg text-gray-900">Payment Method</h3>
          </div>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(v: "cod" | "banking") => setPaymentMethod(v)}
            className="space-y-3"
          >
            <div
              className={cn(
                "flex items-center justify-between border rounded-lg px-4 py-4 cursor-pointer",
                paymentMethod === "cod" && "border-black bg-gray-50",
              )}
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="cursor-pointer font-medium">
                  Cash on Delivery (COD)
                </Label>
              </div>
              <Truck className="w-5 h-5 text-gray-400" />
            </div>
            <div
              className={cn(
                "flex items-center justify-between border rounded-lg px-4 py-4 cursor-pointer",
                paymentMethod === "banking" && "border-black bg-gray-50",
              )}
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="banking" id="banking" />
                <Label htmlFor="banking" className="cursor-pointer font-medium">
                  Internet Banking / QR Code
                </Label>
              </div>
              <CreditCard className="w-5 h-5 text-gray-400" />
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 lg:p-8 sticky top-24">
          <h2 className="text-xl font-bold mb-6 text-gray-900">
            Order Summary
          </h2>

          <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {cart?.items.map((item) => (
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
                  <p className="text-[10px] text-gray-500">
                    {item.variantName}
                  </p>
                </div>
                <div className="text-xs font-bold text-gray-900">
                  {item.subtotal.toLocaleString("vi-VN")}₫
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6 space-y-3">
            <Label className="text-xs font-bold text-gray-500 uppercase block">
              Coupon Code
            </Label>
            {discountAmount > 0 ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-2 text-green-700">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm font-medium">{couponCode}</span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
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
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="bg-white"
                />
                <Button
                  variant="outline"
                  onClick={() => handleApplyCoupon()}
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
                          onClick={() => handleApplyCoupon(promo.code)}
                          className="flex items-center justify-between p-2 rounded-md border border-dashed border-gray-200 hover:border-black hover:bg-gray-50 cursor-pointer transition-all group"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-gray-900 group-hover:text-black">
                              {promo.code}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {promo.type === "PERCENTAGE"
                                ? `Giảm ${promo.value}%`
                                : `Giảm ${promo.value.toLocaleString()}₫`}
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

          <Separator className="bg-gray-200 mb-6" />

          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{cartSubtotal.toLocaleString("vi-VN")}₫</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
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
              {total.toLocaleString("vi-VN")}₫
            </span>
          </div>

          <Button
            onClick={handlePlaceOrder}
            disabled={isLoading}
            className="w-full bg-black hover:bg-gray-800 text-white h-14 text-lg font-medium rounded-lg cursor-pointer"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Place Order"}
          </Button>
        </div>
      </div>

      <AddressDialog
        open={isAddressDialogOpen}
        onOpenChange={setIsAddressDialogOpen}
        onSuccess={(newAddr) => fetchAddresses(newAddr?.id)}
      />
    </div>
  );
}
