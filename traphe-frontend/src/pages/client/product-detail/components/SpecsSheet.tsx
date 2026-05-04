import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Product, ProductVariant } from "@/types/product";

interface SpecsSheetProps {
  product: Product;
  selectedVariant: ProductVariant | null;
}

export default function SpecsSheet({
  product,
  selectedVariant,
}: SpecsSheetProps) {
  const parseSpecs = (jsonStr: string) => {
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      return {};
    }
  };

  const common = parseSpecs(product.commonSpecs);
  const variant = selectedVariant
    ? parseSpecs(selectedVariant.variantSpecs)
    : {};
  const allSpecs = { ...common, ...variant };

  const specsArray = Object.entries(allSpecs).map(([key, value]) => ({
    label: key,
    value: String(value),
  }));

  specsArray.push({
    label: "Warranty",
    value: `${product.warrantyPeriod} Months`,
  });
  specsArray.push({ label: "Supplier", value: product.supplierName });

  return (
    <ScrollArea>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="mt-8 px-8 py-6 rounded-md border-black text-black hover:bg-black hover:text-white transition-colors w-full md:w-auto font-medium cursor-pointer"
          >
            Display All Spec
          </Button>
        </SheetTrigger>
        <SheetContent className="w-screen sm:w-[540px] bg-white shadow-2xl border-l border-gray-200 p-0 flex flex-col z-100">
          <div className="p-6 border-b border-gray-100 bg-white">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold text-gray-900">
                Technical Specifications
              </SheetTitle>
              <SheetDescription className="text-gray-500 mt-1">
                Configuration for{" "}
                <span className="font-medium text-black">{product.name}</span>
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-white">
            <table className="w-full text-sm text-left border-collapse">
              <tbody>
                {specsArray.map((spec, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors group"
                  >
                    <td className="py-4 pr-4 font-semibold text-gray-500 w-1/3 align-top group-hover:text-gray-700 capitalize">
                      {spec.label}
                    </td>
                    <td className="py-4 pl-4 text-gray-900 font-medium leading-relaxed align-top">
                      {spec.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-center text-gray-400">
              Specifications may change without prior notice.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </ScrollArea>
  );
}
