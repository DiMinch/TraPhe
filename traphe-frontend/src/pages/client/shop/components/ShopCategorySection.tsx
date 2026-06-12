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
  drinkCategory?: boolean;
}

interface ShopCategorySectionProps {
  onSelectCategory: (categoryId: string) => void;
  selectedCategoryId?: string;
  isDrink?: boolean;
}

export default function ShopCategorySection({
  onSelectCategory,
  selectedCategoryId,
  isDrink,
}: ShopCategorySectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const res = await axiosClient.get<any, ApiResponse<Category[]>>(
          "/categories",
        );
        if (res.statusCode === 200 && res.data) {
          const filtered = isDrink !== undefined
            ? res.data.filter((cat) => cat.drinkCategory === isDrink)
            : res.data;
          setCategories(filtered);
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [isDrink]);

  if (!isLoading && categories.length === 0) return null;

  return (
    <div className="w-full">
      <h2 className="sr-only">Categories</h2>

      {isLoading ? (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="w-24 h-9 rounded-full flex-shrink-0 bg-mist/20" />
          ))}
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
          {/* "Tất cả" Pill */}
          <button
            onClick={() => onSelectCategory("")}
            className={cn(
              "px-6 py-2 rounded-full font-ui-body text-sm font-medium whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5 cursor-pointer",
              !selectedCategoryId
                ? "bg-roast text-white shadow-sm"
                : "bg-white text-roast border border-roast hover:bg-cream",
            )}
          >
            Tất cả
          </button>

          {categories.map((category) => {
            const isSelected = selectedCategoryId === category.id;

            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={cn(
                  "px-6 py-2 rounded-full font-ui-body text-sm font-medium whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5 cursor-pointer",
                  isSelected
                    ? "bg-roast text-white shadow-sm"
                    : "bg-white text-roast border border-roast hover:bg-cream",
                )}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
