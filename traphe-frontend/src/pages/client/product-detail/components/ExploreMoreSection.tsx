import ProductCard from "@/components/common/product/ProductCard";
import { shopProducts } from "@/data/mockData";

export default function ExploreMoreSection() {
  const relatedProducts = shopProducts.slice(0, 4);

  return (
    <section className="mb-20">
      <h2 className="text-3xl font-semibold mb-8 text-black">Explore more</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
