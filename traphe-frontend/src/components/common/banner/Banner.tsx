import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
const bannerImages = [
  "https://images.unsplash.com/photo-1661961112951-f2bfd1f253ce?q=80&w=2672&auto=format&fit=crop", // Laptop Gaming / Tech
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2069&auto=format&fit=crop", // Macbook
  "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2070&auto=format&fit=crop", // Setup
];

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === bannerImages.length - 1 ? 0 : prev + 1,
    );
  };
  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? bannerImages.length - 1 : prev - 1,
    );
  };
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 mb-12 mt-2 relative group]">
      <div className="w-full h-[400px] md:h-[500px] bg-gray-200 rounded-sm relative overflow-hidden">
        {bannerImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={img}
              alt={`Banner ${index + 1}`}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        ))}

        <Button
          variant="outline"
          size="icon"
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white border-none shadow-md hidden group-hover:flex z-10"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white border-none shadow-md hidden group-hover:flex z-10"
        >
          <ArrowRight className="w-5 h-5 text-black" />
        </Button>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {bannerImages.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
