import { Instagram, Facebook, Youtube } from "lucide-react";
import { Link } from "react-router";
import { navLinks, footerLinks } from "@/lib/menu";

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-8">
        {/* Top Row: Brand & Navigation & Socials */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-gray-800 pb-8">
          <div className="flex flex-col md:flex-row items-center gap-8 w-full md:w-auto">
            <div className="flex items-center gap-4">
              <div className="text-xl font-bold tracking-widest border-r border-gray-600 pr-8 hidden md:block">
                TraPhe
              </div>
              <div className="text-xl font-bold tracking-widest md:hidden">
                TraPhe
              </div>
              <div className="text-sm text-gray-400">Trà & Cà phê</div>
            </div>

            <nav className="flex flex-wrap gap-6 text-sm text-gray-300 justify-center md:justify-start">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} className="hover:text-white transition-colors">
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex gap-4">
            <a href="#" className="text-white hover:text-gray-300 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Bottom Row: Copyright & Legal */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="text-gray-500 order-2 md:order-1 text-center md:text-left">
            Copyright © 2025 TraPhe. All rights reserved
          </div>
          <div className="flex gap-6 font-bold text-gray-300 order-1 md:order-2 flex-wrap justify-center md:justify-end">
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
