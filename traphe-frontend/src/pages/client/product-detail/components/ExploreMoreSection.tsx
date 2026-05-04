import { useEffect, useState } from "react";
import { Link } from "react-router";
import ProductCard from "@/components/common/product/ProductCard";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExploreMoreSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await productService.getAllProducts();
        if (res.statusCode === 200 && res.data) {
          setProducts(res.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to fetch related products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRelated();
  }, []);

  if (isLoading) {
    return (
      <section className="mb-20">
         <Skeleton className="h-8 w-48 mb-8" />
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-[300px] w-full" />)}
         </div>
      </section>
    );
  }

return (
<section className="mb-20">
<h2 className="text-3xl font-semibold mb-8 text-black">Explore more</h2>
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => {
           const displayPrice = product.variants?.[0]?.sellingPrice || 0;
           return (
             <Link key={product.id} to={`/products/${product.id}`}>
                <ProductCard product={{
                    id: product.id,
                    name: product.name,
                    price: displayPrice,
                    image: product.imageUrl,
                    rating: 5
                }} />
             </Link>
           );
        })}
</div>
</section>
);