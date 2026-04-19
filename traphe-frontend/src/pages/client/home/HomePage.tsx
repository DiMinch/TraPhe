import Banner from "./components/Banner";
import CategorySection from "./components/CategorySection";
import ProductSection from "./components/ProductSection";
import FeatureSection from "./components/FeatureSection";
import SubscribeSection from "./components/SubscribeSection";

export default function HomePage() {
  return (
    <div className="bg-white">
      <Banner />
      <CategorySection />
      <ProductSection />
      <FeatureSection />
      <SubscribeSection />
    </div>
  );
}
