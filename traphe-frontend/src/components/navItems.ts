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
  Wrench,
  BarChart3,
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
    subItems: [
      { title: "POS", path: "/sales/pos" },
      { title: "Orders", path: "/sales/orders" },
    ],
  },

  {
    title: "Customers",
    path: "/customer",
    icon: Users,
    subItems: [
      { title: "Customer List", path: "/customer" },
      { title: "Customer Tiers", path: "/customer/tiers" },
    ],
  },

  {
    title: "Warranty & Service",
    path: "/warranty",
    icon: Wrench,
    subItems: [
      { title: "Warranty Tickets", path: "/warranty/tickets" },
      { title: "Service Types", path: "/warranty/service-types" },
      { title: "Parts & Components", path: "/warranty/parts-components" },
    ],
  },

  {
    title: "Promotions",
    path: "/promotions",
    icon: Tag,
  },
  {
    title: "Reports",
    path: "/reports",
    icon: BarChart3,
    subItems: [
      { title: "Revenue Report", path: "/reports/revenue" },
      { title: "Profit Report", path: "/reports/profit" },
      { title: "Top Products", path: "/reports/top-products" },
      { title: "Inventory Report", path: "/reports/inventory" },
    ],
  },
  {
    title: "System",
    path: "/system",
    icon: Settings,
    subItems: [{ title: "Configurations", path: "/system/configurations" }],
  },
  {
    title: "Users & Roles",
    path: "/users-roles",
    icon: UserCog,
    subItems: [
      { title: "User Accounts", path: "/users-roles/user-accounts" },
      { title: "Roles & Permissions", path: "/users-roles/roles-permissions" },
    ],
  },
  {
    title: "Audit Logs",
    path: "/audit-logs",
    icon: ClipboardList,
  },
];
