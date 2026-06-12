import { useState, useEffect } from "react";
import {
  LayoutGrid,
  Grid,
  StretchHorizontal,
  AlignJustify,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import FilterSection from "@/components/common/filter/FilterSection";
import type { FilterParams } from "@/components/common/filter/FilterSection.types";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product.types";
import { Link, useSearchParams } from "react-router"; // [CHANGE] Import useSearchParams
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/common/product/ProductCard";
import ProductSearch from "@/components/common/search/ProductSearch";

export default function ClientProductPage() {
  const [gridCols, setGridCols] = useState<number>(3);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12;

  // [SEARCH LOGIC] Lấy param từ URL
  const [searchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get("search");

  const [filters, setFilters] = useState<FilterParams>({});

  // [SEARCH LOGIC] Sync URL search param vào filters state
  useEffect(() => {
    if (urlSearchQuery) {
      setFilters((prev) => ({ ...prev, search: urlSearchQuery }));
    } else {
      // Nếu không có search param (xóa trên url), bỏ search khỏi filter
      setFilters((prev) => {
        const { search, ...rest } = prev;
        return rest;
      });
    }
    // Reset về trang 0 khi search thay đổi
    setCurrentPage(0);
  }, [urlSearchQuery]);

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters({
      ...newFilters,
      search: urlSearchQuery || undefined,
    });
    setCurrentPage(0);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await productService.getAllProducts({
          page: currentPage,
          size: pageSize,
          ...filters,
        });
        if (res.statusCode === 200 && res.data) {
          const items = Array.isArray(res.data) ? res.data : (res.data as any).content || [];
          setProducts(items);
          setTotalPages(res.meta?.totalPages || (res.data as any).totalPages || 1);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage, filters]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row py-8 gap-8">
        <FilterSection
          onFilterChange={handleFilterChange}
          categoryId={filters.categoryId}
        />

        <div className="flex-1 mt-8 lg:mt-0">
          <div className="mb-6">
            <ProductSearch className="w-full" />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4">
            <h1 className="text-xl font-semibold text-black mb-4 sm:mb-0">
              {/* Hiển thị tiêu đề động theo từ khóa */}
              {urlSearchQuery
                ? `Search results for "${urlSearchQuery}"`
                : "All Products"}
            </h1>

            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
              {/* <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:opacity-80">
                      Sort by <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                    <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                    <DropdownMenuItem>Newest</DropdownMenuItem>
                    <DropdownMenuItem>Best Selling</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu> */}

              <div className="flex items-center gap-1 bg-white">
                <button
                  onClick={() => setGridCols(4)}
                  className={`p-2 rounded hover:bg-gray-100 transition-colors ${gridCols === 4 ? "bg-gray-100 text-black" : "text-gray-400"}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-2 rounded hover:bg-gray-100 transition-colors ${gridCols === 3 ? "bg-gray-100 text-black" : "text-gray-400"}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setGridCols(2)}
                  className={`p-2 rounded hover:bg-gray-100 transition-colors ${gridCols === 2 ? "bg-gray-100 text-black" : "text-gray-400"}`}
                >
                  <StretchHorizontal className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setGridCols(1)}
                  className={`p-2 rounded hover:bg-gray-100 transition-colors ${gridCols === 1 ? "bg-gray-100 text-black" : "text-gray-400"}`}
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
            <>
              {products.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  {urlSearchQuery
                    ? `No products found for "${urlSearchQuery}"`
                    : "No products found."}
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
                  {products.map((product: any) => {
                    const displayPrice = product.effectivePrice || product.basePrice || product.sizes?.[0]?.sellingPrice || 0;
                    const firstSizeId = product.sizes?.[0]?.id;
                    return (
                      <Link
                        key={product.id}
                        to={`/menu/${product.id}`}
                        className={gridCols === 1 ? "w-full" : ""}
                      >
                        <div
                          className={
                            gridCols === 1
                              ? "flex gap-6 items-center border-b pb-4 last:border-0"
                              : ""
                          }
                        >
                          <ProductCard
                            product={{
                              id: product.id,
                              variantId: firstSizeId || product.variants?.[0]?.id,
                              name: product.name,
                              price: displayPrice,
                              image: product.imageUrl,
                              rating: 5,
                              isNew: false,
                            }}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="w-9 h-9"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium px-4">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="w-9 h-9"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
