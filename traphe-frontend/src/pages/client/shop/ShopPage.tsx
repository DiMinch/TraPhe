import { useState, useEffect } from "react";
import {
  LayoutGrid,
  Grid,
  StretchHorizontal,
  AlignJustify,
  ChevronDown,
  Loader2,
} from "lucide-react";
import Banner from "@/components/common/banner/Banner";
import SubscribeSection from "@/components/common/subscribe/SubscribeSection";
import ProductCard from "@/components/common/product/ProductCard";
import FilterSection from "@/components/common/filter/FilterSection";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product";
import { Link } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ShopPage() {
  const [gridCols, setGridCols] = useState<number>(3);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productService.getAllProducts();
        if (res.statusCode === 200 && res.data) {
          setProducts(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch shop products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <Banner />
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row py-8 gap-8">
        <FilterSection />

        <div className="flex-1 mt-8 lg:mt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4">
            <h1 className="text-xl font-semibold text-black mb-4 sm:mb-0">
              All Products
            </h1>

            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:opacity-80">
                    Sort by <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                  <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                  <DropdownMenuItem>Newest</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-1 bg-white">
                <button
                  onClick={() => setGridCols(4)}
                  className={`p-2 rounded hover:bg-gray-100 ${gridCols === 4 ? "bg-gray-100 text-black" : "text-gray-400"}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-2 rounded hover:bg-gray-100 ${gridCols === 3 ? "bg-gray-100 text-black" : "text-gray-400"}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setGridCols(2)}
                  className={`p-2 rounded hover:bg-gray-100 ${gridCols === 2 ? "bg-gray-100 text-black" : "text-gray-400"}`}
                >
                  <StretchHorizontal className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setGridCols(1)}
                  className={`p-2 rounded hover:bg-gray-100 ${gridCols === 1 ? "bg-gray-100 text-black" : "text-gray-400"}`}
                >
                  <AlignJustify className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div
              className={`grid gap-x-6 gap-y-10 transition-all duration-300 ease-in-out
                            ${gridCols === 4 ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : ""}
                            ${gridCols === 3 ? "grid-cols-2 md:grid-cols-3" : ""}
                            ${gridCols === 2 ? "grid-cols-2" : ""}
                            ${gridCols === 1 ? "grid-cols-1" : ""}
                        `}
            >
              {products.map((product) => {
                const displayPrice = product.variants?.[0]?.sellingPrice || 0;
                return (
                  <div
                    key={product.id}
                    className={
                      gridCols === 1
                        ? "flex gap-6 items-center border-b pb-4 w-full"
                        : ""
                    }
                  >
                    <Link
                      to={`/products/${product.id}`}
                      className="block w-full"
                    >
                      <ProductCard
                        product={{
                          id: product.id,
                          name: product.name,
                          price: displayPrice,
                          image: product.imageUrl,
                          rating: 5,
                          isNew: false,
                        }}
                      />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <SubscribeSection />
    </div>
  );
}
