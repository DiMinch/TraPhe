import { useState } from "react";
import { SlidersHorizontal, Filter } from "lucide-react";
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
import { shopCategories, shopPrices } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface FilterSectionProps {
  className?: string;
}

export default function FilterSection({ className }: FilterSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Laptop");
  const [activePrice, setActivePrice] = useState<number[]>([1]);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
  };

  const handlePriceCheck = (idx: number) => {
    setActivePrice((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
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
              Categories
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col space-y-1 pl-1">
              {shopCategories.map((cat, idx) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={`cat-${idx}`}
                    onClick={() => handleCategoryClick(cat)}
                    className={cn(
                      "text-left text-sm py-2 px-3 rounded-md transition-all duration-200 flex items-center justify-between group",
                      isActive
                        ? "bg-black text-white font-medium shadow-md"
                        : "text-gray-600 hover:bg-gray-100 hover:text-black",
                    )}
                  >
                    <span>{cat}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <Separator className="my-2 bg-gray-100" />

        <AccordionItem value="price" className="border-b-0">
          <AccordionTrigger className="hover:no-underline py-3">
            <span className="font-bold text-base uppercase tracking-wide text-gray-900">
              Price Range
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1 pl-1">
              {shopPrices.map((price, idx) => (
                <div
                  key={`price-${idx}`}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    id={`price-${idx}`}
                    className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                    checked={activePrice.includes(idx)}
                    onCheckedChange={() => handlePriceCheck(idx)}
                  />
                  <Label
                    htmlFor={`price-${idx}`}
                    className={cn(
                      "text-sm cursor-pointer flex-1",
                      activePrice.includes(idx)
                        ? "text-black font-medium"
                        : "text-gray-600 font-normal",
                    )}
                  >
                    {price}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button
        variant="outline"
        className="w-full border-dashed border-gray-400 hover:border-black hover:bg-gray-50"
      >
        Reset Filter
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
              <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">
                {activePrice.length}
              </span>
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-[300px] overflow-y-auto bg-white z-[100] p-4"
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
              <span>Filters</span>
            </div>
            <button className="text-xs text-gray-400 hover:text-black underline">
              Clear all
            </button>
          </div>

          <Separator className="mb-4 mt-2" />

          <FilterContent />
        </div>
      </div>
    </>
  );
}
