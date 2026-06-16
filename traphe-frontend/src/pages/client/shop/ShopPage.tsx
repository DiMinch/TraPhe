import { useState, useEffect } from "react";
import {
  LayoutGrid,
  Grid,
  StretchHorizontal,
  AlignJustify,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import SubscribeSection from "@/components/common/subscribe/SubscribeSection";
import ProductCard from "@/components/common/product/ProductCard";
import FilterSection from "@/components/common/filter/FilterSection";
import ProductSearch from "@/components/common/search/ProductSearch"; // Import Search Component
import type { FilterParams } from "@/components/common/filter/FilterSection.types";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product.types";
import { Link, useSearchParams } from "react-router"; // [1] Import useSearchParams
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { ClientProductGridSkeleton } from "@/components/ui/skeleton-loaders";

interface ShopPageProps {
  isDrink?: boolean;
}

export default function ShopPage({ isDrink = true }: ShopPageProps) {
  const { selectedBranchId } = useCart();
  const [gridCols, setGridCols] = useState<number>(3);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12;

  // Sorting State
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<string>("desc");

  // [2] Lấy Search Params từ URL
  const [searchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get("search");

  const [filters, setFilters] = useState<FilterParams>({});

  // Reset filters when changing menu type (drink vs merchandise)
  useEffect(() => {
    setFilters({});
    setSortBy("createdAt");
    setSortDir("desc");
    setCurrentPage(0);
  }, [isDrink]);

  // [3] Effect: Đồng bộ URL Search -> Filters State
  useEffect(() => {
    if (urlSearchQuery) {
      setFilters((prev) => ({ ...prev, search: urlSearchQuery }));
    } else {
      // Nếu URL không có search (user xóa), loại bỏ khỏi bộ lọc
      setFilters((prev) => {
        const { search, ...rest } = prev;
        return rest;
      });
    }
    // Reset về trang đầu khi search thay đổi
    setCurrentPage(0);
  }, [urlSearchQuery]);

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters({
      ...newFilters, // Thay thế hoàn toàn các filter cũ (Category, Price, Specs)
      search: urlSearchQuery || undefined, // Luôn giữ lại search từ URL
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
          isDrink,
          sortBy,
          sortDir,
          branchId: selectedBranchId || undefined,
          ...filters,
        });

        if (res.statusCode === 200 && res.data) {
          // Backend successPagination puts items in data (array) and pagination in meta
          const items = Array.isArray(res.data) ? res.data : (res.data as any).content || [];
          setProducts(items);
          setTotalPages(res.meta?.totalPages || (res.data as any).totalPages || 1);
        }
      } catch (error) {
        console.error("Failed to fetch shop products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage, filters, isDrink, sortBy, sortDir, selectedBranchId]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-foam min-h-screen pb-16 font-body-md text-ink">
      {/* Page Header */}
      <section className="text-center pt-16 pb-12 px-6">
        <h1 className="font-display-xl text-5xl md:text-6xl text-roast mb-4 tracking-tight">
          {isDrink ? "Thực Đơn" : "Vật Phẩm TraPhe"}
        </h1>
        <p className="font-body-md text-base md:text-lg text-dust max-w-2xl mx-auto leading-relaxed">
          {isDrink
            ? "Khám phá hương vị tinh tế từ những hạt cà phê và lá trà được tuyển chọn kỹ lưỡng, kết hợp hoàn hảo cùng các món bánh ngọt thủ công."
            : "Sở hữu những thiết kế độc quyền, cốc sứ cao cấp và các dụng cụ pha chế chuyên nghiệp mang đậm dấu ấn phong cách TraPhe."}
        </p>
      </section>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="bg-parchment p-4 rounded-xl shadow-sm border border-mist">
          <ProductSearch
            placeholder={isDrink ? "Tìm kiếm món uống..." : "Tìm kiếm vật phẩm..."}
            className="w-full"
            isDrink={isDrink}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-8">
        <FilterSection
          onFilterChange={handleFilterChange}
          categoryId={filters.categoryId}
          isDrink={isDrink}
          className="shrink-0"
        />

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-mist/10 gap-4">
            <h2 className="font-heading-lg text-2xl text-espresso mb-4 sm:mb-0">
              {urlSearchQuery
                ? `Kết quả tìm kiếm cho "${urlSearchQuery}"`
                : filters.categoryId
                  ? "Sản phẩm theo danh mục"
                  : "Tất cả sản phẩm"}
            </h2>

            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              {/* Sort Selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-ui-body text-dust">Sắp xếp:</span>
                <select
                  value={`${sortBy}-${sortDir}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split("-");
                    setSortBy(field);
                    setSortDir(direction);
                    setCurrentPage(0);
                  }}
                  className="bg-parchment border border-mist/30 hover:border-mist rounded-xl px-3 py-1.5 font-ui-body text-xs font-medium text-espresso focus:outline-none focus:ring-1 focus:ring-roast cursor-pointer hover:bg-cream/40 transition-colors"
                >
                  <option value="createdAt-desc">Mới nhất</option>
                  <option value="basePrice-asc">Giá: Thấp đến Cao</option>
                  <option value="basePrice-desc">Giá: Cao đến Thấp</option>
                  <option value="name-asc">Tên: A - Z</option>
                  <option value="name-desc">Tên: Z - A</option>
                </select>
              </div>

              {/* View Mode Buttons */}
              <div className="flex items-center gap-1 bg-parchment p-1 rounded-xl border border-mist/20 shadow-sm">
                <button
                  onClick={() => setGridCols(4)}
                  className={`p-2 rounded-lg transition-colors duration-200 cursor-pointer ${gridCols === 4 ? "bg-roast text-white" : "text-dust hover:bg-cream/50 hover:text-roast"}`}
                  title="Grid 4 cột"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-2 rounded-lg transition-colors duration-200 cursor-pointer ${gridCols === 3 ? "bg-roast text-white" : "text-dust hover:bg-cream/50 hover:text-roast"}`}
                  title="Grid 3 cột"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridCols(2)}
                  className={`p-2 rounded-lg transition-colors duration-200 cursor-pointer ${gridCols === 2 ? "bg-roast text-white" : "text-dust hover:bg-cream/50 hover:text-roast"}`}
                  title="Grid 2 cột"
                >
                  <StretchHorizontal className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridCols(1)}
                  className={`p-2 rounded-lg transition-colors duration-200 cursor-pointer ${gridCols === 1 ? "bg-roast text-white" : "text-dust hover:bg-cream/50 hover:text-roast"}`}
                  title="List view"
                >
                  <AlignJustify className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <ClientProductGridSkeleton count={8} />
          ) : (
            <>
              {products.length === 0 ? (
                <div className="text-center py-20 text-dust font-body-md text-lg italic">
                  {urlSearchQuery
                    ? `Không tìm thấy sản phẩm nào khớp với "${urlSearchQuery}"`
                    : "Không có sản phẩm nào phù hợp với bộ lọc đã chọn."}
                </div>
              ) : (
                <div
                  className={`grid gap-6 transition-all duration-300 ease-in-out
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
                      <div key={product.id} className="w-full">
                        <Link
                          to={`/menu/${product.id}`}
                          className="block w-full h-full"
                        >
                          <ProductCard
                            product={{
                              id: product.id,
                              variantId: firstSizeId || product.variants?.[0]?.id,
                              name: product.name,
                              price: displayPrice,
                              image: product.imageUrl || undefined,
                              rating: 5,
                              isNew: false,
                              description: product.description,
                              categoryName: product.categoryName,
                              layout: gridCols === 1 ? "list" : "grid",
                            }}
                          />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-12">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="w-9 h-9 border-roast text-roast hover:bg-cream hover:text-roast disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <span className="text-sm font-semibold text-espresso font-ui-body px-4">
                    Trang {currentPage + 1} / {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="w-9 h-9 border-roast text-roast hover:bg-cream hover:text-roast disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <SubscribeSection />
    </div>
  );
}
