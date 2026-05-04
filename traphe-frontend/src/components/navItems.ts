import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Clipboard,
  ChartBar,
  Users,
  Tag,
  Settings,
  UserCog,
  ClipboardList,
} from "lucide-react";

export interface NavItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: { title: string; path: string }[];
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Product",
    path: "/product",
    icon: Package,
    subItems: [
      { title: "Product List", path: "/product/productlist" },
      { title: "Categories", path: "/product/categories" },
      { title: "Attributes", path: "/product/attributes" },
    ],
  },
  {
    title: "Inventory",
    path: "/inventory",
    icon: ShoppingCart,
    subItems: [
      { title: "Overview", path: "/inventory/overview" },
      { title: "All Inventory", path: "/inventory/all" },
      { title: "Transactions", path: "/inventory/transactions" },
    ],
  },
  {
    title: "Procurement",
    path: "/procurement",
    icon: Clipboard,
    subItems: [
      { title: "Suppliers", path: "/procurement/suppliers" },
      { title: "Purchase Orders", path: "/procurement/purchase-orders" },
    ],
  },
  {
    title: "Sales",
    path: "/sales",
    icon: ChartBar,
  },
  {
    title: "Customers",
    path: "/customer",
    icon: Users,
  },
  {
    title: "Marketing & Ads",
    path: "/marketing",
    icon: Tag,
  },
  {
    title: "Promotions",
    path: "/promotions",
    icon: Tag,
  },
  {
    title: "System",
    path: "/system",
    icon: Settings,
  },
  {
    title: "Users & Roles",
    path: "/users-roles",
    icon: UserCog,
  },
  {
    title: "Audit Logs",
    path: "/audit-logs",
    icon: ClipboardList,
  },
];
