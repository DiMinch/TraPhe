import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface PriceRange {
  id: string;
  label: string;
  min: number;
  max?: number;
}

interface PriceFilterProps {
  priceRanges: PriceRange[];
  selectedPriceRanges: string[];
  onTogglePrice: (rangeId: string) => void;
}

export default function PriceFilter({
  priceRanges,
  selectedPriceRanges,
  onTogglePrice,
}: PriceFilterProps) {
  return (
    <div className="space-y-3 pt-1 pl-1">
      {priceRanges.map((range) => (
        <div
          key={range.id}
          className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Checkbox
            id={range.id}
            className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black cursor-pointer"
            checked={selectedPriceRanges.includes(range.id)}
            onCheckedChange={() => onTogglePrice(range.id)}
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
  );
}
