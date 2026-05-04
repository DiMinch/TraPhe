import { useState } from "react";
import {
  LayoutGrid,
  Grid,
  StretchHorizontal,
  AlignJustify,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Banner from "@/components/common/banner/Banner";
import SubscribeSection from "@/components/common/subscribe/SubscribeSection";
import ProductCard from "@/components/common/product/ProductCard";
import FilterSection from "@/components/common/filter/FilterSection";
import { shopProducts } from "@/data/mockData";

export default function ClientProductPage() {
  const [gridCols, setGridCols] = useState<number>(3);

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
                  <DropdownMenuItem>Best Selling</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-1 bg-white">
                <button
                  onClick={() => setGridCols(4)}
                  className={`p-2 rounded hover:bg-gray-100 transition-colors ${gridCols === 4 ? "bg-gray-100 text-black" : "text-gray-400"}`}
                  title="View 4 columns"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-2 rounded hover:bg-gray-100 transition-colors ${gridCols === 3 ? "bg-gray-100 text-black" : "text-gray-400"}`}
                  title="View 3 columns"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setGridCols(2)}
                  className={`p-2 rounded hover:bg-gray-100 transition-colors ${gridCols === 2 ? "bg-gray-100 text-black" : "text-gray-400"}`}
                  title="View 2 columns"
                >
                  <StretchHorizontal className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setGridCols(1)}
                  className={`p-2 rounded hover:bg-gray-100 transition-colors ${gridCols === 1 ? "bg-gray-100 text-black" : "text-gray-400"}`}
                  title="View List"
                >
                  <AlignJustify className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div
            className={`grid gap-x-6 gap-y-10 transition-all duration-300 ease-in-out
             ${gridCols === 4 ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : ""}
             ${gridCols === 3 ? "grid-cols-2 md:grid-cols-3" : ""}
             ${gridCols === 2 ? "grid-cols-2" : ""}
             ${gridCols === 1 ? "grid-cols-1" : ""}
          `}
          >
            {shopProducts.map((product) => (
              <div
                key={`prod-page-${product.id}`}
                className={
                  gridCols === 1
                    ? "flex gap-6 items-center border-b pb-4 last:border-0"
                    : ""
                }
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <SubscribeSection />
    </div>
  );
}
