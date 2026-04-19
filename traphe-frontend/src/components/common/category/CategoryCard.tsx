import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { categories } from "@/data/mockData";

export const CategoryCard = ({
  category,
}: {
  category: (typeof categories)[0];
}) => (
  <div
    className={`relative h-[300px] p-8 flex flex-col justify-center ${category.className} rounded-sm group overflow-hidden`}
  >
    <div className="z-10 relative">
      <h3 className="text-3xl font-medium mb-4 text-gray-900">
        {category.name}
      </h3>
      <Link
        to={category.link}
        className="inline-flex items-center text-sm font-medium border-b border-black pb-0.5 hover:opacity-70 transition-opacity"
      >
        Shop Now <ArrowRight className="w-4 h-4 ml-2" />
      </Link>
    </div>

    <div className="absolute right-0 bottom-0 w-2/3 h-full mix-blend-multiply opacity-10 bg-black group-hover:scale-105 transition-transform duration-500"></div>
  </div>
);
