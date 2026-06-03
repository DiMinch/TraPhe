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
  BarChart3,
  Store,
  Leaf,
  Gift,
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
    path: "/admin",
    icon: LayoutDashboard,
    allowedRoles: [
      UserRole.ADMIN,
      UserRole.BRANCH_MANAGER,
    ],
  },
  {
    title: "Menu",
    path: "/admin/menu",
    icon: Package,
    allowedRoles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER],
    subItems: [
      { title: "Sản phẩm", path: "/admin/menu/items", allowedRoles: [UserRole.ADMIN] },
      { title: "Topping", path: "/admin/menu/toppings", allowedRoles: [UserRole.ADMIN] },
      { title: "Danh mục", path: "/admin/menu/categories", allowedRoles: [UserRole.ADMIN] },
      { title: "Menu chi nhánh", path: "/admin/menu/branch", allowedRoles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER] },
    ],
  },
  {
    title: "Chi nhánh",
    path: "/admin/branches",
    icon: Store,
    allowedRoles: [UserRole.ADMIN],
    subItems: [
      { title: "Danh sách", path: "/admin/branches" },
    ],
  },
  {
    title: "Nguyên liệu",
    path: "/admin/ingredients",
    icon: Leaf,
    allowedRoles: [UserRole.ADMIN],
    subItems: [
      { title: "Danh mục NL", path: "/admin/ingredients" },
      { title: "Công thức", path: "/admin/ingredients/recipes" },
    ],
  },
  {
    title: "Kho hàng",
    path: "/admin/stock",
    icon: ShoppingCart,
    allowedRoles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER],
    subItems: [
      { title: "Tổng quan", path: "/admin/stock", allowedRoles: [UserRole.ADMIN] },
      { title: "Tồn kho", path: "/admin/stock/all" },
      { title: "Nhập kho", path: "/admin/stock/import" },
      { title: "Điều chỉnh", path: "/admin/stock/adjust" },
      { title: "Lịch sử", path: "/admin/stock/history" },
    ],
  },
  {
    title: "Nhà cung cấp",
    path: "/admin/suppliers",
    icon: Clipboard,
    allowedRoles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER],
    subItems: [
      { title: "Danh sách NCC", path: "/admin/suppliers" },
      { title: "Nhập kho NL", path: "/admin/suppliers/import" },
    ],
  },
  {
    title: "Đơn hàng",
    path: "/admin/orders",
    icon: ChartBar,
    allowedRoles: [UserRole.ADMIN, UserRole.CASHIER, UserRole.BARISTA, UserRole.BRANCH_MANAGER],
    subItems: [
      { title: "POS", path: "/admin/orders/pos", allowedRoles: [UserRole.CASHIER] },
      { title: "Hàng đợi pha chế", path: "/admin/orders/queue", allowedRoles: [UserRole.CASHIER, UserRole.BARISTA] },
      { title: "Tất cả đơn", path: "/admin/orders", allowedRoles: [UserRole.ADMIN, UserRole.CASHIER, UserRole.BRANCH_MANAGER] },
    ],
  },
  {
    title: "Khách hàng",
    path: "/admin/loyalty/customers",
    icon: Users,
    allowedRoles: [UserRole.ADMIN],
    subItems: [
      { title: "Danh sách KH", path: "/admin/loyalty/customers" },
      {
        title: "Hạng thành viên",
        path: "/admin/loyalty/tiers",
        allowedRoles: [UserRole.ADMIN],
      },
    ],
  },
  {
    title: "Loyalty",
    path: "/admin/loyalty",
    icon: Gift,
    allowedRoles: [UserRole.ADMIN],
    subItems: [
      { title: "Tổng quan", path: "/admin/loyalty" },
      { title: "Quà đổi điểm", path: "/admin/loyalty/rewards" },
    ],
  },
  {
    title: "Khuyến mãi",
    path: "/admin/promotions",
    icon: Tag,
    allowedRoles: [UserRole.ADMIN],
    subItems: [
      { title: "Chương trình KM", path: "/admin/promotions" },
      { title: "Voucher", path: "/admin/vouchers" },
    ],
  },
  {
    title: "Báo cáo",
    path: "/admin/reports",
    icon: BarChart3,
    allowedRoles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER],
    subItems: [
      { title: "Doanh thu", path: "/admin/reports/revenue" },
      { title: "Lợi nhuận", path: "/admin/reports/profit", allowedRoles: [UserRole.ADMIN] },
      { title: "Món bán chạy", path: "/admin/reports/products" },
      { title: "Tồn kho", path: "/admin/reports/inventory" },
      { title: "Loyalty", path: "/admin/reports/loyalty", allowedRoles: [UserRole.ADMIN] },
    ],
  },
  {
    title: "Nhân sự",
    path: "/admin/staff",
    icon: UserCog,
    allowedRoles: [UserRole.ADMIN, UserRole.BRANCH_MANAGER],
    subItems: [
      { title: "Tài khoản NV", path: "/admin/staff" },
      { title: "Vai trò & Quyền", path: "/admin/staff/roles", allowedRoles: [UserRole.ADMIN] },
    ],
  },
  {
    title: "Cài đặt",
    path: "/admin/settings",
    icon: Settings,
    allowedRoles: [UserRole.ADMIN],
    subItems: [
      { title: "Cấu hình", path: "/admin/settings" },
      { title: "Nhật ký", path: "/admin/settings/audit-log" },
    ],
  },
];
