import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "./components/ui/sonner";

// Auth Pages
import SignUpPage from "./pages/auth/sign-up";
import SignInPage from "./pages/auth/sign-in";

// Admin Pages
import DashboardPage from "./pages/dashboard/Dashboard";
import CustomerPage from "./pages/dashboard/Customer/Customer";
import ProductListPage from "./pages/dashboard/Product/ProductList";
import ProductDetailPage from "./pages/dashboard/Product/ProductDetail";
import UserPage from "./pages/dashboard/User";
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
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/sign-in" element={<SignInPage />} />

        <Route element={<ClientLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products" element={<ClientProductPage />} />
          <Route path="/products/:id" element={<ClientProductDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/product" element={<ProductListPage />} />
          <Route path="/product/productlist" element={<ProductListPage />} />
          <Route path="/product/detail/:id" element={<ProductDetailPage />} />
          <Route path="/user" element={<UserPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
