import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import SpecsSheet from "./SpecsSheet";
import type { Product, ProductVariant } from "@/types/product.types";
import { cn } from "@/lib/utils";

interface ProductSectionProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  onVariantChange: (v: ProductVariant) => void;
}

export default function ProductSection({
  product,
  selectedVariant,
  onVariantChange,
}: ProductSectionProps) {
  const images = [product.imageUrl];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    setCurrentImage(0);
  }, [product.id]);

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const price = selectedVariant ? selectedVariant.sellingPrice : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
      <div className="flex flex-col items-center">
        <div className="relative w-full aspect-4/3 bg-gray-100 rounded-sm overflow-hidden group mb-6 flex items-center justify-center border border-gray-100">
          <img
            src={images[currentImage]}
            alt={product.name}
            className="w-full h-full object-contain p-4 transition-opacity duration-500"
          />

          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 border-none shadow-md hidden group-hover:flex hover:bg-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 border-none shadow-md hidden group-hover:flex hover:bg-white"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
        <SpecsSheet product={product} selectedVariant={selectedVariant} />
      </div>

      <div className="flex flex-col justify-center lg:pl-10">
        <h1 className="text-3xl lg:text-4xl font-semibold leading-tight mb-4 text-gray-900">
          {product.name}
        </h1>

        {selectedVariant && (
          <div className="text-lg text-gray-500 mb-4 font-medium">
            Model: {selectedVariant.variantName}
          </div>
        )}

        <div className="flex items-end gap-4 mb-6">
          <span className="text-3xl font-bold text-black">
            {price.toLocaleString("vi-VN")} ₫
          </span>
        </div>

        <div className="prose text-gray-600 mb-8 leading-relaxed max-w-none text-sm">
          {product.description}
        </div>

        {product.variants && product.variants.length > 0 && (
          <div className="mb-8">
            <label className="text-sm font-bold text-gray-900 mb-3 block">
              Versions
            </label>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => onVariantChange(v)}
                    className={cn(
                      "border rounded-md px-4 py-2 text-sm transition-all",
                      isSelected
                        ? "border-black bg-black text-white"
                        : "border-gray-200 hover:border-black text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    {v.variantName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-auto">
          <Button
            variant="outline"
            className="h-14 w-14 border-2 border-black rounded-sm flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-6 h-6" />
          </Button>
          <Button className="h-14 flex-1 bg-[#222222] hover:bg-black text-white text-lg font-medium rounded-sm uppercase tracking-wide transition-colors cursor-pointer">
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
