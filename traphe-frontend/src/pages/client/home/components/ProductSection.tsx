import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router";
import ProductCard from "@/components/common/product/ProductCard";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product";

export default function ProductSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productService.getAllProducts();
        if (res.statusCode === 200 && res.data) {
          setProducts(res.data.slice(0, 8));
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
          to="/shop"
className="flex items-center text-sm font-medium border-b border-black pb-0.5 hover:opacity-70"
>
More Products <ArrowRight className="w-4 h-4 ml-2" />
</Link>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {products.map((product) => {
          const displayPrice = product.variants?.[0]?.sellingPrice || 0;

          return (
            <Link key={product.id} to={`/products/${product.id}`}>
              <ProductCard product={{
                id: product.id,
                name: product.name,
                price: displayPrice,
                image: product.imageUrl,
                rating: 5,
                isNew: true
              }} />
            </Link>
          );
        })}
</div>
</section>
);