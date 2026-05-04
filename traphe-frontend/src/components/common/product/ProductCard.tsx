import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProductCardProps } from "./ProductCard.types";

export default function ProductCard({
  product,
}: {
  product: ProductCardProps;
}) {
  return (
    <div className="group relative flex flex-col h-full">
      <div className="relative bg-[#F3F5F7] aspect-4/5 mb-4 overflow-hidden rounded-sm w-full">
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.isNew && (
            <Badge className="bg-white text-black hover:bg-white px-3 py-1 uppercase text-xs font-bold rounded-sm shadow-sm">
              New
            </Badge>
          )}
          {product.discount && (
            <Badge className="bg-[#38CB89] text-white hover:bg-[#38CB89] px-3 py-1 text-xs font-bold rounded-sm shadow-sm">
              {product.discount}
            </Badge>
          )}
        </div>

        <button className="absolute top-4 right-4 bg-white p-1.5 rounded-full shadow-sm hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Heart className="w-4 h-4 text-gray-600" />
        </button>

        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium select-none">
          Product Img
        </div>

        <div className="absolute bottom-0 left-4 right-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button className="w-full bg-black text-white hover:bg-gray-800 h-10">
            Add to cart
          </Button>
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex gap-0.5 mb-2 text-black text-md">
          {[...Array(5)].map((_, i) => (
            <span key={i}>★</span>
          ))}
        </div>

        <h3 className="font-semibold text-sm mb-1 line-clamp-2 min-h-10 text-gray-900">
          {product.name}
        </h3>

        <div className="flex items-center gap-3 mt-auto">
          <span className="font-semibold text-sm text-black">
            {product.price.toLocaleString("vi-VN")}₫
          </span>
          {product.originalPrice && (
            <span className="text-gray-400 text-sm line-through decoration-gray-400">
              {product.originalPrice.toLocaleString("vi-VN")}₫
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
