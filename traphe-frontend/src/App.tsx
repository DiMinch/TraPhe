import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "./components/ui/sonner";

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

        {/* Admin */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/customer/tiers" element={<CustomerTierPage />} />
          <Route path="/customer/:id" element={<CustomerDetailPage />} />

          <Route path="/product" element={<ProductListPage />} />
          <Route path="/product/productlist" element={<ProductListPage />} />
          <Route path="/product/detail/:id" element={<ProductDetailPage />} />
          <Route path="/product/edit/:id" element={<ProductEditPage />} />

          <Route path="/category" element={<CategoryPage />} />
          <Route path="/category/:id/edit" element={<CategoryEditPage />} />

          <Route path="/product/categories" element={<CategoriesPage />} />
          <Route
            path="/product/categories/:categoryName/attributes"
            element={<AttributesPage />}
          />

          <Route path="/inventory" element={<InventoryOverviewPage />} />
          <Route
            path="/inventory/overview"
            element={<InventoryOverviewPage />}
          />
          <Route path="/inventory/all" element={<AllInventoryPage />} />
          <Route
            path="/inventory/transactions"
            element={<TransactionsPage />}
          />

          <Route path="/procurement" element={<SuppliersPage />} />
          <Route path="/procurement/suppliers" element={<SuppliersPage />} />
          <Route
            path="/procurement/suppliers/:supplierName"
            element={<SupplierDetailPage />}
          />
          <Route
            path="/procurement/purchase-orders"
            element={<PurchaseOrdersPage />}
          />
          <Route
            path="/procurement/purchase-orders/:poNumber"
            element={<PurchaseOrderDetailPage />}
          />

          <Route path="/sales" element={<POSPage />} />
          <Route path="/sales/pos" element={<POSPage />} />
          <Route path="/sales/orders" element={<OrdersPage />} />

          <Route path="/warranty" element={<WarrantyTicketsPage />} />
          <Route path="/warranty/tickets" element={<WarrantyTicketsPage />} />
          <Route
            path="/warranty/tickets/:ticketNo"
            element={<WarrantyTicketDetailPage />}
          />
          <Route
            path="/warranty/service-types"
            element={<ServiceTypesPage />}
          />
          <Route
            path="/warranty/parts-components"
            element={<PartsAndComponentsPage />}
          />

          <Route path="/user" element={<UserPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />

          <Route path="/system" element={<ConfigurationsPage />} />
          <Route
            path="/system/configurations"
            element={<ConfigurationsPage />}
          />

          <Route path="/users-roles" element={<UserAccountsPage />} />
          <Route
            path="/users-roles/user-accounts"
            element={<UserAccountsPage />}
          />
          <Route
            path="/users-roles/roles-permissions"
            element={<RolesPermissionsPage />}
          />

          <Route path="/promotions" element={<PromotionListPage />} />
          <Route
            path="/promotions/:promotionCode"
            element={<PromotionDetailPage />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster position="top-right" />
    </>
  );
}

export default App;
