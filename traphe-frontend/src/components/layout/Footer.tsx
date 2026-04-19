import { Instagram, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="text-xl font-bold tracking-widest border-r border-gray-600 pr-8 hidden md:block">
            VITI
          </div>
          <div className="text-xl font-bold tracking-widest md:hidden">
            VITI
          </div>

          <div className="text-sm text-gray-400">Laptop Store</div>

          <nav className="flex gap-6 text-sm text-gray-300">
            <a href="#" className="hover:text-white transition-colors">
              Home
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Shop
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Product
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Blog
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact Us
            </a>
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
            Copyright © 2025 VITI. All rights reserved
          </div>
          <div className="flex gap-4 text-xs font-bold text-gray-300">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
