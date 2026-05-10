import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import {
  orderService,
  type OrderResponse,
  type CreateOrderRequest,
} from "@/services/order.service";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import {
  promotionService,
  type PromotionResponse,
} from "@/services/promotion.service";
import type { UserAddress } from "@/types/user.types";
import AddressDialog from "@/components/common/address/AddressDialog";
import ShippingAddress from "./CheckoutSections/ShippingAddress";
import PaymentMethod from "./CheckoutSections/PaymentMethod";
import OrderSummary from "./CheckoutSections/OrderSummary";

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
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [calculatedFinalAmount, setCalculatedFinalAmount] = useState<
    number | null
  >(null);
  const [appliedPromotionIds, setAppliedPromotionIds] = useState<string[]>([]);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [availablePromotions, setAvailablePromotions] = useState<
    PromotionResponse[]
  >([]);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false);

  const user = authService.getCurrentUser();
  const isGuest = !user;

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
          else setSelectedAddressId("new_address");
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
    if (!isGuest) {
      fetchAddresses();
      setGuestInfo((prev) => ({
        ...prev,
        name: user.fullName || "",
        phone: user.phone || "",
        email: user.email || "",
      }));
    } else {
      setSelectedAddressId("new_address");
    }
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

      if (res.data) {
        const data = res.data;
        if (data.totalDiscount > 0) {
          setDiscountAmount(data.totalDiscount);
          setCalculatedFinalAmount(data.finalAmount);

          const promoIds: string[] = [];
          if (data.orderPromotion)
            promoIds.push(data.orderPromotion.promotionId);
          setAppliedPromotionIds([...new Set(promoIds)]);

          toast.success(
            `Applied! Saved ${data.totalDiscount.toLocaleString()}₫`,
          );
        } else {
          toast.info("Coupon is valid but no discount applicable.");
          resetCouponState();
        }
      }
    } catch (error: any) {
      resetCouponState();
      toast.error(
        error.response?.data?.message || "Invalid or expired coupon code",
      );
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const resetCouponState = () => {
    setDiscountAmount(0);
    setCalculatedFinalAmount(null);
    setAppliedPromotionIds([]);
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    resetCouponState();
    toast.info("Coupon removed");
  };

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const isUsingNewAddress = selectedAddressId === "new_address" || isGuest;

    if (isUsingNewAddress) {
      if (!guestInfo.name || !guestInfo.phone || !guestInfo.address) {
        toast.warning(
          "Please fill in all shipping details (Name, Phone, Address)",
        );
        return;
      }
    } else if (!selectedAddressId) {
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

      const payload: CreateOrderRequest = {
        items: orderItems,
        orderType: paymentMethod === "cod" ? "ONLINE_COD" : "ONLINE_TRANSFER",
        paymentMethod: paymentMethod === "cod" ? "COD" : "TRANSFER",
        loyaltyPointsToUse: 0,
        promotionIds: appliedPromotionIds,
      };

      if (isUsingNewAddress) {
        payload.guestName = guestInfo.name;
        payload.guestPhone = guestInfo.phone;
        payload.guestEmail = guestInfo.email;
        payload.shippingAddress = guestInfo.address;

        if (!isGuest) {
          payload.customerId = user?.id;
        }
      } else {
        payload.customerId = user?.id;
        payload.addressId = selectedAddressId;
      }

      const res = await orderService.createOrder(payload);

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
  const displayTotal =
    calculatedFinalAmount !== null
      ? calculatedFinalAmount
      : Math.max(0, cartSubtotal + shippingFee - discountAmount);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12">
      <div className="lg:col-span-7 space-y-8">
        <ShippingAddress
          isGuest={isGuest}
          savedAddresses={savedAddresses}
          selectedAddressId={selectedAddressId}
          isLoadingAddresses={isLoadingAddresses}
          onSelectAddress={setSelectedAddressId}
          onAddAddress={() => setIsAddressDialogOpen(true)}
          guestInfo={guestInfo}
          setGuestInfo={setGuestInfo}
        />
        <PaymentMethod
          paymentMethod={paymentMethod}
          onChange={(v) => setPaymentMethod(v)}
        />
      </div>

      <div className="lg:col-span-5">
        <OrderSummary
          items={cart?.items || []}
          subtotal={cartSubtotal}
          shippingFee={shippingFee}
          discountAmount={discountAmount}
          couponCode={couponCode}
          onChangeCoupon={setCouponCode}
          isApplyingCoupon={isApplyingCoupon}
          availablePromotions={availablePromotions}
          isLoadingPromotions={isLoadingPromotions}
          displayTotal={displayTotal}
          onApplyCoupon={(code?: string) => handleApplyCoupon(code)}
          onRemoveCoupon={handleRemoveCoupon}
          onPlaceOrder={handlePlaceOrder}
          isPlacingOrder={isLoading}
          isGuest={isGuest}
        />
      </div>

      {!isGuest && (
        <AddressDialog
          open={isAddressDialogOpen}
          onOpenChange={setIsAddressDialogOpen}
          onSuccess={(newAddr) => fetchAddresses(newAddr?.id)}
        />
      )}
    </div>
  );
}
