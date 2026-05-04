import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { productDetail } from "@/data/mockData";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SpecsSheet() {
  return (
    <ScrollArea>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="mt-8 px-8 py-6 rounded-md border-black text-black hover:bg-black hover:text-white transition-colors w-full md:w-auto font-medium"
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
                Detailed configuration for{" "}
                <span className="font-medium text-black">
                  {productDetail.name}
                </span>
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-white">
            <table className="w-full text-sm text-left border-collapse">
              <tbody>
                {productDetail.specs.map((spec, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors group"
                  >
                    <td className="py-4 pr-4 font-semibold text-gray-500 w-1/3 align-top group-hover:text-gray-700">
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
