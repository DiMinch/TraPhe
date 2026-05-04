import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { newArrivals } from "@/data/mockData";
import ProductCard from "@/components/common/product/ProductCard";

export default function ProductSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-20">
      <div className="flex items-end justify-between mb-8">
        <h2 className="text-3xl font-medium tracking-tight">
          New <br /> Arrivals
        </h2>
        <Link
          to="/shop"
          className="flex items-center text-sm font-medium border-b border-black pb-0.5 hover:opacity-70"
        >
          More Products <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {newArrivals.map((product) => (
          <Link key={product.id} to={`/products/${product.id}`}>
            <ProductCard product={product} />
          </Link>
        ))}
      </div>
    </section>
  );
}
