import { Routes, Route, Navigate } from "react-router";
import { Suspense, lazy } from "react";
import { Toaster } from "./components/ui/sonner";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { UserRole } from "./enums/roles.enum";
import { PageSkeleton } from "./components/ui/skeleton-loaders";

import "./App.css";

// ---- Layouts (always loaded) ----
import AdminLayout from "./components/layout/AdminLayout";
import ClientLayout from "./components/layout/ClientLayout";

// ---- Auth Pages (eager — small, critical path) ----
import SignInPage from "./pages/auth/sign-in";
import SignUpPage from "./pages/auth/sign-up";
import ForgotPasswordPage from "./pages/auth/forgot-password";
import ResetPasswordPage from "./pages/auth/reset-password";

// ---- Lazy-loaded Pages ----

// Client
const HomePage = lazy(() => import("./pages/client/home/HomePage"));
const ShopPage = lazy(() => import("./pages/client/shop/ShopPage"));
const ClientProductDetailPage = lazy(() => import("./pages/client/product-detail/ClientProductDetailPage"));
const ContactPage = lazy(() => import("./pages/client/contact/ContactPage"));
const CartPage = lazy(() => import("./pages/client/cart/CartPage"));
const ProfilePage = lazy(() => import("./pages/client/profile/ProfilePage"));
const PaymentCallbackPage = lazy(() => import("./pages/client/cart/PaymentCallbackPage"));
const AboutPage = lazy(() => import("./pages/client/about/AboutPage"));
const MissionPage = lazy(() => import("./pages/client/mission/MissionPage"));
const BranchesPage = lazy(() => import("./pages/client/branches/BranchesPage"));
const BranchDetailPage = lazy(() => import("./pages/client/branches/BranchDetailPage"));

// Admin — Dashboard
const DashboardPage = lazy(() => import("./pages/dashboard/Dashboard"));

// Admin — Menu & Products
const ProductListPage = lazy(() => import("./pages/dashboard/Product/ProductList"));
const ProductDetailPage = lazy(() => import("./pages/dashboard/Product/ProductDetail"));
const ProductEditPage = lazy(() => import("./pages/dashboard/Product/ProductEdit"));
const CategoriesPage = lazy(() => import("./pages/dashboard/Product/Categories"));
const AttributesPage = lazy(() => import("./pages/dashboard/Product/Attributes"));
const AdminBranchMenuPage = lazy(() => import("./pages/dashboard/Product/AdminBranchMenuPage"));
const AdminToppingsPage = lazy(() => import("./pages/dashboard/Product/AdminToppingsPage"));
const CategoryPage = lazy(() => import("./pages/dashboard/Category/Category"));
const CategoryEditPage = lazy(() => import("./pages/dashboard/Category/CategoryEdit"));

// Admin — Orders & POS
const OrdersPage = lazy(() => import("./pages/dashboard/Sales/Orders"));
const OrderDetailPage = lazy(() => import("./pages/dashboard/Sales/OrderDetail"));
const POSPage = lazy(() => import("./pages/dashboard/Sales/POS"));
const PosQueuePage = lazy(() => import("./pages/dashboard/Sales/PosQueuePage"));

// Admin — Branches
const AdminBranchesPage = lazy(() => import("./pages/dashboard/Branch/AdminBranchesPage"));

// Admin — Inventory
const AdminIngredientsPage = lazy(() => import("./pages/dashboard/Ingredient/AdminIngredientsPage"));
const AdminRecipesPage = lazy(() => import("./pages/dashboard/Ingredient/AdminRecipesPage"));
const InventoryOverviewPage = lazy(() => import("./pages/dashboard/Inventory/InventoryOverview"));
const AllInventoryPage = lazy(() => import("./pages/dashboard/Inventory/AllInventory"));
const TransactionsPage = lazy(() => import("./pages/dashboard/Inventory/TransactionsPage"));
const StockAdjustPage = lazy(() => import("./pages/dashboard/Inventory/StockAdjustPage"));
const ImportStockPage = lazy(() => import("./pages/dashboard/Inventory/ImportStockPage"));

// Admin — Procurement
const SuppliersPage = lazy(() => import("./pages/dashboard/Procurement/Suppliers"));
const SupplierDetailPage = lazy(() => import("./pages/dashboard/Procurement/SupplierDetail"));

// Admin — Staff
const UserAccountsPage = lazy(() => import("./pages/dashboard/UsersRoles/UserAccounts"));
const RolesPermissionsPage = lazy(() => import("./pages/dashboard/UsersRoles/RolesPermissions"));

// Admin — Loyalty & Promotions
const CustomerPage = lazy(() => import("./pages/dashboard/Customer/Customer"));
const CustomerTierPage = lazy(() => import("./pages/dashboard/Customer/CustomerTier"));
const CustomerDetailPage = lazy(() => import("./pages/dashboard/Customer/CustomerDetail"));
const CustomerSegmentsPage = lazy(() => import("./pages/dashboard/Customer/CustomerSegments"));
const AdminLoyaltyPage = lazy(() => import("./pages/dashboard/Loyalty/AdminLoyaltyPage"));
const AdminLoyaltyRewardsPage = lazy(() => import("./pages/dashboard/Loyalty/AdminLoyaltyRewardsPage"));
const PromotionListPage = lazy(() => import("./pages/dashboard/Promotions/PromotionList"));
const PromotionDetailPage = lazy(() => import("./pages/dashboard/Promotions/PromotionDetail"));
const AdminVouchersPage = lazy(() => import("./pages/dashboard/Promotions/AdminVouchersPage"));

// Admin — Reports
const RevenueReportPage = lazy(() => import("./pages/dashboard/Reports/RevenueReport"));
const ProfitReportPage = lazy(() => import("./pages/dashboard/Reports/ProfitReport"));
const TopProductsReportPage = lazy(() => import("./pages/dashboard/Reports/TopProductsReport"));
const InventoryReportPage = lazy(() => import("./pages/dashboard/Reports/InventoryReport"));
const LoyaltyReportPage = lazy(() => import("./pages/dashboard/Reports/LoyaltyReportPage"));

// Admin — System
const ConfigurationsPage = lazy(() => import("./pages/dashboard/System/Configurations"));
const AuditLogsPage = lazy(() => import("./pages/dashboard/AuditLogs"));
const UserPage = lazy(() => import("./pages/dashboard/User"));

// Admin — AI Features
const ForecastPage = lazy(() => import("./pages/dashboard/AI/ForecastPage"));

// 404
const NotFoundPage = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          {/* Auth */}
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Client */}
          <Route element={<ClientLayout />}>
            <Route path="/" element={<HomePage />} />
            {/* Menu (Sitemap: /menu) */}
            <Route path="/menu" element={<ShopPage isDrink={true} />} />
            <Route path="/menu/:id" element={<ClientProductDetailPage />} />
            {/* Merchandise */}
            <Route path="/merchandise" element={<ShopPage isDrink={false} />} />
            {/* Branches */}
            <Route path="/branches" element={<BranchesPage />} />
            <Route path="/branches/:id" element={<BranchDetailPage />} />
            {/* Static pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/mission" element={<MissionPage />} />
            <Route path="/contact" element={<ContactPage />} />
            {/* Cart & Checkout */}
            <Route path="/cart" element={<CartPage />} />
            {/* Account */}
            <Route path="/account" element={<ProfilePage />} />
            <Route path="/account/*" element={<ProfilePage />} />
            {/* Payment callback */}
            <Route path="/order/payment-callback" element={<PaymentCallbackPage />} />
            {/* Legacy client redirects */}
            <Route path="/shop" element={<Navigate to="/menu" replace />} />
            <Route path="/products" element={<Navigate to="/menu" replace />} />
            <Route path="/profile" element={<Navigate to="/account" replace />} />
          </Route>

          {/* Admin - Protected Routes */}
          <Route element={<AdminLayout />}>
            {/* B1: Dashboard — Admin + Branch Manager */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BRANCH_MANAGER]}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* B2: Menu & Sản phẩm — Admin manages master menu */}
            <Route path="/admin/menu" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><ProductListPage /></ProtectedRoute>} />
            <Route path="/admin/menu/items" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><ProductListPage /></ProtectedRoute>} />
            <Route path="/admin/menu/items/new" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><ProductEditPage /></ProtectedRoute>} />
            <Route path="/admin/menu/items/:id" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><ProductDetailPage /></ProtectedRoute>} />
            <Route path="/admin/menu/items/:id/edit" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><ProductEditPage /></ProtectedRoute>} />
            <Route path="/admin/menu/categories" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><CategoriesPage /></ProtectedRoute>} />
            <Route path="/admin/menu/categories/:categoryName/attributes" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AttributesPage /></ProtectedRoute>} />
            <Route path="/admin/menu/branch" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BRANCH_MANAGER]}><AdminBranchMenuPage /></ProtectedRoute>} />
            <Route path="/admin/menu/toppings" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminToppingsPage /></ProtectedRoute>} />
            {/* Legacy category routes */}
            <Route path="/admin/category" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><CategoryPage /></ProtectedRoute>} />
            <Route path="/admin/category/:id/edit" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><CategoryEditPage /></ProtectedRoute>} />

            {/* B3: Đơn hàng — Admin, Cashier, Branch Manager */}
            <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.CASHIER, UserRole.BRANCH_MANAGER]}><OrdersPage /></ProtectedRoute>} />
            <Route path="/admin/orders/:id" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.CASHIER, UserRole.BRANCH_MANAGER]}><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/admin/orders/pos" element={<ProtectedRoute allowedRoles={[UserRole.CASHIER]}><POSPage /></ProtectedRoute>} />
            <Route path="/admin/orders/queue" element={<ProtectedRoute allowedRoles={[UserRole.CASHIER, UserRole.BARISTA]}><PosQueuePage /></ProtectedRoute>} />

            {/* B4: Chi nhánh */}
            <Route path="/admin/branches" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminBranchesPage /></ProtectedRoute>} />

            {/* B4: Nguyên liệu & Công thức */}
            <Route path="/admin/ingredients" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminIngredientsPage /></ProtectedRoute>} />
            <Route path="/admin/ingredients/recipes" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminRecipesPage /></ProtectedRoute>} />

            {/* B4: Kho hàng — Admin + Branch Manager */}
            <Route path="/admin/stock" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BRANCH_MANAGER]}><InventoryOverviewPage /></ProtectedRoute>} />
            <Route path="/admin/stock/all" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BRANCH_MANAGER]}><AllInventoryPage /></ProtectedRoute>} />
            <Route path="/admin/stock/import" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BRANCH_MANAGER]}><ImportStockPage /></ProtectedRoute>} />
            <Route path="/admin/stock/adjust" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BRANCH_MANAGER]}><StockAdjustPage /></ProtectedRoute>} />
            <Route path="/admin/stock/history" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BRANCH_MANAGER]}><TransactionsPage /></ProtectedRoute>} />

            {/* B4: Nhà cung cấp */}
            <Route path="/admin/suppliers" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BRANCH_MANAGER]}><SuppliersPage /></ProtectedRoute>} />
            <Route path="/admin/suppliers/:id" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BRANCH_MANAGER]}><SupplierDetailPage /></ProtectedRoute>} />
            <Route path="/admin/suppliers/import" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BRANCH_MANAGER]}><ImportStockPage /></ProtectedRoute>} />

            {/* B5: Nhân sự */}
            <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BRANCH_MANAGER]}><UserAccountsPage /></ProtectedRoute>} />
            <Route path="/admin/staff/roles" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BRANCH_MANAGER]}><RolesPermissionsPage /></ProtectedRoute>} />

            {/* B6: Loyalty & Khuyến mãi */}
            <Route path="/admin/loyalty" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminLoyaltyPage /></ProtectedRoute>} />
            <Route path="/admin/loyalty/tiers" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><CustomerTierPage /></ProtectedRoute>} />
            <Route path="/admin/loyalty/rewards" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminLoyaltyRewardsPage /></ProtectedRoute>} />
            <Route path="/admin/loyalty/customers" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><CustomerPage /></ProtectedRoute>} />
            <Route path="/admin/loyalty/customers/segments" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><CustomerSegmentsPage /></ProtectedRoute>} />
            <Route path="/admin/loyalty/customers/:id" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><CustomerDetailPage /></ProtectedRoute>} />
            <Route path="/admin/promotions" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><PromotionListPage /></ProtectedRoute>} />
            <Route path="/admin/promotions/:id" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><PromotionDetailPage /></ProtectedRoute>} />
            <Route path="/admin/vouchers" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminVouchersPage /></ProtectedRoute>} />

            {/* B7: Báo cáo — Admin + Branch Manager */}
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BRANCH_MANAGER]}><RevenueReportPage /></ProtectedRoute>} />
            <Route path="/admin/reports/revenue" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BRANCH_MANAGER]}><RevenueReportPage /></ProtectedRoute>} />
            <Route path="/admin/reports/profit" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><ProfitReportPage /></ProtectedRoute>} />
            <Route path="/admin/reports/products" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BRANCH_MANAGER]}><TopProductsReportPage /></ProtectedRoute>} />
            <Route path="/admin/reports/inventory" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BRANCH_MANAGER]}><InventoryReportPage /></ProtectedRoute>} />
            <Route path="/admin/reports/loyalty" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><LoyaltyReportPage /></ProtectedRoute>} />

            {/* AI Features */}
            <Route path="/admin/ai/forecast" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BRANCH_MANAGER]}><ForecastPage /></ProtectedRoute>} />

            {/* B8: Cài đặt */}
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><ConfigurationsPage /></ProtectedRoute>} />
            <Route path="/admin/settings/audit-log" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AuditLogsPage /></ProtectedRoute>} />

            {/* User profile (admin side) */}
            <Route path="/admin/user" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><UserPage /></ProtectedRoute>} />

            {/* Legacy admin redirects (kept minimal — will be removed after migration) */}
            <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
          </Route>

          {/* 404 — catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      <Toaster position="top-right" />
    </>
  );
}

export default App;
