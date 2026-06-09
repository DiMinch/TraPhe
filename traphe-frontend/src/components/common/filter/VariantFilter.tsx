import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VariantFilterProps {
  filters: Record<string, string[]>;
  selectedSpecs: Record<string, string[]>;
  onToggleSpec: (key: string, value: string) => void;
}

export default function VariantFilter({
  filters,
  selectedSpecs,
  onToggleSpec,
}: VariantFilterProps) {
  if (!filters || Object.keys(filters).length === 0) return null;

  return (
    <>
      {Object.entries(filters).map(([key, options]) => (
        <AccordionItem
          key={key}
          value={key}
          className="border-b border-gray-100"
        >
          <AccordionTrigger className="hover:no-underline py-3 capitalize cursor-pointer">
            <span className="font-bold text-base text-gray-900 uppercase">
              {key}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="max-h-[200px] pr-3">
              <div className="space-y-2 pt-1 pl-1">
                {options.map((option) => (
                  <div
                    key={`${key}-${option}`}
                    className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Checkbox
                      id={`${key}-${option}`}
                      className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black cursor-pointer"
                      checked={selectedSpecs[key]?.includes(option) || false}
                      onCheckedChange={() => onToggleSpec(key, option)}
                    />
                    <Label
                      htmlFor={`${key}-${option}`}
                      className="text-sm font-normal text-gray-600 cursor-pointer flex-1 hover:text-black"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      ))}
    </>
  );
}
