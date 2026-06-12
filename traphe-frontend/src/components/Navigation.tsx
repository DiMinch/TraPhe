import { Link, useLocation, useNavigate } from "react-router";
import { ChevronRight, ChevronDown, ChevronLeft, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "./navItems";
import { useState, useMemo } from "react";
import { authService } from "@/services/auth.service";
import type { UserRole } from "@/enums/roles.enum";

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("admin-sidebar-collapsed") === "true";
  });

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin-sidebar-collapsed", String(next));
      return next;
    });
  };

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

  const handleItemClick = (item: any) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      localStorage.setItem("admin-sidebar-collapsed", "false");
      if (item.subItems && item.subItems.length > 0) {
        if (!expandedItems.includes(item.path)) {
          setExpandedItems((prev) => [...prev, item.path]);
        }
      }
    } else {
      toggleExpand(item.path);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/sign-in");
  };

  return (
    <nav
      className={cn(
        "h-full z-40 bg-espresso text-caramel border-r border-admin-border shadow-none flex flex-col overflow-y-auto shrink-0 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "p-4 flex items-center border-b border-smoke transition-all duration-300",
          isCollapsed ? "flex-col gap-3 justify-center" : "justify-between"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-caramel flex items-center justify-center text-white font-bold text-lg shrink-0">
            T
          </div>
          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-300">
              <h1 className="text-white font-bold tracking-tight text-sm truncate">
                TraPhe Admin
              </h1>
              <p className="text-dust text-[10px] truncate">Management Portal</p>
            </div>
          )}
        </div>
        <button
          onClick={handleToggleCollapse}
          className="p-1.5 hover:bg-smoke/30 rounded-lg text-dust hover:text-white transition-colors cursor-pointer shrink-0"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 w-full px-2 overflow-y-auto">
        <div className="flex flex-col gap-1 w-full">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isActive = hasSubItems
              ? location.pathname.startsWith(item.path)
              : location.pathname === item.path;
            const isExpanded =
              expandedItems.includes(item.path) ||
              (hasSubItems && location.pathname.startsWith(item.path));

            return (
              <div key={item.path} className="w-full">
                {hasSubItems ? (
                  <button
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "flex items-center justify-between w-full h-auto text-sm font-medium transition-colors rounded-md cursor-pointer",
                      isCollapsed ? "justify-center px-0 py-3" : "px-4 py-3",
                      isActive
                        ? "bg-roast text-white border-l-4 border-caramel"
                        : "text-dust hover:bg-smoke/40 hover:text-white",
                    )}
                    title={item.title}
                  >
                    <div className={cn("flex items-center w-full", isCollapsed ? "justify-center" : "justify-between")}>
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="h-4 w-4 shrink-0" />
                        {!isCollapsed && <span className="whitespace-nowrap truncate">{item.title}</span>}
                      </div>
                      {!isCollapsed && (isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-dust shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-dust shrink-0" />
                      ))}
                    </div>
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center justify-between w-full h-auto text-sm font-medium transition-colors rounded-md cursor-pointer",
                      isCollapsed ? "justify-center px-0 py-3" : "px-4 py-3",
                      isActive
                        ? "bg-roast text-white border-l-4 border-caramel"
                        : "text-dust hover:bg-smoke/40 hover:text-white",
                    )}
                    title={item.title}
                  >
                    <div className={cn("flex items-center w-full", isCollapsed ? "justify-center" : "justify-between")}>
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="h-4 w-4 shrink-0" />
                        {!isCollapsed && <span className="whitespace-nowrap truncate">{item.title}</span>}
                      </div>
                      {!isCollapsed && <ChevronRight className="h-4 w-4 text-dust shrink-0" />}
                    </div>
                  </Link>
                )}

                {/* Sub Items */}
                {hasSubItems && isExpanded && !isCollapsed && (
                  <div className="ml-7 mt-1 space-y-1">
                    {item.subItems!.map((subItem) => {
                      const isSubActive = location.pathname === subItem.path;
                      return (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={cn(
                            "block px-4 py-2 text-sm rounded-md transition-colors whitespace-nowrap truncate",
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
        </div>
      </div>

      {/* Logout */}
      <div className="py-space-4 border-t border-smoke">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full py-3 text-sm text-dust hover:bg-smoke/40 hover:text-white transition-colors cursor-pointer",
            isCollapsed ? "justify-center px-0" : "px-4"
          )}
          title="Logout"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </nav>
  );
}
