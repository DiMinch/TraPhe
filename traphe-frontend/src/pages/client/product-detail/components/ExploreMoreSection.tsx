import { useEffect, useState } from "react";
import { Link } from "react-router";
import ProductCard from "@/components/common/product/ProductCard";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function ExploreMoreSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const PAGE_SIZE = 8;

  const fetchProducts = async (pageIndex: number, isLoadMore = false) => {
    try {
      if (isLoadMore) setIsLoadingMore(true);

      const res = await productService.getAllProducts({
        page: pageIndex,
        size: PAGE_SIZE,
      });

      if (res.statusCode === 200 && res.data) {
        const newProducts = Array.isArray(res.data) ? res.data : (res.data as any).content || [];

        if (isLoadMore) {
          setProducts((prev) => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }

        setHasMore(res.meta?.totalPages ? (pageIndex + 1 < res.meta.totalPages) : !(res.data as any).last);
        setPage(pageIndex);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts(0);
  }, []);

  const handleLoadMore = () => {
    fetchProducts(page + 1, true);
  };

  if (isLoading) {
    return (
      <section className="mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[300px] w-full" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-20">
      <h2 className="text-3xl font-semibold mb-8 text-black">Explore more</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
        {products.map((product: any) => {
          const displayPrice = product.effectivePrice || product.basePrice || product.sizes?.[0]?.sellingPrice || 0;
          return (
            <Link key={product.id} to={`/products/${product.id}`}>
              <ProductCard
                product={{
                  id: product.id,
                  name: product.name,
                  price: displayPrice,
                  image: product.imageUrl,
                  rating: 5,
                }}
              />
            </Link>
          );
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="h-12 px-8 border-black text-black hover:bg-black hover:text-white transition-colors min-w-[150px]"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </section>
  );
}
