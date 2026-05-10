import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "./components/ui/sonner";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { UserRole } from "./enums/roles.enum";

// Auth Pages
import SignUpPage from "./pages/auth/sign-up";
import SignInPage from "./pages/auth/sign-in";

// Admin Pages
import DashboardPage from "./pages/dashboard/Dashboard";
import CustomerPage from "./pages/dashboard/Customer/Customer";
import CustomerTierPage from "./pages/dashboard/Customer/CustomerTier";
import CustomerDetailPage from "./pages/dashboard/Customer/CustomerDetail";
import ProductListPage from "./pages/dashboard/Product/ProductList";
import ProductDetailPage from "./pages/dashboard/Product/ProductDetail";
import ProductEditPage from "./pages/dashboard/Product/ProductEdit";
import CategoryPage from "./pages/dashboard/Category/Category";
import CategoryEditPage from "./pages/dashboard/Category/CategoryEdit";
import CategoriesPage from "./pages/dashboard/Product/Categories";
import AttributesPage from "./pages/dashboard/Product/Attributes";
import InventoryOverviewPage from "./pages/dashboard/Inventory/InventoryOverview";
import AllInventoryPage from "./pages/dashboard/Inventory/AllInventory";
import TransactionsPage from "./pages/dashboard/Inventory/TransactionsPage";
import SuppliersPage from "./pages/dashboard/Procurement/Suppliers";
import PurchaseOrdersPage from "./pages/dashboard/Procurement/PurchaseOrders";
import SupplierDetailPage from "./pages/dashboard/Procurement/SupplierDetail";
import PurchaseOrderDetailPage from "./pages/dashboard/Procurement/PurchaseOrderDetail";
import POSPage from "./pages/dashboard/Sales/POS";
import OrdersPage from "./pages/dashboard/Sales/Orders";
import WarrantyTicketsPage from "./pages/dashboard/Warranty/WarrantyTickets";
import WarrantyTicketDetailPage from "./pages/dashboard/Warranty/WarrantyTicketDetail";
import ServiceTypesPage from "./pages/dashboard/Warranty/ServiceTypes";
import PartsAndComponentsPage from "./pages/dashboard/Warranty/PartsAndComponents";
import UserPage from "./pages/dashboard/User";
import AuditLogsPage from "./pages/dashboard/AuditLogs";
import ConfigurationsPage from "./pages/dashboard/System/Configurations";
import UserAccountsPage from "./pages/dashboard/UsersRoles/UserAccounts";
import RolesPermissionsPage from "./pages/dashboard/UsersRoles/RolesPermissions";
import PromotionListPage from "./pages/dashboard/Promotions/PromotionList";
import PromotionDetailPage from "./pages/dashboard/Promotions/PromotionDetail";
import RevenueReportPage from "./pages/dashboard/Reports/RevenueReport";
import ProfitReportPage from "./pages/dashboard/Reports/ProfitReport";
import TopProductsReportPage from "./pages/dashboard/Reports/TopProductsReport";
import InventoryReportPage from "./pages/dashboard/Reports/InventoryReport";
import AdminLayout from "./components/layout/AdminLayout";

// Client Pages
import HomePage from "./pages/client/home/HomePage";
import ClientLayout from "./components/layout/ClientLayout";
import ClientProductPage from "./pages/client/product/ClientProductPage";
import ClientProductDetailPage from "./pages/client/product-detail/ClientProductDetailPage";
import ShopPage from "./pages/client/shop/ShopPage";
import ContactPage from "./pages/client/contact/ContactPage";
import CartPage from "./pages/client/cart/CartPage";
import ProfilePage from "./pages/client/profile/ProfilePage";

import "./App.css";

function App() {
  return (
    <>
      <Routes>
        {/* Auth */}
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/sign-in" element={<SignInPage />} />

        {/* Client */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products" element={<ClientProductPage />} />
          <Route path="/products/:id" element={<ClientProductDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Admin - Protected Routes */}
        <Route element={<AdminLayout />}>
          {/* Dashboard - All admin roles */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                allowedRoles={[
                  UserRole.ADMIN,
                  UserRole.EMPLOYEE,
                  UserRole.CASHIER,
                  UserRole.ACCOUNTANT,
                ]}
              >
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Customer Management - Admin, Employee, Cashier */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute
                allowedRoles={[
                  UserRole.ADMIN,
                  UserRole.EMPLOYEE,
                  UserRole.CASHIER,
                ]}
              >
                <CustomerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/tiers"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <CustomerTierPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/:id"
            element={
              <ProtectedRoute
                allowedRoles={[
                  UserRole.ADMIN,
                  UserRole.EMPLOYEE,
                  UserRole.CASHIER,
                ]}
              >
                <CustomerDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Product Management - Admin, Employee */}
          <Route
            path="/product"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <ProductListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/productlist"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <ProductListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/detail/:id"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <ProductDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/edit/:id"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <ProductEditPage />
              </ProtectedRoute>
            }
          />

          {/* Category Management - Admin, Employee */}
          <Route
            path="/category"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <CategoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/category/:id/edit"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <CategoryEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/categories"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <CategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/categories/:categoryName/attributes"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <AttributesPage />
              </ProtectedRoute>
            }
          />

          {/* Inventory - Admin, Employee */}
          <Route
            path="/inventory"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <InventoryOverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/overview"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <InventoryOverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/all"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <AllInventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/transactions"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <TransactionsPage />
              </ProtectedRoute>
            }
          />

          {/* Procurement - Admin, Employee */}
          <Route
            path="/procurement"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <SuppliersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/procurement/suppliers"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <SuppliersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/procurement/suppliers/:id"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <SupplierDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/procurement/purchase-orders"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <PurchaseOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/procurement/purchase-orders/:id"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <PurchaseOrderDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Sales - Admin, Employee, Cashier */}
          <Route
            path="/sales"
            element={
              <ProtectedRoute
                allowedRoles={[
                  UserRole.ADMIN,
                  UserRole.EMPLOYEE,
                  UserRole.CASHIER,
                ]}
              >
                <POSPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/pos"
            element={
              <ProtectedRoute
                allowedRoles={[
                  UserRole.ADMIN,
                  UserRole.EMPLOYEE,
                  UserRole.CASHIER,
                ]}
              >
                <POSPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/orders"
            element={
              <ProtectedRoute
                allowedRoles={[
                  UserRole.ADMIN,
                  UserRole.EMPLOYEE,
                  UserRole.CASHIER,
                ]}
              >
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          {/* Warranty & Service - Admin, Employee */}
          <Route
            path="/warranty"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <WarrantyTicketsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warranty/tickets"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <WarrantyTicketsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warranty/tickets/:id"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <WarrantyTicketDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warranty/service-types"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <ServiceTypesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warranty/parts-components"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <PartsAndComponentsPage />
              </ProtectedRoute>
            }
          />

          {/* User Profile - Admin, Employee */}
          <Route
            path="/user"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}
              >
                <UserPage />
              </ProtectedRoute>
            }
          />

          {/* Audit Logs - Admin only */}
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />

          {/* System Configuration - Admin only */}
          <Route
            path="/system"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <ConfigurationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/system/configurations"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <ConfigurationsPage />
              </ProtectedRoute>
            }
          />

          {/* Users & Roles Management - Admin only */}
          <Route
            path="/users-roles"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <UserAccountsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users-roles/user-accounts"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <UserAccountsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users-roles/roles-permissions"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <RolesPermissionsPage />
              </ProtectedRoute>
            }
          />

          {/* Promotions - Admin only */}
          <Route
            path="/promotions"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <PromotionListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/promotions/:id"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <PromotionDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Reports - Admin, Accountant */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.ACCOUNTANT]}
              >
                <RevenueReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/revenue"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.ACCOUNTANT]}
              >
                <RevenueReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/profit"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.ACCOUNTANT]}
              >
                <ProfitReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/top-products"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.ACCOUNTANT]}
              >
                <TopProductsReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/inventory"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.ACCOUNTANT]}
              >
                <InventoryReportPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster position="top-right" />
    </>
  );
}

export default App;
