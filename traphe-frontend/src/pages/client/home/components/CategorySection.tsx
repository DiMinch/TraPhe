import { CategoryCard } from "@/components/common/category/CategoryCard";
import { categories } from "@/data/mockData";

export default function CategorySection() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <div className="lg:row-span-2">
          <CategoryCard category={categories[0]} />
        </div>
        <div>
          <CategoryCard category={categories[1]} />
        </div>
        <div>
          <CategoryCard category={categories[2]} />
        </div>
      </div>
    </section>
  );
}
