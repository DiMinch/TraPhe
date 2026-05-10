import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  User,
  MapPin,
  Package,
  LogOut,
  Crown,
  Star,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import AccountTab from "./components/AccountTab";
import AddressTab from "./components/AddressTab";
import OrderTab from "./components/OrderTab";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import type { UserInfo } from "@/types/user.types";

type TabType = "account" | "address" | "orders";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("account");
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    try {
      const res = await userService.getProfile();
      if (res.statusCode === 200 && res.data) {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = async () => {
    const promise = async () => {
      setIsLoggingOut(true);
      await authService.logout();
      navigate("/sign-in");
    };

    toast.promise(promise(), {
      loading: "Logging out...",
      success: "Logged out successfully",
      error: "Failed to logout",
      finally: () => setIsLoggingOut(false),
    });
  };

  const menuItems = [
    { id: "account", label: "Account Details", icon: User },
    { id: "address", label: "My Address", icon: MapPin },
    { id: "orders", label: "Order History", icon: Package },
  ];

  const calculateProgress = () => {
    if (!user?.loyaltyPoint) return 0;
    const { totalPoints, pointsToNextTier } = user.loyaltyPoint;

    if (!pointsToNextTier || pointsToNextTier <= 0) return 100;

    const nextTierGoal = totalPoints + pointsToNextTier;
    if (nextTierGoal === 0) return 0;

    return Math.min(100, Math.max(0, (totalPoints / nextTierGoal) * 100));
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="pt-10 pb-12 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">My Account</h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-3">
          {/* SIDEBAR USER INFO */}
          <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center mb-6 border border-gray-100 shadow-sm">
            {isLoading ? (
              <div className="flex flex-col items-center space-y-3 w-full">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-20 w-full mt-4" />
              </div>
            ) : user ? (
              <>
                <div className="relative mb-3">
                  <Avatar className="w-20 h-20 border-4 border-white shadow-sm">
                    <AvatarImage
                      src={user.avatar || ""}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-black text-white text-xl font-bold">
                      {user.fullName ? user.fullName[0] : user.username[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="font-bold text-lg text-gray-900">
                  {user.fullName || user.username}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{user.email}</p>

                {/* --- LOYALTY & TIER SECTION --- */}
                {(user.tier || user.loyaltyPoint) && (
                  <div className="w-full border-t border-gray-200 pt-4 mt-2 space-y-4">
                    <div className="flex items-center justify-between">
                      {user.tier && (
                        <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-1 rounded-full shadow-sm">
                          <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-bold text-gray-800">
                            {user.tier.name}
                          </span>
                        </div>
                      )}
                      {user.loyaltyPoint && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <Star className="w-3.5 h-3.5 fill-orange-600" />
                          <span className="text-sm font-bold">
                            {user.loyaltyPoint.pointsAvailable.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {user.loyaltyPoint && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] uppercase font-semibold text-gray-500 tracking-wide">
                          <span>Total Earned</span>
                          <span>Next Rank</span>
                        </div>

                        <div className="relative h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-gray-900 to-gray-600 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${calculateProgress()}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-xs items-center">
                          <span className="font-medium text-gray-900">
                            {user.loyaltyPoint.totalPoints.toLocaleString()} pts
                          </span>
                          <span className="text-gray-500 italic">
                            {user.loyaltyPoint.pointsToNextTier
                              ? `+${user.loyaltyPoint.pointsToNextTier.toLocaleString()} needed`
                              : "Max Level"}
                          </span>
                        </div>
                      </div>
                    )}

                    {user.loyaltyPoint && user.loyaltyPoint.pointsUsed > 0 && (
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-md border border-gray-100">
                        <span className="text-xs text-gray-500 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" /> Used Points
                        </span>
                        <span className="text-xs font-semibold text-gray-900">
                          {user.loyaltyPoint.pointsUsed.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </div>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all cursor-pointer",
                    isActive
                      ? "bg-black text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 hover:text-black",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      isActive ? "text-white" : "text-gray-400",
                    )}
                  />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all mt-4 border-t border-gray-100 disabled:opacity-50"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
              Log Out
            </button>
          </div>
        </div>

        <div className="lg:col-span-9">
          <>
            {activeTab === "account" && (
              <AccountTab currentUser={user} onUpdateSuccess={fetchProfile} />
            )}
            {activeTab === "address" && <AddressTab />}
            {activeTab === "orders" && <OrderTab />}
          </>
        </div>
      </div>
    </div>
  );
}
