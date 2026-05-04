import { Link } from "react-router";
import { Search, User, ShoppingBag } from "lucide-react";
import { navLinks } from "@/lib/menu";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  return (
    <header className="w-full bg-white py-4 px-6 sticky top-0 z-50 shadow-sm border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-12 h-12 overflow-hidden flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="TraPhe Logo"
              className="w-full h-full object-cover scale-250"
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
          <button className="text-gray-700 hover:text-black">
            <Search className="w-5 h-5" />
          </button>
          <Link to="/sign-in" className="text-gray-700 hover:text-black">
            <User className="w-5 h-5" />
          </Link>
          <button className="text-gray-700 hover:text-black relative">
            <ShoppingBag className="w-5 h-5" />
            <Badge className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-black text-white rounded-full">
              2
            </Badge>
          </button>
        </div>
      </div>
    </header>
  );
}
