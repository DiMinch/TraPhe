import { Outlet } from "react-router";
import Navigation from "@/components/Navigation";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationDropdown from "../common/NotificationDropDown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authService } from "@/services/auth.service";
import { useState } from "react";
import type { UserInfo } from "@/types/user.types";
import { HelpCircle } from "lucide-react";

export default function AdminLayout() {
  const [user] = useState<UserInfo | null>(() => authService.getCurrentUser());
  const getInitials = (name?: string) => {
    return name ? name.charAt(0).toUpperCase() : "A";
  };

  return (
    <NotificationProvider>
      <div className="flex h-screen overflow-hidden bg-admin-bg">
        <Navigation />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-admin-border shadow-sm">
            <div className="h-16 w-full flex items-center justify-between px-8">
              <div className="flex items-center gap-space-4">
                <span className="text-xl font-black text-roast tracking-wide">
                  Branch: Central Square
                </span>
              </div>
              <div className="flex items-center gap-space-6">
                <div className="flex items-center gap-space-2 text-dust">
                  <div className="p-2 hover:bg-surface-container-low rounded-lg active:scale-95 transition-transform text-roast font-bold">
                    <NotificationDropdown />
                  </div>
                  <button className="p-2 hover:bg-surface-container-low rounded-lg active:scale-95 transition-transform text-dust">
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </div>
                <div className="w-8 h-8 rounded-full bg-mist overflow-hidden border border-admin-border">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar} alt={user?.fullName} />
                    <AvatarFallback className="bg-caramel text-white text-xs font-semibold">
                      {getInitials(user?.fullName || user?.username)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-0">
            <Outlet />
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}
