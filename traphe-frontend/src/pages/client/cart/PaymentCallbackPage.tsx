import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ArrowRight,
  Clock,
  Receipt,
  Award,
  Truck,
  RotateCcw,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { orderService } from "@/services/order.service";
import type { OrderResponse } from "@/services/order.service";
import { userService } from "@/services/user.service";
import type { UserInfo } from "@/types/user.types";
import { format } from "date-fns";

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"success" | "failed" | "loading">("loading");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [gateway, setGateway] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [profile, setProfile] = useState<UserInfo | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const orderIdParam = searchParams.get("orderId");
    const gatewayParam = searchParams.get("gateway");

    setOrderId(orderIdParam);
    setGateway(gatewayParam);

    if (statusParam === "success") {
      setStatus("success");
    } else {
      setStatus("failed");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!orderId) {
      if (status !== "loading") {
        setIsLoadingDetails(false);
      }
      return;
    }

    const fetchData = async () => {
      setIsLoadingDetails(true);
      try {
        // Fetch order details
        const orderRes = await orderService.getOrderById(orderId);
        if (orderRes.statusCode === 200 && orderRes.data) {
          setOrder(orderRes.data);
        }

        // Fetch user profile
        const profileRes = await userService.getProfile();
        if (profileRes.statusCode === 200 && profileRes.data) {
          setProfile(profileRes.data);
        }
      } catch (err) {
        console.error("Error fetching order or profile details:", err);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchData();
  }, [orderId, status]);

  if (status === "loading" || isLoadingDetails) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-foam">
        <Loader2 className="w-12 h-12 animate-spin text-[#5C3317] mb-4" />
        <p className="text-stone-600 font-ui-heading text-sm">Verifying payment status...</p>
      </div>
    );
  }

  // Calculate points earned (1 point = 1,000 VND spent)
  const pointsEarned = order ? Math.floor(order.finalAmount / 1000) : 0;

  // Status timeline tracking
  const isConfirmed = order ? (order.status === "CONFIRMED" || order.status === "COMPLETED") : false;
  const isCompleted = order ? order.status === "COMPLETED" : false;

  // Parse date safely, converting UTC string without Z to valid UTC object
  const parseBackendDate = (dateStr: string | Date | undefined): Date => {
    if (!dateStr) return new Date();
    if (dateStr instanceof Date) return dateStr;
    let normalized = dateStr;
    if (typeof normalized === "string") {
      if (normalized.includes("T") && !normalized.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(normalized)) {
        normalized = normalized + "Z";
      }
    }
    return new Date(normalized);
  };

  // Calculate approximate readiness time
  const getReadinessText = () => {
    if (order?.estimatedReadyTime) {
      try {
        return format(parseBackendDate(order.estimatedReadyTime), "HH:mm");
      } catch (e) {
        return "15-20 mins";
      }
    }
    if (order) {
      const parsedCreated = parseBackendDate(order.createdAt);
      const isDelivery = order.orderType === "DELIVERY" || order.orderType === "DRINK_DELIVERY" || (order.orderType && order.orderType.includes("DELIVERY"));
      const time = new Date(parsedCreated.getTime() + (isDelivery ? 40 : 20) * 60000);
      return format(time, "HH:mm");
    }
    return "15-20 mins";
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-start pt-28 pb-16 px-4 bg-foam relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-cream opacity-50 blur-[100px]"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-parchment opacity-60 blur-[80px]"></div>
      </div>

      {status === "success" ? (
        <div className="max-w-3xl w-full">
          {/* Success Canvas: Parchment Vibe */}
          <div
            className="bg-white rounded-2xl shadow-lg overflow-hidden relative border border-mist/30"
            style={{
              backgroundColor: "#EFE5D3",
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
            }}
          >
            {/* Header */}
            <div className="text-center pt-12 pb-8 px-6 relative z-10">
              <div className="mx-auto w-20 h-20 bg-cream rounded-full flex items-center justify-center mb-6 shadow-sm border border-roast/10">
                <CheckCircle2 className="w-10 h-10 text-roast fill-roast/10" />
              </div>
              <h1 className="font-display-lg text-4xl md:text-5xl text-[#2C1A0E] mb-2 font-bold tracking-tight">
                Payment Successful!
              </h1>
              <p className="text-sm md:text-base text-[#4A3F35] max-w-md mx-auto mb-8 font-body-md leading-relaxed">
                Đơn hàng của bạn đã được thanh toán trực tuyến thành công qua cổng{" "}
                <span className="font-bold uppercase text-[#5C3317]">{gateway || "Thanh toán"}</span>.
              </p>

              {order && (
                <div className="inline-flex flex-col items-center justify-center py-3 px-8 bg-foam rounded-lg border border-mist/50 mb-8 shadow-sm">
                  <span className="font-sans text-[10px] text-[#4A3F35] mb-1 uppercase tracking-wider font-semibold">
                    Order Number
                  </span>
                  <span className="font-sans text-xl font-extrabold text-[#1A1410] tracking-tight">
                    #{order.orderNumber}
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <Button
                  onClick={() => navigate("/account?tab=orders")}
                  className="w-full h-12 bg-[#5C3317] hover:bg-[#2C1A0E] text-white font-semibold rounded-full shadow-md transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Track Order</span>
                  <Truck className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => {
                    const el = document.getElementById("order-receipt-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full h-12 bg-transparent border-[1.5px] border-[#5C3317] text-[#5C3317] hover:bg-cream/40 font-semibold rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>View Receipt</span>
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#D4C9BC] to-transparent opacity-60"></div>

            {/* Receipt & Details */}
            {order && (
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
                      
                      {/* Timeline */}
                      <div className="mt-6 relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-300/60 -translate-y-1/2 rounded-full"></div>
                        <div
                          className="absolute top-1/2 left-0 h-0.5 bg-[#5C3317] -translate-y-1/2 rounded-full transition-all duration-500"
                          style={{ width: isCompleted ? "100%" : isConfirmed ? "50%" : "0%" }}
                        ></div>
                        <div className="relative flex justify-between">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-3.5 h-3.5 bg-[#5C3317] rounded-full z-10 border-2 border-foam flex items-center justify-center"></div>
                            <span className="text-[9px] font-bold text-[#4A3F35] uppercase tracking-wider">
                              Received
                            </span>
                          </div>
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

                  {/* Order Items Summary */}
                  <div className="flex flex-col">
                    <h2 className="font-ui-heading text-lg font-bold text-[#5C3317] mb-4 flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-[#5C3317]" />
                      Order Summary
                    </h2>
                    <div className="bg-foam p-5 rounded-xl border border-mist/30 flex-grow flex flex-col justify-between shadow-sm">
                      <ul className="space-y-3 mb-4 max-h-[160px] overflow-y-auto pr-1">
                        {order.items?.map((item) => (
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

                {/* Loyalty Point Promotion Banner */}
                {profile && (
                  <div className="mt-6 bg-[#F5EAD8] rounded-xl p-4 border border-[#C89A6E]/30 flex items-center gap-4 shadow-sm">
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
            )}
          </div>
        </div>
      ) : (
        /* Failure Canvas: inspired by screen5.html */
        <main className="w-full max-w-lg mx-auto relative z-10">
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-mist/30 flex flex-col">
            {/* Atmospheric Imagery header */}
            <div
              className="h-48 w-full bg-cover bg-center border-b border-mist relative"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD8_Zbgq8XqrYlFfeUtq9JVgEk_edct3KUFbN6ERTFLu7ToTuKNHYCcGAQ0L78G_GeLwzAC3TBYhSZuFACz-Cu4YnEFf3vw1ydKFpVloaMLTKfFFtxzLz5xtAKhC-p461zqj9Ph46lfK-m9S5v_Tvmx39PX8m2eEQwP8F-qpe0r3A_0iLuHBGG9-ELFla9d_PktUdDAkAO2MDTey2-7HvBfuGQW28P6cAeGDLaSlz2rPzvWD-0EvPbI2FVnM8pH0swl2T3QeFSHO58')`,
              }}
            >
              <div className="w-full h-full bg-gradient-to-b from-transparent to-white/90"></div>
            </div>
            
            {/* Content Area */}
            <div className="px-8 pb-8 pt-4 flex flex-col items-center text-center -mt-12 relative z-20">
              {/* Icon Badge */}
              <div className="w-20 h-20 rounded-full bg-parchment flex items-center justify-center border-4 border-white shadow-md mb-6">
                <XCircle className="w-10 h-10 text-roast" />
              </div>
              
              {/* Messaging */}
              <h1 className="font-display-md text-3xl font-extrabold text-[#2C1A0E] mb-3">
                Payment Unsuccessful
              </h1>
              <p className="font-body-md text-sm text-[#4A3F35] max-w-sm mb-8 leading-relaxed">
                Đã xảy ra lỗi hoặc phiên thanh toán đã hết hạn/bị hủy. Đừng lo lắng, đơn hàng của bạn đã được ghi nhận ở trạng thái chờ thanh toán.
              </p>

              {order && (
                <div className="w-full bg-foam border border-mist/50 rounded-xl p-4 text-left space-y-1.5 mb-6 shadow-sm">
                  <div className="text-[10px] text-[#4A3F35] font-bold uppercase tracking-wider">Mã đơn hàng</div>
                  <div className="font-mono text-sm font-bold text-gray-800 break-all">#{order.orderNumber}</div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  onClick={() => navigate("/cart")}
                  className="flex-1 h-12 bg-transparent border-[1.5px] border-[#5C3317] text-[#5C3317] hover:bg-cream/40 font-semibold rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Back to Cart</span>
                </Button>
                <Button
                  onClick={() => navigate("/account?tab=orders")}
                  className="flex-1 h-12 bg-[#5C3317] hover:bg-[#2C1A0E] text-white font-semibold rounded-full shadow-md transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Payment</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Support Link */}
          <div className="mt-8 text-center">
            <a
              className="text-stone-500 hover:text-[#5C3317] font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
              href="/contact"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Need help with your order?</span>
            </a>
          </div>
        </main>
      )}

      {/* Return Home button for Success state */}
      {status === "success" && (
        <div className="text-center mt-8">
          <Button
            onClick={() => navigate("/menu")}
            variant="link"
            className="text-stone-600 hover:text-[#5C3317] font-semibold flex items-center gap-1.5 mx-auto cursor-pointer"
          >
            <span>Back</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
