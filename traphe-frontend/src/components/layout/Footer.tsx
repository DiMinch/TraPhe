import { Instagram, Facebook, Youtube } from "lucide-react";
import { Link } from "react-router";
import { navLinks, footerLinks } from "@/lib/menu";

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="text-xl font-bold tracking-widest border-r border-gray-600 pr-8 hidden md:block">
            TraPhe
          </div>
          <div className="text-xl font-bold tracking-widest md:hidden">
            TraPhe
          </div>

          <div className="text-sm text-gray-400">Trà & Cà phê</div>

          <nav className="flex gap-6 text-sm text-gray-300">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className="hover:text-white transition-colors">
                {link.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex gap-4">
            <a href="#" className="text-white hover:text-gray-300">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-white hover:text-gray-300">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-white hover:text-gray-300">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
          <div className="text-xs text-gray-500">
            Copyright © 2025 TraPhe. All rights reserved
          </div>
          <div className="flex gap-4 text-xs font-bold text-gray-300">
            {footerLinks.support.map((link) => (
              <Link key={link.path} to={link.path} className="hover:text-white transition-colors">
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
