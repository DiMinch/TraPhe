import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Banner() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 mt-6 mb-12 relative group">
      <div className="w-full h-[400px] md:h-[500px] bg-linear-to-b from-gray-200 to-gray-300 rounded-sm relative overflow-hidden flex items-center justify-center">
        <div className="text-center opacity-30">
          <p className="text-6xl font-bold">SLIDER IMAGE</p>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white border-none shadow-md hidden group-hover:flex"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white border-none shadow-md hidden group-hover:flex"
        >
          <ArrowRight className="w-5 h-5" />
        </Button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          <div className="w-8 h-1 bg-white rounded-full cursor-pointer"></div>
          <div className="w-2 h-1 bg-white/50 rounded-full cursor-pointer"></div>
          <div className="w-2 h-1 bg-white/50 rounded-full cursor-pointer"></div>
        </div>
      </div>
    </div>
  );
}
