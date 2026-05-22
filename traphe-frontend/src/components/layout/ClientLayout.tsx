import { Outlet, useLocation } from "react-router";
import Header from "./Header";
import Footer from "./Footer";
import { CartProvider, useCart } from "@/contexts/CartContext";
import BranchSelectionModal from "../common/BranchSelectionModal";
import { useEffect } from "react";

function ClientLayoutContent() {
  const { isBranchModalOpen, setIsBranchModalOpen, isBranchConfirmed } = useCart();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/menu" && !isBranchConfirmed) {
      setIsBranchModalOpen(true);
    }
  }, [location.pathname, isBranchConfirmed, setIsBranchModalOpen]);

  return (
    <div className="min-h-screen flex flex-col font-geist">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      <BranchSelectionModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
      />
    </div>
  );
}

export default function ClientLayout() {
  return (
    <CartProvider>
      <ClientLayoutContent />
    </CartProvider>
  );
}
