import { useState } from "react";
import { ArrowLeft, ArrowRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productDetail } from "@/data/mockData";
import SpecsSheet from "./SpecsSheet";

export default function ProductSection() {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % productDetail.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? productDetail.images.length - 1 : prev - 1,
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
      <div className="flex flex-col items-center">
        <div className="relative w-full aspect-4/3 bg-linear-to-b from-gray-100 to-gray-200 rounded-sm overflow-hidden group mb-6 flex items-center justify-center">
          <div className="text-4xl text-gray-300 font-bold opacity-50 select-none">
            IMAGE {currentImage + 1}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 border-none shadow-md hidden group-hover:flex"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 border-none shadow-md hidden group-hover:flex"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>

          <div className="absolute bottom-4 flex gap-2">
            {productDetail.images.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentImage === idx ? "bg-black w-6" : "bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
        <SpecsSheet />
      </div>

      <div className="flex flex-col justify-center lg:pl-10">
        <h1 className="text-3xl lg:text-4xl font-semibold leading-tight mb-6 text-gray-900">
          {productDetail.name}
        </h1>

        <div className="flex items-end gap-4 mb-8">
          <span className="text-3xl font-bold text-black">
            {productDetail.price.toLocaleString("vi-VN")} ₫
          </span>
          <span className="text-lg text-gray-400 line-through mb-1">
            {productDetail.originalPrice.toLocaleString("vi-VN")} ₫
          </span>
          <span className="text-lg text-red-500 font-medium mb-1">
            {productDetail.discount}
          </span>
        </div>

        <p className="text-gray-600 mb-8 leading-relaxed">
          {productDetail.description}
        </p>

        <div className="flex gap-4">
          <Button
            variant="outline"
            className="h-14 w-14 border-2 border-black rounded-sm flex items-center justify-center hover:bg-gray-100"
          >
            <ShoppingCart className="w-6 h-6" />
          </Button>
          <Button className="h-14 flex-1 bg-[#222222] hover:bg-black text-white text-lg font-medium rounded-sm uppercase tracking-wide">
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
