import { useState, useEffect, useMemo } from "react";
import { SlidersHorizontal, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";
import type { FilterSectionProps } from "./FilterSection.types";
import CategoryFilter from "./CategoryFilter";
import PriceFilter from "./PriceFilter";
import type { PriceRange } from "./PriceFilter";

const DRINK_PRICE_RANGES: PriceRange[] = [
  { id: "p1", label: "Dưới 30.000₫", min: 0, max: 30000 },
  { id: "p2", label: "30.000₫ - 50.000₫", min: 30000, max: 50000 },
  { id: "p3", label: "50.000₫ - 80.000₫", min: 50000, max: 80000 },
  { id: "p4", label: "Trên 80.000₫", min: 80000, max: undefined },
];

const MERCHANDISE_PRICE_RANGES: PriceRange[] = [
  { id: "p1", label: "Dưới 200.000₫", min: 0, max: 200000 },
  { id: "p2", label: "200.000₫ - 400.000₫", min: 200000, max: 400000 },
  { id: "p3", label: "400.000₫ - 600.000₫", min: 400000, max: 600000 },
  { id: "p4", label: "Trên 600.000₫", min: 600000, max: undefined },
];

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  drinkCategory?: boolean;
}

interface CategoryNode extends Category {
  children: CategoryNode[];
}

export default function FilterSection({
  className,
  onFilterChange,
  categoryId,
  isDrink,
}: FilterSectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >(undefined);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  const activePriceRanges = useMemo(() => {
    return isDrink === false ? MERCHANDISE_PRICE_RANGES : DRINK_PRICE_RANGES;
  }, [isDrink]);

  useEffect(() => {
    setSelectedCategoryId(categoryId);
  }, [categoryId]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCats(true);
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
        setLoadingCats(false);
      }
    };
    fetchCategories();
  }, [isDrink]);

  const categoryTree = useMemo(() => {
    const tree: CategoryNode[] = [];
    const map: Record<string, CategoryNode> = {};

    categories.forEach((cat) => {
      map[cat.id] = { ...cat, children: [] };
    });

    categories.forEach((cat) => {
      if (cat.parentId && map[cat.parentId]) {
        map[cat.parentId].children.push(map[cat.id]);
      } else {
        tree.push(map[cat.id]);
      }
    });

    return tree;
  }, [categories]);

  const toggleExpand = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const applyFilters = (
    catId?: string,
    prices?: string[],
  ) => {
    const currentCat = catId ?? selectedCategoryId;
    const currentPrices = prices ?? selectedPriceRanges;

    let minPrice: number | undefined = undefined;
    let maxPrice: number | undefined = undefined;

    if (currentPrices.length > 0) {
      const selectedRanges = activePriceRanges.filter((r) =>
        currentPrices.includes(r.id),
      );
      const mins = selectedRanges.map((r) => r.min);
      const maxs = selectedRanges.map((r) => r.max);

      minPrice = Math.min(...mins);
      if (maxs.includes(undefined)) {
        maxPrice = undefined;
      } else {
        maxPrice = Math.max(...(maxs as number[]));
      }
    }

    onFilterChange({
      categoryId: currentCat,
      minPrice,
      maxPrice,
    });
  };

  const handleCategoryClick = (catId: string) => {
    const newId = selectedCategoryId === catId ? undefined : catId;
    setSelectedCategoryId(newId);
    applyFilters(newId, undefined);
  };

  const handlePriceCheck = (rangeId: string) => {
    const newRanges = selectedPriceRanges.includes(rangeId)
      ? selectedPriceRanges.filter((id) => id !== rangeId)
      : [...selectedPriceRanges, rangeId];

    setSelectedPriceRanges(newRanges);
    applyFilters(undefined, newRanges);
  };

  const handleReset = () => {
    setSelectedCategoryId(undefined);
    setSelectedPriceRanges([]);
    onFilterChange({});
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <Accordion
        type="multiple"
        defaultValue={["category", "price"]}
        className="w-full"
      >
        <AccordionItem value="category" className="border-b border-mist/20">
          <AccordionTrigger className="hover:no-underline py-3 cursor-pointer">
            <span className="font-ui-heading font-semibold text-base uppercase tracking-wide text-espresso hover:text-roast cursor-pointer">
              Danh mục
            </span>
          </AccordionTrigger>
          <AccordionContent>
            {loadingCats ? (
              <div className="flex justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin text-roast" />
              </div>
            ) : (
              <CategoryFilter
                categoryTree={categoryTree}
                loading={loadingCats}
                selectedCategoryId={selectedCategoryId}
                expandedCategories={expandedCategories}
                onCategoryClick={handleCategoryClick}
                onToggleExpand={toggleExpand}
              />
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price" className="border-b border-mist/20">
          <AccordionTrigger className="hover:no-underline py-3 cursor-pointer">
            <span className="font-ui-heading font-semibold text-base uppercase tracking-wide text-espresso hover:text-roast">
              Giá
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <PriceFilter
              priceRanges={activePriceRanges}
              selectedPriceRanges={selectedPriceRanges}
              onTogglePrice={handlePriceCheck}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button
        variant="outline"
        onClick={handleReset}
        className="w-full border-dashed border-roast hover:bg-cream text-roast hover:text-roast mt-4 cursor-pointer"
      >
        Xóa bộ lọc
      </Button>
    </div>
  );

  return (
    <>
      <div className={cn("lg:hidden mb-6", className)}>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-between h-12 border-mist/30 bg-parchment hover:bg-cream text-espresso shadow-sm"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-roast" />
                <span className="font-medium font-ui-body">Bộ lọc</span>
              </div>
              {(selectedCategoryId ||
                selectedPriceRanges.length > 0) && (
                <span className="bg-roast text-white text-xs px-2 py-0.5 rounded-full">
                  •
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[300px] overflow-y-auto bg-parchment border-r border-mist/30 z-100 p-4"
          >
            <SheetHeader className="mb-6 text-left">
              <SheetTitle className="text-xl font-bold flex items-center gap-2 text-espresso font-ui-heading">
                <Filter className="w-5 h-5 text-roast" /> Bộ lọc
              </SheetTitle>
            </SheetHeader>
            <FilterContent />
          </SheetContent>
        </Sheet>
      </div>

      <div className={cn("hidden lg:block w-[280px] shrink-0", className)}>
        <div className="sticky top-24 bg-parchment border border-mist/30 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-espresso font-bold text-lg font-ui-heading">
              <SlidersHorizontal className="w-5 h-5 text-roast" />
              <span>Bộ lọc</span>
            </div>
            {(selectedCategoryId ||
              selectedPriceRanges.length > 0) && (
              <button
                onClick={handleReset}
                className="text-xs text-dust hover:text-roast underline cursor-pointer"
              >
                Xóa tất cả
              </button>
            )}
          </div>
          <Separator className="mb-4 mt-2 bg-mist/20" />
          <FilterContent />
        </div>
      </div>
    </>
  );
}
