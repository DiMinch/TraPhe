import { useState, useEffect, useMemo } from "react";
import {
  SlidersHorizontal,
  Filter,
  Loader2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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

const PRICE_RANGES = [
  { id: "p1", label: "Dưới 10 triệu", min: 0, max: 10000000 },
  { id: "p2", label: "10 triệu - 20 triệu", min: 10000000, max: 20000000 },
  { id: "p3", label: "20 triệu - 50 triệu", min: 20000000, max: 50000000 },
  { id: "p4", label: "Trên 50 triệu", min: 50000000, max: undefined },
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

  const toggleExpand = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const applyFilters = (catId?: string, prices?: string[]) => {
    const currentCat = catId ?? selectedCategoryId;
    const currentPrices = prices ?? selectedPriceRanges;

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

  const renderCategoryItem = (node: CategoryNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedCategories[node.id];
    const isSelected = selectedCategoryId === node.id;

    return (
      <div key={node.id} className="w-full">
        <div
          className={cn(
            "flex items-center justify-between py-2 px-2 rounded-md cursor-pointer transition-colors hover:bg-gray-100",
            isSelected
              ? "bg-black text-white hover:bg-gray-800"
              : "text-gray-700",
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => handleCategoryClick(node.id)}
        >
          <span
            className={cn("text-sm font-medium", isSelected && "font-bold")}
          >
            {node.name}
          </span>

          {hasChildren && (
            <button
              onClick={(e) => toggleExpand(node.id, e)}
              className={cn(
                "p-1 rounded-full hover:bg-gray-200/20",
                isSelected ? "text-white" : "text-gray-500",
              )}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {node.children.map((child) => renderCategoryItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <Accordion
        type="multiple"
        defaultValue={["category", "price"]}
        className="w-full"
      >
        <AccordionItem value="category" className="border-b-0">
          <AccordionTrigger className="hover:no-underline py-3">
            <span className="font-bold text-base uppercase tracking-wide text-gray-900">
              Danh mục
            </span>
          </AccordionTrigger>
          <AccordionContent>
            {loadingCats ? (
              <div className="flex justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col space-y-1">
                {categoryTree.length > 0 ? (
                  categoryTree.map((node) => renderCategoryItem(node))
                ) : (
                  <p className="text-sm text-gray-500 italic pl-2">
                    Không có danh mục
                  </p>
                )}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <Separator className="my-2 bg-gray-100" />

        <AccordionItem value="price" className="border-b-0">
          <AccordionTrigger className="hover:no-underline py-3">
            <span className="font-bold text-base uppercase tracking-wide text-gray-900">
              Khoảng giá
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1 pl-1">
              {PRICE_RANGES.map((range) => (
                <div
                  key={range.id}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    id={range.id}
                    className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                    checked={selectedPriceRanges.includes(range.id)}
                    onCheckedChange={() => handlePriceCheck(range.id)}
                  />
                  <Label
                    htmlFor={range.id}
                    className={cn(
                      "text-sm cursor-pointer flex-1",
                      selectedPriceRanges.includes(range.id)
                        ? "text-black font-medium"
                        : "text-gray-600 font-normal",
                    )}
                  >
                    {range.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button
        variant="outline"
        onClick={handleReset}
        className="w-full border-dashed border-gray-400 hover:border-black hover:bg-gray-50 mt-4"
      >
        Xóa tất cả bộ lọc
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
              {(selectedCategoryId || selectedPriceRanges.length > 0) && (
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
              <span>Bộ lọc</span>
            </div>
            {(selectedCategoryId || selectedPriceRanges.length > 0) && (
              <button
                onClick={handleReset}
                className="text-xs text-gray-400 hover:text-black underline"
              >
                Xóa tất cả
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
