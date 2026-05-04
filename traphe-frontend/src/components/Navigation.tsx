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
import { useState } from "react";

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );
  };

  return (
    <nav className="flex flex-col w-[281px] min-h-screen bg-white border-r-3 border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-0 ">
        <h1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Admin
        </h1>
        <button className="text-gray-400 hover:text-gray-600">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center justify-center  px-6">
        <img src="/public/logo.svg" alt="logo" width={200} height={200} />
      </div>

      {/* Navigation Label */}
      <div className="px-6 py-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Navigation
        </h2>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-3 pb-4 overflow-y-auto">
        <NavigationMenu
          orientation="vertical"
          className="max-w-none items-start"
        >
          <NavigationMenuList className="flex-col items-start space-x-0 space-y-1 w-full">
            {navItems.map((item) => {
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
                            "flex items-center justify-between w-full px-4 py-2.5 h-auto rounded-md text-sm font-normal",
                            "hover:bg-gray-100 transition-colors",
                            isActive
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                          )}
                        >
                          <div className="flex flex-row items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <Icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400" />
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
                            "flex items-center justify-between w-full px-4 py-2.5 h-auto rounded-md text-sm font-normal",
                            "hover:bg-gray-100 transition-colors",
                            isActive
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                          )}
                        >
                          <div className="flex flex-row items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <Icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
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
                                ? "bg-gray-100 text-gray-900 font-medium"
                                : "text-gray-600 hover:bg-gray-50",
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
      <div className="p-3 ">
        <button
          onClick={() => navigate("/sign-in")}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
