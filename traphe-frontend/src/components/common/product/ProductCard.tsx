import { Heart, Plus, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProductCardProps } from "./ProductCard.types";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export default function ProductCard({
  product,
}: {
  product: ProductCardProps;
}) {
  const { addToCart } = useCart();
  const isList = product.layout === "list";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.id) {
      const success = await addToCart({ menuItemId: String(product.id), quantity: 1 });
      if (success) toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
    } else {
      toast.error("Sản phẩm này chưa khả dụng.");
    }
  };

  if (isList) {
    return (
      <div className="group relative flex flex-col sm:flex-row gap-6 bg-parchment p-4 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 w-full border border-mist/20">
        <div className="w-full sm:w-48 h-48 overflow-hidden relative rounded-lg bg-foam flex-shrink-0">
          <img
            src={product.image || "/images/prod-placeholder.png"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {product.categoryName && (
            <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <span className="text-[10px] font-bold text-roast uppercase tracking-wider">
                {product.categoryName}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-grow justify-between py-1">
          <div>
            <div className="flex justify-between items-start gap-4 mb-2">
              <h3 className="font-heading-lg text-heading-lg text-espresso group-hover:text-roast transition-colors line-clamp-1">
                {product.name}
              </h3>
              <button className="text-dust hover:text-roast transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>
            
            {product.description && (
              <p className="font-body-md text-sm text-smoke line-clamp-2 mb-4 leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="flex gap-0.5 text-roast mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-roast text-roast" />
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-auto">
            <div className="flex items-baseline gap-3">
              <span className="font-ui-heading text-lg font-bold text-roast">
                {product.price.toLocaleString("vi-VN")} ₫
              </span>
              {product.originalPrice && (
                <span className="text-dust text-sm line-through">
                  {product.originalPrice.toLocaleString("vi-VN")} ₫
                </span>
              )}
            </div>

            <Button
              onClick={handleAddToCart}
              size="icon"
              className="bg-roast hover:bg-caramel text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Grid layout (Standard Stitch Design)
  return (
    <article className="bg-parchment rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group flex flex-col h-full border border-mist/20">
      <div className="h-64 overflow-hidden relative w-full bg-foam">
        <img
          src={product.image || "/images/prod-placeholder.png"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.categoryName && (
          <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="font-ui-body text-xs font-bold text-roast uppercase tracking-wider">
              {product.categoryName}
            </span>
          </div>
        )}
        <button className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-dust hover:text-roast hover:bg-white transition-all opacity-0 group-hover:opacity-100">
          <Heart className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-heading-lg text-heading-lg text-espresso line-clamp-1 mb-2 group-hover:text-roast transition-colors">
            {product.name}
          </h3>
          {product.description ? (
            <p className="font-body-md text-sm text-smoke mb-4 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          ) : (
            <div className="h-10"></div>
          )}
        </div>

        <div className="flex justify-between items-center mt-auto pt-2 border-t border-mist/10">
          <div className="flex flex-col">
            <span className="font-ui-heading text-lg font-bold text-roast">
              {product.price.toLocaleString("vi-VN")} ₫
            </span>
            {product.originalPrice && (
              <span className="text-dust text-xs line-through">
                {product.originalPrice.toLocaleString("vi-VN")} ₫
              </span>
            )}
          </div>
          
          <Button
            onClick={handleAddToCart}
            size="icon"
            className="bg-roast hover:bg-caramel text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </article>
  );
}
