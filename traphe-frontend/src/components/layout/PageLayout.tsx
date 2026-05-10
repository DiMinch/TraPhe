import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RefreshCw } from "lucide-react";
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
        <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm text-slate-700 font-medium">
            {userRole} • {userName}
          </span>
          <Avatar className="w-8 h-8">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
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
            className="bg-white hover:bg-slate-50 rounded-full shadow-sm border border-slate-200 w-10 h-10"
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
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      {children}
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
          <div className="w-16 h-16 rounded-full border-4 border-slate-200 animate-pulse"></div>
          <RefreshCw className="w-8 h-8 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
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
    <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Bell className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-red-700 font-medium">{message}</p>
            <p className="text-xs text-red-500 mt-0.5">
              Please try again or contact support
            </p>
          </div>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            Retry
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
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
