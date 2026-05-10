import { Outlet } from "react-router";
import Navigation from "@/components/Navigation";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationDropdown from "../common/NotificationDropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authService } from "@/services/auth.service";
import { useState } from "react";
import type { UserInfo } from "@/types/user.types";

export default function AdminLayout() {
  const [user] = useState<UserInfo | null>(() => authService.getCurrentUser());
  const getInitials = (name?: string) => {
    return name ? name.charAt(0).toUpperCase() : "A";
  };

  return (
    <NotificationProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Navigation />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 shrink-0">
            <div className="flex items-end justify-center">
              <NotificationDropdown />
              <div className="h-8 w-px bg-gray-200 mx-1"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fullName || user?.email || "Admin User"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    Administrator
                  </p>
                </div>
                <Avatar className="h-9 w-9 border border-gray-200 cursor-pointer">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-indigo-900 text-white">
                    {getInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
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
