import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "./components/ui/sonner";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { UserRole } from "./enums/roles.enum";

// Auth Pages
import SignUpPage from "./pages/auth/sign-up";
import SignInPage from "./pages/auth/sign-in";
import ForgotPasswordPage from "./pages/auth/forgot-password";
import ResetPasswordPage from "./pages/auth/reset-password";

// Admin Pages
import DashboardPage from "./pages/dashboard/Dashboard";
import CustomerPage from "./pages/dashboard/Customer/Customer";
import CustomerTierPage from "./pages/dashboard/Customer/CustomerTier";
import CustomerDetailPage from "./pages/dashboard/Customer/CustomerDetail";
import ProductListPage from "./pages/dashboard/Product/ProductList";
import AdminToppingsPage from "./pages/dashboard/Product/AdminToppingsPage";
import ProductDetailPage from "./pages/dashboard/Product/ProductDetail";
import ProductEditPage from "./pages/dashboard/Product/ProductEdit";
import CategoryPage from "./pages/dashboard/Category/Category";
import CategoryEditPage from "./pages/dashboard/Category/CategoryEdit";
import CategoriesPage from "./pages/dashboard/Product/Categories";
import AttributesPage from "./pages/dashboard/Product/Attributes";
import AdminBranchMenuPage from "./pages/dashboard/Product/AdminBranchMenuPage";
import AdminBranchesPage from "./pages/dashboard/Branch/AdminBranchesPage";
import AdminIngredientsPage from "./pages/dashboard/Ingredient/AdminIngredientsPage";
import AdminRecipesPage from "./pages/dashboard/Ingredient/AdminRecipesPage";
import InventoryOverviewPage from "./pages/dashboard/Inventory/InventoryOverview";
import AllInventoryPage from "./pages/dashboard/Inventory/AllInventory";
import TransactionsPage from "./pages/dashboard/Inventory/TransactionsPage";
import StockAdjustPage from "./pages/dashboard/Inventory/StockAdjustPage";
import ImportStockPage from "./pages/dashboard/Inventory/ImportStockPage";
import SuppliersPage from "./pages/dashboard/Procurement/Suppliers";
import SupplierDetailPage from "./pages/dashboard/Procurement/SupplierDetail";
import POSPage from "./pages/dashboard/Sales/POS";
import PosQueuePage from "./pages/dashboard/Sales/PosQueuePage";
import OrdersPage from "./pages/dashboard/Sales/Orders";
import OrderDetailPage from "./pages/dashboard/Sales/OrderDetail";
import UserPage from "./pages/dashboard/User";
import AuditLogsPage from "./pages/dashboard/AuditLogs";
import ConfigurationsPage from "./pages/dashboard/System/Configurations";
import UserAccountsPage from "./pages/dashboard/UsersRoles/UserAccounts";
import RolesPermissionsPage from "./pages/dashboard/UsersRoles/RolesPermissions";
import PromotionListPage from "./pages/dashboard/Promotions/PromotionList";
import PromotionDetailPage from "./pages/dashboard/Promotions/PromotionDetail";
import AdminVouchersPage from "./pages/dashboard/Promotions/AdminVouchersPage";
import AdminLoyaltyPage from "./pages/dashboard/Loyalty/AdminLoyaltyPage";
import AdminLoyaltyRewardsPage from "./pages/dashboard/Loyalty/AdminLoyaltyRewardsPage";
import RevenueReportPage from "./pages/dashboard/Reports/RevenueReport";
import ProfitReportPage from "./pages/dashboard/Reports/ProfitReport";
import TopProductsReportPage from "./pages/dashboard/Reports/TopProductsReport";
import InventoryReportPage from "./pages/dashboard/Reports/InventoryReport";
import LoyaltyReportPage from "./pages/dashboard/Reports/LoyaltyReportPage";
import AdminLayout from "./components/layout/AdminLayout";

// Client Pages
import HomePage from "./pages/client/home/HomePage";
import ClientLayout from "./components/layout/ClientLayout";
import ClientProductDetailPage from "./pages/client/product-detail/ClientProductDetailPage";
import ShopPage from "./pages/client/shop/ShopPage";
import ContactPage from "./pages/client/contact/ContactPage";
import CartPage from "./pages/client/cart/CartPage";
import ProfilePage from "./pages/client/profile/ProfilePage";
import PaymentCallbackPage from "./pages/client/cart/PaymentCallbackPage";
import AboutPage from "./pages/client/about/AboutPage";
import MissionPage from "./pages/client/mission/MissionPage";
import BranchesPage from "./pages/client/branches/BranchesPage";
import BranchDetailPage from "./pages/client/branches/BranchDetailPage";

import "./App.css";

function App() {
  return (
    <>
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
          {/* Cart & Checkout (merged wizard) */}
          <Route path="/cart" element={<CartPage />} />
          {/* Account (merged tabs in ProfilePage) */}
          <Route path="/account" element={<ProfilePage />} />
          <Route path="/account/*" element={<ProfilePage />} />
          {/* Payment callback */}
          <Route path="/order/payment-callback" element={<PaymentCallbackPage />} />
          {/* Legacy redirects */}
          <Route path="/shop" element={<Navigate to="/menu" replace />} />
          <Route path="/products" element={<Navigate to="/menu" replace />} />
          <Route path="/products/:id" element={<Navigate to="/menu/:id" replace />} />
          <Route path="/profile" element={<Navigate to="/account" replace />} />
        </Route>

        {/* Admin - Protected Routes */}
        <Route element={<AdminLayout />}>
          {/* B1: Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.ACCOUNTANT]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* B2: Menu & Sản phẩm */}
          <Route path="/admin/menu" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}><ProductListPage /></ProtectedRoute>} />
          <Route path="/admin/menu/items" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}><ProductListPage /></ProtectedRoute>} />
          <Route path="/admin/menu/items/new" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}><ProductEditPage /></ProtectedRoute>} />
          <Route path="/admin/menu/items/:id" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}><ProductDetailPage /></ProtectedRoute>} />
          <Route path="/admin/menu/items/:id/edit" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}><ProductEditPage /></ProtectedRoute>} />
          <Route path="/admin/menu/categories" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}><CategoriesPage /></ProtectedRoute>} />
          <Route path="/admin/menu/categories/:categoryName/attributes" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}><AttributesPage /></ProtectedRoute>} />
          <Route path="/admin/menu/branch" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BRANCH_MANAGER]}><AdminBranchMenuPage /></ProtectedRoute>} />
          {/* Legacy category routes */}
          <Route path="/admin/category" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}><CategoryPage /></ProtectedRoute>} />
          <Route path="/admin/category/:id/edit" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}><CategoryEditPage /></ProtectedRoute>} />

          {/* B3: Đơn hàng */}
          <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CASHIER, UserRole.BRANCH_MANAGER]}><OrdersPage /></ProtectedRoute>} />
          <Route path="/admin/orders/:id" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CASHIER, UserRole.BRANCH_MANAGER]}><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/admin/orders/pos" element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYEE, UserRole.CASHIER]}><POSPage /></ProtectedRoute>} />
          <Route path="/admin/orders/queue" element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYEE, UserRole.CASHIER, UserRole.BARISTA]}><PosQueuePage /></ProtectedRoute>} />

          {/* B4: Chi nhánh */}
          <Route path="/admin/branches" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminBranchesPage /></ProtectedRoute>} />

          {/* B4: Nguyên liệu & Công thức */}
          <Route path="/admin/ingredients" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}><AdminIngredientsPage /></ProtectedRoute>} />
          <Route path="/admin/ingredients/recipes" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}><AdminRecipesPage /></ProtectedRoute>} />

          {/* B4: Kho hàng */}
          <Route path="/admin/stock" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.BRANCH_MANAGER]}><InventoryOverviewPage /></ProtectedRoute>} />
          <Route path="/admin/stock/all" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.BRANCH_MANAGER]}><AllInventoryPage /></ProtectedRoute>} />
          <Route path="/admin/stock/import" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.BRANCH_MANAGER]}><ImportStockPage /></ProtectedRoute>} />
          <Route path="/admin/stock/adjust" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.BRANCH_MANAGER]}><StockAdjustPage /></ProtectedRoute>} />
          <Route path="/admin/stock/history" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.BRANCH_MANAGER]}><TransactionsPage /></ProtectedRoute>} />

          {/* B4: Nhà cung cấp */}
          <Route path="/admin/suppliers" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.BRANCH_MANAGER]}><SuppliersPage /></ProtectedRoute>} />
          <Route path="/admin/suppliers/:id" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.BRANCH_MANAGER]}><SupplierDetailPage /></ProtectedRoute>} />
          {/* Nhập kho nguyên liệu từ nhà cung cấp → dùng ImportStockPage */}
          <Route path="/admin/suppliers/import" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.BRANCH_MANAGER]}><ImportStockPage /></ProtectedRoute>} />

          {/* B5: Nhân sự */}
          <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BRANCH_MANAGER]}><UserAccountsPage /></ProtectedRoute>} />
          <Route path="/admin/staff/roles" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.BRANCH_MANAGER]}><RolesPermissionsPage /></ProtectedRoute>} />

          {/* B6: Loyalty & Khuyến mãi */}
          <Route path="/admin/loyalty" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminLoyaltyPage /></ProtectedRoute>} />
          <Route path="/admin/loyalty/tiers" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><CustomerTierPage /></ProtectedRoute>} />
          <Route path="/admin/loyalty/rewards" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminLoyaltyRewardsPage /></ProtectedRoute>} />
          <Route path="/admin/loyalty/customers" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}><CustomerPage /></ProtectedRoute>} />
          <Route path="/admin/loyalty/customers/:id" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}><CustomerDetailPage /></ProtectedRoute>} />
          <Route path="/admin/promotions" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><PromotionListPage /></ProtectedRoute>} />
          <Route path="/admin/promotions/:id" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><PromotionDetailPage /></ProtectedRoute>} />
          <Route path="/admin/vouchers" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminVouchersPage /></ProtectedRoute>} />
          <Route path="/admin/menu/toppings" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}><AdminToppingsPage /></ProtectedRoute>} />

          {/* B7: Báo cáo */}
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_MANAGER]}><RevenueReportPage /></ProtectedRoute>} />
          <Route path="/admin/reports/revenue" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_MANAGER]}><RevenueReportPage /></ProtectedRoute>} />
          <Route path="/admin/reports/profit" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.ACCOUNTANT]}><ProfitReportPage /></ProtectedRoute>} />
          <Route path="/admin/reports/products" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_MANAGER]}><TopProductsReportPage /></ProtectedRoute>} />
          <Route path="/admin/reports/inventory" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_MANAGER]}><InventoryReportPage /></ProtectedRoute>} />
          <Route path="/admin/reports/loyalty" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><LoyaltyReportPage /></ProtectedRoute>} />

          {/* B8: Cài đặt */}
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><ConfigurationsPage /></ProtectedRoute>} />
          <Route path="/admin/settings/audit-log" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AuditLogsPage /></ProtectedRoute>} />

          {/* User profile (admin side) */}
          <Route path="/admin/user" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}><UserPage /></ProtectedRoute>} />

          {/* Legacy admin route redirects */}
          <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/product/*" element={<Navigate to="/admin/menu/items" replace />} />
          <Route path="/category/*" element={<Navigate to="/admin/menu/categories" replace />} />
          <Route path="/inventory/*" element={<Navigate to="/admin/stock" replace />} />
          <Route path="/procurement/*" element={<Navigate to="/admin/suppliers" replace />} />
          <Route path="/sales/*" element={<Navigate to="/admin/orders" replace />} />
          <Route path="/customer/*" element={<Navigate to="/admin/loyalty/customers" replace />} />
          <Route path="/promotions/*" element={<Navigate to="/admin/promotions" replace />} />
          <Route path="/reports/*" element={<Navigate to="/admin/reports" replace />} />
          <Route path="/system/*" element={<Navigate to="/admin/settings" replace />} />
          <Route path="/users-roles/*" element={<Navigate to="/admin/staff" replace />} />
          <Route path="/audit-logs" element={<Navigate to="/admin/settings/audit-log" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster position="top-right" />
    </>
  );
}

export default App;
