import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  LayoutDashboard,
  Receipt,
  User,
  MapPin,
  Award,
  Tag,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import AccountTab from "./components/AccountTab";
import AddressTab from "./components/AddressTab";
import OrderTab from "./components/OrderTab";
import DashboardTab from "./components/DashboardTab";
import LoyaltyTab from "./components/LoyaltyTab";
import VouchersTab from "./components/VouchersTab";

import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import type { UserInfo } from "@/types/user.types";

type TabType = "dashboard" | "orders" | "profile" | "address" | "loyalty" | "vouchers";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["dashboard", "orders", "profile", "address", "loyalty", "vouchers"].includes(tab)) {
      setActiveTab(tab as TabType);
    }
  }, [searchParams]);

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
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: Receipt },
    { id: "profile", label: "Profile", icon: User },
    { id: "address", label: "Addresses", icon: MapPin },
    { id: "loyalty", label: "Loyalty", icon: Award },
    { id: "vouchers", label: "Vouchers", icon: Tag },
  ];

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full lg:w-64 bg-stone-50 text-[#5C3317] rounded-xl border border-stone-200 shadow-md divide-y divide-stone-100 p-4 sticky top-24 shrink-0">
          
          {/* Sidebar Top: User Info summary */}
          <div className="pb-4 flex items-center gap-3">
            {isLoading ? (
              <div className="flex items-center gap-3 w-full">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ) : user ? (
              <>
                <Avatar className="w-12 h-12 border border-gray-200 shadow-sm">
                  <AvatarImage
                    src={user.avatar || ""}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-[#5C3317] text-white text-base font-bold">
                    {user.fullName ? user.fullName[0] : user.email[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="font-bold text-[#5C3317] text-sm truncate">
                    {user.fullName || user.email.split("@")[0]}
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    {user.tier?.name || "Gold Member"}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Sidebar Middle: Menu Items */}
          <nav className="pt-4 flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-md transition-all cursor-pointer",
                    isActive
                      ? "bg-[#5C3317] text-white border-l-4 border-[#C19A6B] rounded-r-md"
                      : "text-stone-700 hover:bg-stone-100 hover:text-[#5C3317]",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      isActive ? "text-white" : "text-stone-500",
                    )}
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Bottom: Logout */}
          <div className="pt-4 mt-2">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-md text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
              Log Out
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 w-full bg-white lg:pl-4">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardTab currentUser={user} setActiveTab={setActiveTab} />
              )}
              {activeTab === "orders" && <OrderTab />}
              {activeTab === "profile" && (
                <AccountTab currentUser={user} onUpdateSuccess={fetchProfile} />
              )}
              {activeTab === "address" && <AddressTab />}
              {activeTab === "loyalty" && (
                <LoyaltyTab currentUser={user} onUpdateSuccess={fetchProfile} />
              )}
              {activeTab === "vouchers" && <VouchersTab currentUser={user} />}
            </>
          )}
        </main>

      </div>
    </div>
  );
}
