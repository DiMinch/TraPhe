import { useState, useEffect } from "react";
import axiosClient from "@/lib/axios-client";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import {
  orderService,
  type OrderResponse,
} from "@/services/order.service";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import {
  promotionService,
} from "@/services/promotion.service";
import type { UserAddress } from "@/types/user.types";
import type { ApiResponse } from "@/types/api.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AddressDialog from "@/components/common/address/AddressDialog";
import ShippingAddress from "./CheckoutSections/ShippingAddress";
import PaymentMethod from "./CheckoutSections/PaymentMethod";
import OrderSummary from "./CheckoutSections/OrderSummary";
import BranchSelect from "./CheckoutSections/BranchSelect";
import { ArrowLeft } from "lucide-react";

interface CheckoutStepProps {
  onNext: () => void;
  onBack: () => void;
  onOrderSuccess: (order: OrderResponse) => void;
}

export default function CheckoutStep({
  onNext,
  onBack,
  onOrderSuccess,
}: CheckoutStepProps) {
  const {
    cart,
    clearCart,
    shippingMethod,
    selectedBranchId,
    setSelectedBranchId,
    branches,
    isLoadingBranches,
    shippingFee: contextShippingFee,
    setShippingFee,
    removeItem,
  } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "vnpay" | "momo">("cod");
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
  const [calculatedFinalAmount, setCalculatedFinalAmount] = useState<number | null>(null);
  const [appliedPromotionIds, setAppliedPromotionIds] = useState<string[]>([]);
  const [appliedCodes, setAppliedCodes] = useState<string[]>([]);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [availablePromotions, setAvailablePromotions] = useState<any[]>([]);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [pointsUsed, setPointsUsed] = useState<number>(0);

  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [pendingBranchId, setPendingBranchId] = useState<string | null>(null);
  const [unavailableItems, setUnavailableItems] = useState<any[]>([]);
  const [isCheckingBranch, setIsCheckingBranch] = useState(false);

  const handleBranchSelect = async (newBranchId: string) => {
    if (newBranchId === selectedBranchId) return;

    if (!cart || cart.items.length === 0) {
      setSelectedBranchId(newBranchId);
      return;
    }

    setIsCheckingBranch(true);
    try {
      const res = await axiosClient.get(`/products?branchId=${newBranchId}&size=500`);
      const products = Array.isArray(res.data) ? res.data : res.data?.content || [];
      const dataProducts = Array.isArray(res.data?.data) ? res.data.data : products;

      const missingItems = cart.items.filter((cartItem: any) => {
        const product = dataProducts.find((p: any) => p.id === cartItem.menuItemId);
        return !product || !product.branchAvailable || product.status !== "ACTIVE";
      });

      if (missingItems.length > 0) {
        setUnavailableItems(missingItems);
        setPendingBranchId(newBranchId);
        setConflictModalOpen(true);
      } else {
        setSelectedBranchId(newBranchId);
      }
    } catch (error) {
      console.error("Failed to check branch availability", error);
      setSelectedBranchId(newBranchId);
    } finally {
      setIsCheckingBranch(false);
    }
  };

  const handleAcceptBranchChange = async () => {
    if (!pendingBranchId) return;

    try {
      for (const item of unavailableItems) {
        await removeItem(item.id);
      }
    } catch (error) {
      console.error("Failed to remove unavailable items", error);
    }

    setSelectedBranchId(pendingBranchId);
    setConflictModalOpen(false);
    setPendingBranchId(null);
    setUnavailableItems([]);
  };

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

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const res = await userService.getProfile();
      if (res.statusCode === 200 && res.data) {
        setProfile(res.data);
      }
    } catch (error) {
      console.error("Failed to load user profile", error);
    }
  };

  const fetchPromotions = async () => {
    setIsLoadingPromotions(true);
    try {
      if (user) {
        // Authenticated: use the new checkout-eligible API that pre-validates per user
        const cartSubtotal = cart?.totalAmount || 0;
        const res = await promotionService.getCheckoutEligible(cartSubtotal);
        if (res.statusCode === 200 && res.data) {
          const promotions = (Array.isArray(res.data) ? res.data : []).map((p: any) => ({
            ...p,
            isMyVoucher: p.myVoucher,
            // Server already provides eligible + ineligibleReason
            isEligible: p.eligible,
            reason: p.ineligibleReason,
          }));
          setAvailablePromotions(promotions);
        }
      } else {
        // Guest: fallback to public-only active promotions
        const res = await promotionService.getActivePromotions();
        let promotions: any[] = [];
        if (res.statusCode === 200 && res.data) {
          promotions = Array.isArray(res.data)
            ? res.data
            : (res.data as any).content || [];
        }
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
      fetchProfile();
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

  useEffect(() => {
    if (shippingMethod !== "delivery") {
      setShippingFee(0);
      return;
    }

    let targetAddress = "";
    if (selectedAddressId === "new_address" || isGuest) {
      targetAddress = guestInfo.address;
    } else {
      const selectedAddrObj = savedAddresses.find((a) => a.id === selectedAddressId);
      if (selectedAddrObj) {
        targetAddress = `${selectedAddrObj.street || selectedAddrObj.detailAddress || ""}, ${selectedAddrObj.communeName || ""}, ${selectedAddrObj.provinceName || ""}`;
      }
    }

    if (!targetAddress.trim()) return;

    const calculateFee = async () => {
      try {
        let lat = 10.7769; // HCMC Default
        let lng = 106.7009;
        const addrLower = targetAddress.toLowerCase();
        if (addrLower.includes("hà nội") || addrLower.includes("ha noi")) {
          lat = 21.0285;
          lng = 105.8542;
        } else if (addrLower.includes("đà nẵng") || addrLower.includes("da nang")) {
          lat = 16.0544;
          lng = 108.2022;
        }

        const res = await axiosClient.get(`/branches/nearest`, {
          params: { lat, lng },
        });

        if (res.data) {
          setShippingFee(res.data.shippingFee);
          if (res.data.branch?.id) {
            setSelectedBranchId(res.data.branch.id);
          }
        }
      } catch (error) {
        console.error("Error updating shipping fee on checkout address change", error);
      }
    };

    const timer = setTimeout(() => {
      calculateFee();
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedAddressId, guestInfo.address, shippingMethod, savedAddresses, isGuest, setShippingFee, setSelectedBranchId]);

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
          productId: item.menuItemId,
          productVariantId: item.menuItemSizeId || item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice || 0,
        })),
        code: code,
        appliedCodes: appliedCodes,
        customerId: user?.customerId || user?.id,
      };

      // Vẫn giữ logic gọi calculate-discount khi bấm Apply
      const res = await promotionService.calculateCartDiscount(payload);

      if (res.data) {
        const data = res.data;
        if (data.totalDiscount > 0) {
          setDiscountAmount(data.totalDiscount);
          setCalculatedFinalAmount(data.finalAmount);

          const promoIds: string[] = [];
          if (data.orderPromotion)
            promoIds.push(data.orderPromotion.promotionId);
          data.productPromotions.forEach((p: any) => promoIds.push(p.promotionId));

          setAppliedPromotionIds([...new Set(promoIds)]);
          if (!appliedCodes.includes(code)) {
            setAppliedCodes([...appliedCodes, code]);
          }

          toast.success(`Applied! Saved ${data.totalDiscount.toLocaleString()}₫`);
        } else {
          toast.info("Coupon is valid but no discount applicable.");
        }
      }
    } catch (error: any) {
      resetCouponState();
      const errorMsg = error.message || "Mã không hợp lệ hoặc đã hết hạn";
      toast.error(errorMsg);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const resetCouponState = () => {
    setDiscountAmount(0);
    setCalculatedFinalAmount(null);
    setAppliedPromotionIds([]);
    setAppliedCodes([]);
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

    if (shippingMethod === "pickup") {
      if (!selectedBranchId) {
        toast.warning("Please select a pickup branch");
        return;
      }
      if (!guestInfo.name || !guestInfo.phone) {
        toast.warning("Please fill in pickup contact details (Name and Phone)");
        return;
      }
    } else {
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
    }

    setIsLoading(true);
    try {
      const orderItems = cart.items.map((item) => ({
        productVariantId: item.menuItemSizeId || item.menuItemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice || 0,
        discount: 0,
        notes: item.note,
        options: item.selectedOptions
          ? Object.entries(item.selectedOptions).map(([groupId, val]) => ({
              optionGroupId: groupId,
              optionValueId: val.includes(":") ? val.split(":")[0] : val,
            }))
          : [],
        toppings: item.selectedToppings
          ? item.selectedToppings.map((t) => ({
              toppingId: t.toppingId,
              quantity: t.quantity,
            }))
          : [],
      }));

      const payload: any = {
        items: orderItems,
        orderType: shippingMethod === "pickup"
          ? "ONLINE_PICKUP"
          : (paymentMethod === "cod" ? "ONLINE_COD" : "ONLINE_TRANSFER"),
        paymentMethod: paymentMethod === "cod" ? "CASH" : paymentMethod === "vnpay" ? "VNPAY" : "MOMO",
        loyaltyPointsToUse: pointsUsed,
        promotionIds: appliedPromotionIds,
        branchId: selectedBranchId || undefined,
      };

      if (shippingMethod === "pickup") {
        payload.guestName = guestInfo.name;
        payload.guestPhone = guestInfo.phone;
        payload.guestEmail = guestInfo.email;
        if (!isGuest) {
          payload.customerId = user?.id;
        }
      } else {
        const isUsingNewAddress = selectedAddressId === "new_address" || isGuest;
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
      }

      const res = await orderService.createOrder(payload);

      if (res.statusCode === 200 || res.statusCode === 201) {
        const orderData = res.data;

        // Perform checkout
        const checkoutPayload: any = {
          paymentMethod: paymentMethod === "cod" ? "CASH" : paymentMethod === "vnpay" ? "VNPAY" : "MOMO",
          voucherCode: couponCode || undefined,
          pointsUsed: pointsUsed,
        };

        if (orderData.orderType === "MERCHANDISE") {
          checkoutPayload.merchandiseOrderId = orderData.orderId;
        } else {
          checkoutPayload.drinkOrderId = orderData.orderId;
          if (orderData.merchandiseOrderId) {
            checkoutPayload.merchandiseOrderId = orderData.merchandiseOrderId;
          }
        }

        const checkoutRes = await axiosClient.post<any, ApiResponse<any>>("/orders/checkout", checkoutPayload);

        if (checkoutRes.statusCode === 200 || checkoutRes.statusCode === 201) {
          await clearCart();

          const finalOrderData = {
            ...orderData,
            finalAmount: checkoutRes.data.finalAmount,
            totalDiscount: checkoutRes.data.discount,
            paymentUrl: checkoutRes.data.paymentUrl,
            paymentStatus: checkoutRes.data.paymentStatus,
          };

          onOrderSuccess(finalOrderData);

          if (checkoutRes.data.paymentUrl) {
            window.location.href = checkoutRes.data.paymentUrl;
          } else {
            onNext();
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  const cartSubtotal = cart?.totalAmount || 0;
  const shippingFee = shippingMethod === "delivery" ? contextShippingFee : 0;
  const pointsDiscount = pointsUsed * 1000;
  const displayTotal =
    calculatedFinalAmount !== null
      ? Math.max(0, calculatedFinalAmount - pointsDiscount)
      : Math.max(0, cartSubtotal + shippingFee - discountAmount - pointsDiscount);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-smoke hover:text-roast transition-colors mb-6 cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Quay lại giỏ hàng
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      <div className="lg:col-span-7 space-y-8">
        {shippingMethod === "pickup" ? (
          <div className="space-y-6">
            <BranchSelect
              branches={branches}
              selectedBranchId={selectedBranchId}
              onSelectBranch={handleBranchSelect}
              isLoading={isLoadingBranches || isCheckingBranch}
            />
            <div className="bg-surface-container-lowest border border-admin-border rounded-xl p-6 shadow-sm font-ui-body">
              <h3 className="font-display-md text-display-md text-smoke mb-4 border-b border-mist pb-3">Pickup Contact Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-smoke uppercase tracking-wider block">Full Name *</label>
                  <input
                    placeholder="Nguyen Van A"
                    className="w-full bg-foam border border-mist focus:border-roast focus:ring-1 focus:ring-roast rounded-lg text-sm text-roast font-ui-body py-2.5 px-3.5 transition-all duration-200 outline-none"
                    value={guestInfo.name}
                    onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-smoke uppercase tracking-wider block">Phone Number *</label>
                  <input
                    placeholder="0909 xxx xxx"
                    className="w-full bg-foam border border-mist focus:border-roast focus:ring-1 focus:ring-roast rounded-lg text-sm text-roast font-ui-body py-2.5 px-3.5 transition-all duration-200 outline-none"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
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
        )}
        <PaymentMethod
          paymentMethod={paymentMethod}
          onChange={(v) => setPaymentMethod(v)}
          shippingMethod={shippingMethod}
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
          pointsAvailable={profile?.loyaltyPoint?.pointsAvailable || 0}
          pointsUsed={pointsUsed}
          onChangePointsUsed={setPointsUsed}
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

      {/* Branch Conflict Modal */}
      <Dialog open={conflictModalOpen} onOpenChange={setConflictModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thay đổi chi nhánh</DialogTitle>
            <DialogDescription>
              Chi nhánh bạn vừa chọn không khả dụng cho một số món trong giỏ hàng hiện tại:
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ul className="list-disc pl-5 space-y-1 text-sm text-red-500 font-medium">
              {unavailableItems.map((item, index) => (
                <li key={index}>{item.menuItemName}</li>
              ))}
            </ul>
            <p className="text-sm text-smoke mt-4">
              Nếu bạn chấp nhận đổi chi nhánh, các món này sẽ tự động bị xoá khỏi giỏ hàng. Bạn có muốn tiếp tục?
            </p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setConflictModalOpen(false);
                setPendingBranchId(null);
                setUnavailableItems([]);
              }}
              className="flex-1"
            >
              Huỷ
            </Button>
            <Button
              onClick={handleAcceptBranchChange}
              className="flex-1 bg-roast text-white hover:bg-espresso"
            >
              Chấp nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
