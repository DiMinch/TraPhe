import { useEffect, useState } from "react";
import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  imageUrl: string;
  parentId?: string | null;
}

interface ShopCategorySectionProps {
  onSelectCategory: (categoryId: string) => void;
  selectedCategoryId?: string;
}

export default function ShopCategorySection({
  onSelectCategory,
  selectedCategoryId,
}: ShopCategorySectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosClient.get<any, ApiResponse<Category[]>>(
          "/categories",
        );
        if (res.statusCode === 200 && res.data) {
          setCategories(res.data);
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (!isLoading && categories.length === 0) return null;

  return (
    <section className="max-w-[1320px] mx-auto px-2 sm:px-4 py-6">
      <h2 className="sr-only">Shop by Category</h2>

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl" />
              <Skeleton className="w-16 h-3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-2 gap-y-6 place-items-center">
          {categories.map((category) => {
            const isSelected = selectedCategoryId === category.id;

            return (
              <div
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className="flex flex-col items-center group cursor-pointer w-full"
              >
                <div
                  className={cn(
                    "w-20 h-20 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center p-1.5 transition-all duration-300 border mb-2 overflow-hidden bg-white relative",
                    isSelected
                      ? "border-black ring-1 ring-black shadow-md bg-gray-50"
                      : "border-transparent bg-gray-50 hover:bg-white hover:shadow-lg hover:border-gray-200",
                  )}
                >
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <span className="text-2xl text-gray-300 font-bold select-none uppercase">
                      {category.name.charAt(0)}
                    </span>
                  )}
                </div>

                <span
                  className={cn(
                    "text-[11px] sm:text-sm font-medium text-center line-clamp-2 px-0.5 transition-colors leading-tight max-w-[110px]",
                    isSelected
                      ? "text-black font-bold"
                      : "text-gray-600 group-hover:text-black",
                  )}
                  title={category.name}
                >
                  {category.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
