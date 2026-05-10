import { useEffect, useState } from "react";
import { CategoryCard } from "@/components/common/category/CategoryCard";
import { categoryService } from "@/services/category.service";
import type { Category, DisplayCategory } from "@/types/category.types";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategorySection() {
  const [displayCategories, setDisplayCategories] = useState<DisplayCategory[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAllCategories();
        if (res.statusCode === 200 && res.data) {
          const mappedData = res.data.map((cat, index) =>
            mapCategoryToDisplay(cat, index),
          );
          setDisplayCategories(mappedData);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const mapCategoryToDisplay = (
    cat: Category,
    index: number,
  ): DisplayCategory => {
    const styles = [
      { image: "/images/cat-laptop.png", className: "bg-[#F3F5F7]" },
      { image: "/images/cat-gear.png", className: "bg-[#F3F5F7]" },
      { image: "/images/cat-screen.png", className: "bg-[#F3F5F7]" },
    ];

    const style = styles[index % styles.length];

    let finalImage = style.image;

    if (cat.imageUrl && cat.imageUrl.trim() !== "") {
      if (cat.imageUrl.startsWith("http")) {
        finalImage = cat.imageUrl;
      } else {
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
        const cleanPath = cat.imageUrl.startsWith("/")
          ? cat.imageUrl
          : `/${cat.imageUrl}`;
        finalImage = `${baseUrl}${cleanPath}`;
      }
    }

    return {
      ...cat,
      image: finalImage,
      className: style.className,
      link: `/shop?category=${cat.id}`,
    };
  };

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <div className="lg:row-span-2 h-full">
            <Skeleton className="w-full h-[300px] lg:h-full rounded-sm" />
          </div>
          <div>
            <Skeleton className="w-full h-[300px] rounded-sm" />
          </div>
          <div>
            <Skeleton className="w-full h-[300px] rounded-sm" />
          </div>
        </div>
      </section>
    );
  }

  if (displayCategories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 mb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {displayCategories[0] && (
          <div className="lg:row-span-2">
            <CategoryCard category={displayCategories[0]} />
          </div>
        )}

        {displayCategories[1] && (
          <div>
            <CategoryCard category={displayCategories[1]} />
          </div>
        )}

        {displayCategories[2] && (
          <div>
            <CategoryCard category={displayCategories[2]} />
          </div>
        )}
      </div>
    </section>
  );
}
