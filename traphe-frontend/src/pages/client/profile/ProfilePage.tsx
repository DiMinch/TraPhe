import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { User, MapPin, Package, LogOut, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import AccountTab from "./components/AccountTab";
import AddressTab from "./components/AddressTab";
import OrderTab from "./components/OrderTab";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service"; // Import user service
import type { UserInfo } from "@/types/user";

type TabType = "account" | "address" | "orders";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("account");
  const [user, setUser] = useState<UserInfo | null>(null); // State chứa user thực
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  // Hàm fetch profile từ API
  const fetchProfile = useCallback(async () => {
    try {
      const res = await userService.getProfile();
      if (res.statusCode === 200 && res.data) {
        setUser(res.data);
        // Cập nhật localStorage để đồng bộ phiên làm việc (nếu cần)
        localStorage.setItem("user", JSON.stringify(res.data));
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Gọi API khi component mount
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
    { id: "address", label: "Address", icon: MapPin },
    { id: "orders", label: "Orders", icon: Package },
  ];

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="pt-10 pb-12 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">My Account</h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-3">
          {/* SIDEBAR USER INFO */}
          <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center mb-6 text-center border border-gray-100">
            {isLoading ? (
              // Skeleton Loading
              <div className="flex flex-col items-center space-y-3 w-full">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            ) : user ? (
              <>
                <div className="relative mb-3">
                  <Avatar className="w-20 h-20 border-2 border-white shadow-sm">
                    <AvatarImage
                      src={user.avatar || ""}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-black text-white text-xl font-bold">
                      {user.fullName ? user.fullName[0] : user.username[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="font-bold text-lg">
                  {user.fullName || user.username}
                </h3>
                <p className="text-sm text-gray-500">{user.email}</p>
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
            {/* Truyền user và callback refresh xuống AccountTab */}
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
