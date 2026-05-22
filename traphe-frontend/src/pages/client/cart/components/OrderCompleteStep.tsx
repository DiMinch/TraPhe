import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import {
  CheckCircle2,
  Package,
  Receipt,
  Clock,
  Award,
  Truck,
  ArrowRight,
} from "lucide-react";
import type { OrderResponse } from "@/services/order.service";
import { userService } from "@/services/user.service";
import type { UserInfo } from "@/types/user.types";
import { format } from "date-fns";

interface OrderCompleteStepProps {
  order?: OrderResponse | null;
}

export default function OrderCompleteStep({ order }: OrderCompleteStepProps) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userService.getProfile();
        if (res.statusCode === 200 && res.data) {
          setProfile(res.data);
        }
      } catch (err) {
        console.error("Error fetching profile on order success page:", err);
      }
    };
    fetchProfile();
  }, []);

  if (!order) {
    return (
      <div className="text-center py-20 animate-in fade-in duration-500">
        <div className="mb-4 text-[#D4C9BC]">
          <Package className="w-16 h-16 mx-auto" />
        </div>
        <h2 className="font-display-md text-2xl font-bold text-[#2C1A0E]">
          No order details found
        </h2>
        <p className="text-gray-500 mt-2 mb-6">
          Your session might have expired or you refreshed the page.
        </p>
        <Button
          onClick={() => navigate("/menu")}
          className="bg-[#5C3317] hover:bg-[#2C1A0E] text-white rounded-full px-6"
        >
          Back to Shop
        </Button>
      </div>
    );
  }

  // Calculate points earned (1 point = 1,000 VND spent)
  const pointsEarned = Math.floor(order.finalAmount / 1000);

  // Status timeline tracking
  const isConfirmed = order.status === "CONFIRMED" || order.status === "COMPLETED";
  const isCompleted = order.status === "COMPLETED";

  // Calculate approximate readiness time
  const getReadinessText = () => {
    if (order.estimatedReadyTime) {
      try {
        return format(new Date(order.estimatedReadyTime), "HH:mm");
      } catch (e) {
        return "15-20 mins";
      }
    }
    // Default fallback
    const time = new Date(new Date(order.createdAt).getTime() + (order.orderType === "DELIVERY" ? 40 : 20) * 60000);
    return format(time, "HH:mm");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 relative overflow-hidden bg-foam">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-cream opacity-50 blur-[100px]"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-parchment opacity-60 blur-[80px]"></div>
      </div>

      <div className="max-w-3xl w-full">
        {/* Main Success Container */}
        <div
          className="bg-white rounded-2xl shadow-lg overflow-hidden relative border border-mist/30"
          style={{
            backgroundColor: "#EFE5D3",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
          }}
        >
          {/* Celebration Header */}
          <div className="text-center pt-12 pb-8 px-6 relative z-10">
            <div className="mx-auto w-20 h-20 bg-cream rounded-full flex items-center justify-center mb-6 shadow-sm border border-roast/10 animate-in zoom-in duration-500">
              <CheckCircle2 className="w-10 h-10 text-roast fill-roast/10" />
            </div>
            <h1 className="font-display-lg text-4xl md:text-5xl text-[#2C1A0E] mb-2 font-bold tracking-tight">
              Thank You.
            </h1>
            <p className="text-sm md:text-base text-[#4A3F35] max-w-md mx-auto mb-8 font-body-md">
              Your order has been received and is being prepared with care by our artisans.
            </p>

            <div className="inline-flex flex-col items-center justify-center py-3 px-8 bg-foam rounded-lg border border-mist/50 mb-8 shadow-sm">
              <span className="font-sans text-[10px] text-[#4A3F35] mb-1 uppercase tracking-wider font-semibold">
                Order Number
              </span>
              <span className="font-sans text-xl font-extrabold text-[#1A1410] tracking-tight">
                #{order.orderNumber}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <Button
                onClick={() => navigate("/account?tab=orders")}
                className="w-full h-auto bg-[#5C3317] hover:bg-[#2C1A0E] text-white font-semibold py-3.5 rounded-full shadow-md transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Track Order</span>
                <Truck className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => {
                  const el = document.getElementById("order-receipt-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full h-auto bg-transparent border-[1.5px] border-[#5C3317] text-[#5C3317] hover:bg-cream/40 font-semibold py-3.5 rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Receipt</span>
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#D4C9BC] to-transparent opacity-60"></div>

          {/* Order Details & Status */}
          <div className="p-6 md:p-8 bg-white/40 backdrop-blur-sm relative z-10" id="order-receipt-section">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Status Section */}
              <div className="flex flex-col">
                <h2 className="font-ui-heading text-lg font-bold text-[#5C3317] mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#5C3317]" />
                  Estimated Readiness
                </h2>
                <div className="bg-foam p-5 rounded-xl border border-mist/30 flex-grow flex flex-col justify-between shadow-sm">
                  <div className="text-center">
                    <div className="font-sans text-3xl font-extrabold text-[#1A1410] mb-1">
                      {getReadinessText()}
                    </div>
                    <div className="text-xs text-[#4A3F35] font-medium">
                      {order.orderType === "DELIVERY"
                        ? "Approx. 35-45 mins delivery time"
                        : "Approx. 15-20 mins preparation time"}
                    </div>
                  </div>
                  
                  {/* Readiness Timeline */}
                  <div className="mt-6 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-300/60 -translate-y-1/2 rounded-full"></div>
                    <div
                      className="absolute top-1/2 left-0 h-0.5 bg-[#5C3317] -translate-y-1/2 rounded-full transition-all duration-500"
                      style={{ width: isCompleted ? "100%" : isConfirmed ? "50%" : "0%" }}
                    ></div>
                    <div className="relative flex justify-between">
                      {/* Received */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-3.5 h-3.5 bg-[#5C3317] rounded-full z-10 border-2 border-foam flex items-center justify-center"></div>
                        <span className="text-[9px] font-bold text-[#4A3F35] uppercase tracking-wider">
                          Received
                        </span>
                      </div>
                      {/* Preparing */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`w-3.5 h-3.5 rounded-full z-10 border-2 border-foam flex items-center justify-center ${
                            isConfirmed ? "bg-[#5C3317]" : "bg-stone-300"
                          }`}
                        ></div>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider ${
                            isConfirmed ? "text-[#4A3F35]" : "text-stone-400"
                          }`}
                        >
                          Preparing
                        </span>
                      </div>
                      {/* Ready */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`w-3.5 h-3.5 rounded-full z-10 border-2 border-foam flex items-center justify-center ${
                            isCompleted ? "bg-[#5C3317]" : "bg-stone-300"
                          }`}
                        ></div>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider ${
                            isCompleted ? "text-[#4A3F35]" : "text-stone-400"
                          }`}
                        >
                          Ready
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              <div className="flex flex-col">
                <h2 className="font-ui-heading text-lg font-bold text-[#5C3317] mb-4 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#5C3317]" />
                  Order Summary
                </h2>
                <div className="bg-foam p-5 rounded-xl border border-mist/30 flex-grow flex flex-col justify-between shadow-sm">
                  <ul className="space-y-3 mb-4 max-h-[160px] overflow-y-auto pr-1">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between items-start text-xs text-[#1A1410]">
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-sm text-[#2C1A0E]">
                            {item.quantity}x
                          </span>{" "}
                          <span className="font-medium text-[#2C1A0E]">{item.menuItemName}</span>
                          <p className="text-[10px] text-[#4A3F35] mt-0.5">
                            {[item.sizeName, ...item.toppings].filter(Boolean).join(", ")}
                          </p>
                        </div>
                        <span className="font-semibold text-stone-700 shrink-0">
                          {item.subtotal.toLocaleString("vi-VN")}₫
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="pt-3 border-t border-mist/40 space-y-1 text-xs">
                    {order.shippingFee && order.shippingFee > 0 ? (
                      <div className="flex justify-between text-[#4A3F35]">
                        <span>Shipping Fee</span>
                        <span>{order.shippingFee.toLocaleString("vi-VN")}₫</span>
                      </div>
                    ) : null}
                    {order.totalDiscount > 0 ? (
                      <div className="flex justify-between text-green-700">
                        <span>Discount</span>
                        <span>-{order.totalDiscount.toLocaleString("vi-VN")}₫</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-medium text-[#4A3F35]">Total paid</span>
                      <span className="font-sans text-lg font-bold text-[#5C3317]">
                        {order.finalAmount.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Loyalty Banner */}
            {profile && (
              <div className="mt-6 bg-[#F5EAD8] rounded-xl p-4 border border-[#C89A6E]/30 flex items-center gap-4 shadow-sm animate-in slide-in-from-bottom duration-500">
                <div className="w-10 h-10 rounded-full bg-[#C89A6E]/20 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-[#5C3317]" />
                </div>
                <div>
                  <div className="font-ui-heading text-sm font-bold text-[#5C3317]">
                    You earned {pointsEarned} loyalty points!
                  </div>
                  <div className="text-xs text-[#4A3F35] mt-0.5">
                    Your new balance is{" "}
                    <b>{((profile.loyaltyPoint?.pointsAvailable || 0) + pointsEarned).toLocaleString()}</b>{" "}
                    points.{" "}
                    {profile.loyaltyPoint?.pointsToNextTier && profile.loyaltyPoint.pointsToNextTier > 0 ? (
                      <>
                        Only <b>{profile.loyaltyPoint.pointsToNextTier}</b> more points needed for the next tier.
                      </>
                    ) : (
                      "You've reached maximum membership benefits!"
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Return Home Link */}
        <div className="text-center mt-8">
          <Button
            onClick={() => navigate("/menu")}
            variant="link"
            className="text-stone-600 hover:text-[#5C3317] font-semibold flex items-center gap-1.5 mx-auto cursor-pointer"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
