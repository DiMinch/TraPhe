import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router";
import ProductCard from "@/components/common/product/ProductCard";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product.types";

export default function ProductSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productService.getAllProducts({ page: 0, size: 8, sortBy: 'createdAt', sortDir: 'desc', status: 'ACTIVE' });
        // Backend returns { success: true, data: [...items], meta: { page, size, ... } }
        if (res.success && res.data) {
          // data is an array directly (from ApiResponse.successPagination)
          const items = Array.isArray(res.data) ? res.data : (res.data as any).content || [];
          setProducts(items);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-6 mb-20 flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 mb-20">
      <div className="flex items-end justify-between mb-8">
        <h2 className="text-3xl font-medium tracking-tight">
          New <br /> Arrivals
        </h2>
        <Link
          to="/menu"
          className="flex items-center text-sm font-medium border-b border-black pb-0.5 hover:opacity-70"
        >
          More Products <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {products.map((product: any) => {
          // Backend returns MenuItemResponse: { basePrice, effectivePrice, sizes, ... }
          // For drinks: price comes from sizes[0].sellingPrice when basePrice is null
          const displayPrice = product.effectivePrice || product.basePrice || product.sizes?.[0]?.sellingPrice || 0;
          const firstSizeId = product.sizes?.[0]?.id;

          return (
            <Link key={product.id} to={`/menu/${product.id}`}>
              <ProductCard
                product={{
                  id: product.id,
                  variantId: firstSizeId || product.variants?.[0]?.id,
                  name: product.name,
                  price: displayPrice,
                  image: product.imageUrl,
                  rating: 5,
                  isNew: true,
                }}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
