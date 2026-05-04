import { useState } from "react";
import { useNavigate } from "react-router";
import { User, MapPin, Package, LogOut, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { userProfile } from "@/data/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AccountTab from "./components/AccountTab";
import AddressTab from "./components/AddressTab";
import OrderTab from "./components/OrderTab";

type TabType = "account" | "address" | "orders";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("account");
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/sign-in");
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
          <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center mb-6 text-center border border-gray-100">
            <div className="relative mb-3">
              <Avatar className="w-20 h-20">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback className="bg-black text-white text-xl font-bold">
                  {userProfile.firstName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-black p-1 rounded-full border-2 border-white">
                <Camera className="w-3 h-3 text-white" />
              </div>
            </div>
            <h3 className="font-bold text-lg">{userProfile.displayName}</h3>
            <p className="text-sm text-gray-500">{userProfile.email}</p>
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
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all mt-4 border-t border-gray-100"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
              Log Out
            </button>
          </div>
        </div>
        <div className="lg:col-span-9">
          {activeTab === "account" && <AccountTab />}
          {activeTab === "address" && <AddressTab />}
          {activeTab === "orders" && <OrderTab />}
        </div>
      </div>
    </div>
  );
}
