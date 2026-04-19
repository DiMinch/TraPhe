import { Routes, Route, Navigate, Outlet } from "react-router";
import Navigation from "./components/Navigation";

// Auth Pages
import SignUpPage from "./pages/auth/sign-up";
import SignInPage from "./pages/auth/sign-in";

// Admin Pages
import DashboardPage from "./pages/dashboard/Dashboard";
import CustomerPage from "./pages/dashboard/Customer/Customer";
import ProductListPage from "./pages/dashboard/Product/ProductList";
import ProductDetailPage from "./pages/dashboard/Product/ProductDetail";
import UserPage from "./pages/dashboard/User";

// Client Pages
import HomePage from "./pages/client/home/HomePage";
import ClientLayout from "./components/layout/ClientLayout";

import "./App.css";

const AdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Navigation />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/sign-in" element={<SignInPage />} />

      <Route element={<ClientLayout />}>
        <Route path="/" element={<HomePage />} />
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
  );
}

export default App;
