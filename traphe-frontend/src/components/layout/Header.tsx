import { Link, useNavigate } from "react-router";
import { User, ShoppingBag, MapPin, Coffee } from "lucide-react";
import { navLinks } from "@/lib/menu";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { authService } from "@/services/auth.service";
import { Button } from "../ui/button";

export default function Header() {
  const {
    count,
    openLoginPrompt,
    shippingMethod,
    selectedBranchId,
    deliveryAddress,
    branches,
    setIsBranchModalOpen,
  } = useCart();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  return (
    <header className="w-full bg-white py-4 px-6 sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-12 h-12 overflow-hidden flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="TRAPHE"
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        <nav className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.title}
              to={link.path}
              className="font-medium text-gray-600 hover:text-black transition-colors"
            >
              {link.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          {/* Branch / Delivery Indicator */}
          <button
            onClick={() => setIsBranchModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/50 text-xs font-semibold transition-colors cursor-pointer max-w-[180px] sm:max-w-[240px] truncate"
          >
            {shippingMethod === "delivery" && deliveryAddress ? (
              <>
                <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                <span className="truncate">Giao: {deliveryAddress}</span>
              </>
            ) : selectedBranch ? (
              <>
                <Coffee className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                <span className="truncate">Lấy: {selectedBranch.name}</span>
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                <span>Chọn cửa hàng</span>
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                openLoginPrompt();
              } else {
                navigate("/cart");
              }
            }}
            className="text-gray-700 hover:text-black relative bg-transparent border-none p-0 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <Badge className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-black text-white rounded-full">
                {count > 99 ? "99+" : count}
              </Badge>
            )}
          </button>

          {user ? (
            <Link
              to="/account"
              className="text-gray-700 hover:text-black"
              title="My Profile"
            >
              <User className="w-5 h-5" />
            </Link>
          ) : (
            <Button
              variant="default"
              onClick={() => navigate("/sign-in")}
              className="bg-black text-white hover:bg-gray-900 px-3 py-1.5 flex items-center cursor-pointer"
            >
              <span className="hidden sm:inline">Login</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
