import { Outlet, useLocation } from "react-router";
import { Suspense, useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import { useCart } from "@/contexts/CartContext";
import BranchSelectionModal from "../common/BranchSelectionModal";
import { ClientPageSkeleton } from "../ui/skeleton-loaders";

function ClientLayoutContent() {
  const { isBranchModalOpen, setIsBranchModalOpen, isBranchConfirmed } = useCart();
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    document.body.setAttribute("data-context", "customer");
    return () => {
      document.body.removeAttribute("data-context");
    };
  }, []);

  useEffect(() => {
    if (location.pathname === "/menu" && !isBranchConfirmed) {
      setIsBranchModalOpen(true);
    }
  }, [location.pathname, isBranchConfirmed, setIsBranchModalOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-body-md">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<ClientPageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />

      <BranchSelectionModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
      />

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-[#5C3317] text-[#FAF6F0] shadow-lg border border-[#FAF6F0]/25 transition-all duration-300 hover:bg-[#2C1A0E] hover:scale-110 active:scale-95 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#A0622A]/50 ${
          showScrollTop
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 translate-y-4 invisible pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 stroke-[2.5px]" />
      </button>
    </div>
  );
}

export default function ClientLayout() {
  return <ClientLayoutContent />;
}
