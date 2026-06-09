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
import { UserRole } from "@/enums/roles.enum";

export interface NavItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: { title: string; path: string; allowedRoles?: UserRole[] }[];
  allowedRoles?: UserRole[];
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: [
      UserRole.ADMIN,
      UserRole.EMPLOYEE,
      UserRole.CASHIER,
      UserRole.ACCOUNTANT,
    ],
  },
  {
    title: "Product",
    path: "/product",
    icon: Package,
    allowedRoles: [UserRole.ADMIN, UserRole.EMPLOYEE],
    subItems: [
      { title: "Product List", path: "/product/productlist" },
      { title: "Categories", path: "/product/categories" },
    ],
  },
  {
    title: "Inventory",
    path: "/inventory",
    icon: ShoppingCart,
    allowedRoles: [UserRole.ADMIN, UserRole.EMPLOYEE],
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
    allowedRoles: [UserRole.ADMIN, UserRole.EMPLOYEE],
    subItems: [
      { title: "Suppliers", path: "/procurement/suppliers" },
      { title: "Purchase Orders", path: "/procurement/purchase-orders" },
    ],
  },
  {
    title: "Sales",
    path: "/sales",
    icon: ChartBar,
    allowedRoles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CASHIER],
    subItems: [
      { title: "POS", path: "/sales/pos" },
      { title: "Orders", path: "/sales/orders" },
    ],
  },

  {
    title: "Customers",
    path: "/customer",
    icon: Users,
    allowedRoles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CASHIER],
    subItems: [
      { title: "Customer List", path: "/customer" },
      {
        title: "Customer Tiers",
        path: "/customer/tiers",
        allowedRoles: [UserRole.ADMIN],
      },
    ],
  },

  {
    title: "Warranty & Service",
    path: "/warranty",
    icon: Wrench,
    allowedRoles: [UserRole.ADMIN, UserRole.EMPLOYEE],
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
    allowedRoles: [UserRole.ADMIN],
  },
  {
    title: "Reports",
    path: "/reports",
    icon: BarChart3,
    allowedRoles: [UserRole.ADMIN, UserRole.ACCOUNTANT],
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
    allowedRoles: [UserRole.ADMIN],
    subItems: [{ title: "Configurations", path: "/system/configurations" }],
  },
  {
    title: "Users & Roles",
    path: "/users-roles",
    icon: UserCog,
    allowedRoles: [UserRole.ADMIN],
    subItems: [
      { title: "User Accounts", path: "/users-roles/user-accounts" },
      { title: "Roles & Permissions", path: "/users-roles/roles-permissions" },
    ],
  },
  {
    title: "Audit Logs",
    path: "/audit-logs",
    icon: ClipboardList,
    allowedRoles: [UserRole.ADMIN],
  },
];
