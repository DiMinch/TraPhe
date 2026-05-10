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
import { productService } from "@/services/product.service";
import type { ApiResponse } from "@/types/api.types";
import type { FilterSectionProps } from "./FilterSection.types";
import CategoryFilter from "./CategoryFilter";
import PriceFilter from "./PriceFilter";
import VariantFilter from "./VariantFilter";
import type { PriceRange } from "./PriceFilter";

const PRICE_RANGES: PriceRange[] = [
  { id: "p1", label: "Under 10 million VND", min: 0, max: 10000000 },
  {
    id: "p2",
    label: "10 million - 20 million VND",
    min: 10000000,
    max: 20000000,
  },
  {
    id: "p3",
    label: "20 million - 50 million VND",
    min: 20000000,
    max: 50000000,
  },
  { id: "p4", label: "Over 50 million VND", min: 50000000, max: undefined },
];

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
}

interface CategoryNode extends Category {
  children: CategoryNode[];
}

export default function FilterSection({
  className,
  onFilterChange,
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

  const [variantFilterOptions, setVariantFilterOptions] = useState<
    Record<string, string[]>
  >({});
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string[]>>(
    {},
  );
  const [loadingSpecs, setLoadingSpecs] = useState(false);

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
        setLoadingCats(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchVariantOptions = async () => {
      setLoadingSpecs(true);
      try {
        const res =
          await productService.getVariantFilterOptions(selectedCategoryId);
        if (res.statusCode === 200 && res.data) {
          setVariantFilterOptions(res.data.filters);
        } else {
          setVariantFilterOptions({});
        }
      } catch (error) {
        console.error("Failed to load variant filters", error);
      } finally {
        setLoadingSpecs(false);
      }
    };

    fetchVariantOptions();
  }, [selectedCategoryId]);

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
    specs?: Record<string, string[]>,
  ) => {
    const currentCat = catId ?? selectedCategoryId;
    const currentPrices = prices ?? selectedPriceRanges;
    const currentSpecs = specs ?? selectedSpecs;

    let minPrice: number | undefined = undefined;
    let maxPrice: number | undefined = undefined;

    if (currentPrices.length > 0) {
      const selectedRanges = PRICE_RANGES.filter((r) =>
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

    const dynamicFilters: Record<string, string> = {};

    Object.entries(currentSpecs).forEach(([key, values]) => {
      if (values.length > 0) {
        dynamicFilters[key] = values.join(",");
      }
    });

    onFilterChange({
      categoryId: currentCat,
      minPrice,
      maxPrice,
      ...dynamicFilters,
    });
  };

  const handleCategoryClick = (catId: string) => {
    const newId = selectedCategoryId === catId ? undefined : catId;
    setSelectedCategoryId(newId);
    setSelectedSpecs({});
    applyFilters(newId, undefined, {});
  };

  const handlePriceCheck = (rangeId: string) => {
    const newRanges = selectedPriceRanges.includes(rangeId)
      ? selectedPriceRanges.filter((id) => id !== rangeId)
      : [...selectedPriceRanges, rangeId];

    setSelectedPriceRanges(newRanges);
    applyFilters(undefined, newRanges, undefined);
  };

  const handleSpecCheck = (key: string, value: string) => {
    const currentValues = selectedSpecs[key] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    const newSelectedSpecs = {
      ...selectedSpecs,
      [key]: newValues,
    };

    if (newValues.length === 0) {
      delete newSelectedSpecs[key];
    }

    setSelectedSpecs(newSelectedSpecs);
    applyFilters(undefined, undefined, newSelectedSpecs);
  };

  const handleReset = () => {
    setSelectedCategoryId(undefined);
    setSelectedPriceRanges([]);
    setSelectedSpecs({});
    onFilterChange({});
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <Accordion
        type="multiple"
        defaultValue={[
          "category",
          "price",
          ...Object.keys(variantFilterOptions),
        ]}
        className="w-full"
      >
        <AccordionItem value="category" className="border-b border-gray-100">
          <AccordionTrigger className="hover:no-underline py-3 cursor-pointer">
            <span className="font-bold text-base uppercase tracking-wide text-gray-900 cursor-pointer">
              Category
            </span>
          </AccordionTrigger>
          <AccordionContent>
            {loadingCats ? (
              <div className="flex justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
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

        <AccordionItem value="price" className="border-b border-gray-100">
          <AccordionTrigger className="hover:no-underline py-3 cursor-pointer">
            <span className="font-bold text-base uppercase tracking-wide text-gray-900">
              Price
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <PriceFilter
              priceRanges={PRICE_RANGES}
              selectedPriceRanges={selectedPriceRanges}
              onTogglePrice={handlePriceCheck}
            />
          </AccordionContent>
        </AccordionItem>

        {loadingSpecs ? (
          <div className="py-4 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : (
          <VariantFilter
            filters={variantFilterOptions}
            selectedSpecs={selectedSpecs}
            onToggleSpec={handleSpecCheck}
          />
        )}
      </Accordion>

      <Button
        variant="outline"
        onClick={handleReset}
        className="w-full border-dashed border-gray-400 hover:border-black hover:bg-gray-50 mt-4 cursor-pointer"
      >
        Clear All Filters
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
              className="w-full flex items-center justify-between h-12 border-gray-300 bg-white shadow-sm"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="font-medium">Filter & Sort</span>
              </div>
              {(selectedCategoryId ||
                selectedPriceRanges.length > 0 ||
                Object.keys(selectedSpecs).length > 0) && (
                <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">
                  •
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[300px] overflow-y-auto bg-white z-100 p-4"
          >
            <SheetHeader className="mb-6 text-left">
              <SheetTitle className="text-xl font-bold flex items-center gap-2">
                <Filter className="w-5 h-5" /> Filters
              </SheetTitle>
            </SheetHeader>
            <FilterContent />
          </SheetContent>
        </Sheet>
      </div>

      <div className={cn("hidden lg:block w-[280px] shrink-0", className)}>
        <div className="sticky top-24 bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filter</span>
            </div>
            {(selectedCategoryId ||
              selectedPriceRanges.length > 0 ||
              Object.keys(selectedSpecs).length > 0) && (
              <button
                onClick={handleReset}
                className="text-xs text-gray-400 hover:text-black underline cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
          <Separator className="mb-4 mt-2" />
          <FilterContent />
        </div>
      </div>
    </>
  );
}
