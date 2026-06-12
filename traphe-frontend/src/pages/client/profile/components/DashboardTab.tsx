import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Star, Award, Coffee, ShoppingBag, Package, ArrowRight, ChevronRight, Loader2 } from "lucide-react";
import { orderService, type OrderResponse, type OrderItemDetail } from "@/services/order.service";
import type { UserInfo } from "@/types/user.types";
import { format } from "date-fns";

interface DashboardTabProps {
  currentUser: UserInfo | null;
  setActiveTab: (tab: "dashboard" | "orders" | "profile" | "address" | "loyalty" | "vouchers") => void;
}

export default function DashboardTab({ currentUser, setActiveTab }: DashboardTabProps) {
  const [recentOrders, setRecentOrders] = useState<OrderResponse[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const res = await orderService.getMyOrders({ page: 0, size: 3 });
        if (res.statusCode === 200 && res.data) {
          setRecentOrders(res.data.content);
        }
      } catch (error) {
        console.error("Failed to fetch recent orders", error);
      } finally {
        setIsLoadingOrders(false);
      }
    };
    fetchRecentOrders();
  }, []);

  const calculateProgress = () => {
    if (!currentUser?.loyaltyPoint) return 0;
    const { totalPoints, pointsToNextTier } = currentUser.loyaltyPoint;
    if (!pointsToNextTier || pointsToNextTier <= 0) return 100;
    const nextTierGoal = totalPoints + pointsToNextTier;
    if (nextTierGoal === 0) return 0;
    return Math.min(100, Math.max(0, (totalPoints / nextTierGoal) * 100));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-50 text-green-700 border-green-200";
      case "CONFIRMED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getOrderIcon = (order: OrderResponse) => {
    // Determine icon based on items
    const hasBeans = order.items?.some((item: OrderItemDetail) => 
      item.menuItemName.toLowerCase().includes("bean") || item.menuItemName.toLowerCase().includes("hạt")
    );
    if (hasBeans) return <Package className="w-5 h-5 text-[#4A3F35]" />;
    
    const hasCoffee = order.items?.some((item: OrderItemDetail) => 
      item.menuItemName.toLowerCase().includes("coffee") || item.menuItemName.toLowerCase().includes("cà phê")
    );
    if (hasCoffee) return <Coffee className="w-5 h-5 text-[#4A3F35]" />;
    
    return <ShoppingBag className="w-5 h-5 text-[#4A3F35]" />;
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header>
        <h1 className="font-serif text-3xl font-semibold text-[#2C1A0E] mb-2">Account Overview</h1>
        <p className="text-gray-600 text-sm">Manage your rewards, view past orders, and update your profile.</p>
      </header>

      {/* Loyalty & Tier Bento Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Points Card */}
        <div className="col-span-1 lg:col-span-2 bg-[#EFE5D3] rounded-xl p-8 relative overflow-hidden shadow-md flex flex-col justify-between border border-[#D4C9BC]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C89A6E]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#5C3317] mb-1">Available Points</h2>
                <p className="text-xs text-[#4A3F35]">Redeemable for drinks &amp; treats</p>
              </div>
              <Star className="w-8 h-8 text-[#A0622A] fill-[#A0622A]" />
            </div>
            <div className="font-serif text-5xl font-bold text-[#5C3317]">
              {currentUser?.loyaltyPoint?.pointsAvailable.toLocaleString() || 0}
            </div>
          </div>
          <div className="relative z-10 mt-8">
            <button
              onClick={() => setActiveTab("loyalty")}
              className="bg-[#5C3317] text-white rounded-full px-6 py-3 text-sm hover:bg-[#2C1A0E] transition-all font-medium inline-flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
            >
              Redeem Rewards
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tier Card */}
        <div className="col-span-1 bg-white rounded-xl p-6 shadow-md flex flex-col items-center justify-center text-center border border-[#E2DDD7]">
          <div className="w-16 h-16 rounded-full bg-[#5C3317]/10 flex items-center justify-center mb-4 border-2 border-[#C89A6E]">
            <Award className="w-8 h-8 text-[#C89A6E]" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#5C3317] mb-1">
            {currentUser?.tier?.name || "Gold Member"}
          </h3>
          <p className="text-xs text-[#4A3F35] mb-6">
            {currentUser?.tier?.description || "Enjoy discount rates on your coffee purchase."}
          </p>
          
          {currentUser?.loyaltyPoint && (
            <div className="w-full">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-medium">
                <span>
                  {currentUser.loyaltyPoint.pointsToNextTier && currentUser.loyaltyPoint.pointsToNextTier > 0
                    ? `${currentUser.loyaltyPoint.pointsToNextTier.toLocaleString()} pts to next tier`
                    : "Max Level"}
                </span>
                <span>
                  {currentUser.loyaltyPoint.totalPoints.toLocaleString()} pts
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                <div
                  className="h-full bg-[#A0622A] rounded-full transition-all duration-1000"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recent Orders Section */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="font-serif text-xl font-bold text-[#2C1A0E] border-b-2 border-[#A0622A] pb-2 inline-block">
            Recent Orders
          </h2>
          <button
            onClick={() => setActiveTab("orders")}
            className="text-sm font-semibold text-[#A0622A] hover:text-[#5C3317] transition-colors flex items-center gap-1 cursor-pointer"
          >
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {isLoadingOrders ? (
          <div className="flex justify-center py-10 bg-white rounded-xl border border-gray-100">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
            <ShoppingBag className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No orders yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {recentOrders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-xl p-6 border border-[#E2DDD7] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    {getOrderIcon(order)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-base text-[#2C1A0E]">
                        Order #{order.orderNumber}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs">
                      {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")} •{" "}
                      {order.itemCount ?? order.items?.length ?? 0} Item(s)
                      {order.items && order.items.length > 0 && (
                        <> ({order.items.map((i: OrderItemDetail) => i.menuItemName).join(", ")})</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full md:w-auto gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                  <div className="font-bold text-lg text-[#5C3317]">
                    {order.finalAmount.toLocaleString("vi-VN")}₫
                  </div>
                  <button
                    onClick={() => navigate(`/menu`)}
                    className="border border-[#5C3317] text-[#5C3317] rounded-full px-5 py-2 text-xs font-semibold hover:bg-[#F5EAD8] transition-colors cursor-pointer"
                  >
                    Reorder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
