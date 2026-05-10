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
          <main className="flex-1 overflow-y-auto p-0">
            <Outlet />
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}
