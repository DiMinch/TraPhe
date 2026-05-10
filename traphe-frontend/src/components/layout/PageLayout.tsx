import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RefreshCw, Bell } from "lucide-react";
import { authService } from "@/services/auth.service";
import NotificationDropdown from "@/components/common/NotificationDropdown";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  children,
  onRefresh,
  isLoading,
}: PageHeaderProps) {
  const currentUser = authService.getCurrentUser();
  const userName = currentUser?.fullName || currentUser?.username || "User";
  const userRole = currentUser?.roles?.[0]?.replace("ROLE_", "") || "User";
  const userAvatar = currentUser?.avatar;

  // Get initials for avatar fallback
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 bg-clip-text text-transparent tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-500 font-medium">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-md transition-all duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-sm text-slate-600 font-medium">
            {userRole} • {userName}
          </span>
          <Avatar className="w-9 h-9 ring-2 ring-white shadow-sm">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <NotificationDropdown />
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md rounded-xl shadow-sm border border-slate-200/60 w-11 h-11 transition-all duration-200"
          >
            <RefreshCw
              className={`w-5 h-5 text-slate-600 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        )}
      </div>
    </div>
  );
}

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 min-h-screen">
      <div className="max-w-[1800px] mx-auto">{children}</div>
    </div>
  );
}

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = "Loading..." }: PageLoadingProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 animate-pulse shadow-lg"></div>
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-sm text-slate-500 font-medium">{message}</p>
      </div>
    </div>
  );
}

interface PageErrorProps {
  message: string;
  onRetry?: () => void;
}

export function PageError({ message, onRetry }: PageErrorProps) {
  return (
    <div className="mb-6 p-5 bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 border border-red-200/60 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-xl shadow-sm">
            <Bell className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-red-700 font-semibold">{message}</p>
            <p className="text-xs text-red-500 mt-1">
              Please try again or contact support
            </p>
          </div>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-medium shadow-sm"
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-5 shadow-sm border border-slate-200/50">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mt-2 max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
