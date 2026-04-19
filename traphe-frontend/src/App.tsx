import { Routes, Route, Navigate } from "react-router";
import Navigation from "./components/Navigation";

import SignUpPage from "./pages/auth/sign-up";
import SignInPage from "./pages/auth/sign-in";
import "./App.css";
import DashboardPage from "./pages/dashboard/Dashboard";
import CustomerPage from "./pages/dashboard/Customer/Customer";
import ProductListPage from "./pages/dashboard/Product/ProductList";
import ProductDetailPage from "./pages/dashboard/Product/ProductDetail";
import UserPage from "./pages/dashboard/User";

function App() {
  return (
    <Routes>
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/sign-in" element={<SignInPage />} />

      <Route path="/" element={<Navigate to="/sign-in" replace />} />
      <Route
        path="/dashboard"
        element={
          <div className="flex h-screen overflow-hidden">
            <Navigation />
            <main className="flex-1 overflow-y-auto">
              <DashboardPage />
            </main>
          </div>
        }
      />
      <Route
        path="/customer"
        element={
          <div className="flex h-screen overflow-hidden">
            <Navigation />
            <main className="flex-1 overflow-y-auto">
              <CustomerPage />
            </main>
          </div>
        }
      />
      <Route
        path="/product"
        element={
          <div className="flex h-screen overflow-hidden">
            <Navigation />
            <main className="flex-1 overflow-y-auto">
              <ProductListPage />
            </main>
          </div>
        }
      />
      <Route
        path="/product/productlist"
        element={
          <div className="flex h-screen overflow-hidden">
            <Navigation />
            <main className="flex-1 overflow-y-auto">
              <ProductListPage />
            </main>
          </div>
        }
      />
      <Route
        path="/product/detail/:id"
        element={
          <div className="flex h-screen overflow-hidden">
            <Navigation />
            <main className="flex-1 overflow-y-auto">
              <ProductDetailPage />
            </main>
          </div>
        }
      />
      <Route
        path="/user"
        element={
          <div className="flex h-screen overflow-hidden">
            <Navigation />
            <main className="flex-1 overflow-y-auto">
              <UserPage />
            </main>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
