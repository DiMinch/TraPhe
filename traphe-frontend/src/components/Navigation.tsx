import { Link, useLocation, useNavigate } from "react-router";
import { ChevronRight, ChevronDown, LogOut } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { navItems } from "./navItems";
import { useState, useMemo } from "react";
import { authService } from "@/services/auth.service";
import type { UserRole } from "@/enums/roles.enum";

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Get current user and their roles
  const user = authService.getCurrentUser();
  const userRoles = useMemo(
    () => (user?.roles || []) as UserRole[],
    [user?.roles],
  );

  // Filter navigation items based on user permissions
  const filteredNavItems = useMemo(() => {
    return navItems
      .filter((item) => {
        // If no allowedRoles specified, show to everyone
        if (!item.allowedRoles || item.allowedRoles.length === 0) {
          return true;
        }
        // Check if user has any of the allowed roles
        return item.allowedRoles.some((role) => userRoles.includes(role));
      })
      .map((item) => {
        // Filter sub-items based on permissions
        if (item.subItems) {
          const filteredSubItems = item.subItems.filter((subItem) => {
            if (!subItem.allowedRoles || subItem.allowedRoles.length === 0) {
              // If sub-item has no specific roles, inherit from parent
              return true;
            }
            return subItem.allowedRoles.some((role) =>
              userRoles.includes(role),
            );
          });
          return { ...item, subItems: filteredSubItems };
        }
        return item;
      });
  }, [userRoles]);

  const toggleExpand = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/sign-in");
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-[240px] z-40 bg-espresso text-caramel border-r border-admin-border shadow-none flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-space-6 flex items-center gap-space-3 border-b border-smoke">
        <div className="w-10 h-10 rounded-full bg-caramel flex items-center justify-center text-white font-bold text-lg">
          T
        </div>
        <div>
          <h1 className="text-white font-bold tracking-tight text-lg">
            TraPhe Admin
          </h1>
          <p className="text-dust text-xs">Management Portal</p>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-space-4">
        <NavigationMenu
          orientation="vertical"
          className="max-w-none items-start"
        >
          <NavigationMenuList className="flex-col items-start space-x-0 space-y-1 w-full">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isExpanded = expandedItems.includes(item.path);
              const hasSubItems = item.subItems && item.subItems.length > 0;

              return (
                <div key={item.path} className="w-full">
                  <NavigationMenuItem className="w-full">
                    {hasSubItems ? (
                      <button
                        onClick={() => toggleExpand(item.path)}
                        className="w-full"
                      >
                        <NavigationMenuLink
                          asChild
                          className={cn(
                            "flex items-center justify-between w-full px-4 py-3 h-auto text-sm font-medium",
                            "transition-colors",
                            isActive
                              ? "bg-roast text-white border-l-4 border-caramel"
                              : "text-dust hover:bg-smoke/40 hover:text-white",
                          )}
                        >
                          <div className="flex flex-row items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <Icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-dust" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-dust" />
                            )}
                          </div>
                        </NavigationMenuLink>
                      </button>
                    ) : (
                      <Link to={item.path} className="w-full block">
                        <NavigationMenuLink
                          active={isActive}
                          asChild
                          className={cn(
                            "flex items-center justify-between w-full px-4 py-3 h-auto text-sm font-medium",
                            "transition-colors",
                            isActive
                              ? "bg-roast text-white border-l-4 border-caramel"
                              : "text-dust hover:bg-smoke/40 hover:text-white",
                          )}
                        >
                          <div className="flex flex-row items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <Icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-dust" />
                          </div>
                        </NavigationMenuLink>
                      </Link>
                    )}
                  </NavigationMenuItem>

                  {/* Sub Items */}
                  {hasSubItems && isExpanded && (
                    <div className="ml-7 mt-1 space-y-1">
                      {item.subItems!.map((subItem) => {
                        const isSubActive = location.pathname === subItem.path;
                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={cn(
                              "block px-4 py-2 text-sm rounded-md transition-colors",
                              isSubActive
                                ? "bg-roast/80 text-white font-medium"
                                : "text-dust hover:bg-smoke/40 hover:text-white",
                            )}
                          >
                            {subItem.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Logout */}
      <div className="py-space-4 border-t border-smoke">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-dust hover:bg-smoke/40 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
