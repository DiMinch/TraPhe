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
          className="flex items-center space-x-3 p-2 rounded-md hover:bg-cream/45 transition-colors"
        >
          <Checkbox
            id={range.id}
            className="w-5 h-5 rounded border-mist data-[state=checked]:bg-roast data-[state=checked]:border-roast cursor-pointer"
            checked={selectedPriceRanges.includes(range.id)}
            onCheckedChange={() => onTogglePrice(range.id)}
          />
          <Label
            htmlFor={range.id}
            className={cn(
              "text-sm cursor-pointer flex-1 font-ui-body",
              selectedPriceRanges.includes(range.id)
                ? "text-espresso font-semibold"
                : "text-smoke font-normal",
            )}
          >
            {range.label}
          </Label>
        </div>
      ))}
    </div>
  );
}
