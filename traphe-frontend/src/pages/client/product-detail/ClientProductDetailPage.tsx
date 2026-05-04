import ProductSection from "./components/ProductSection";
import ExploreMoreSection from "./components/ExploreMoreSection";
import SubscribeSection from "@/components/common/subscribe/SubscribeSection";

export default function ClientProductDetailPage() {
  return (
    <div className="bg-white pt-10">
      <div className="max-w-7xl mx-auto px-6">
        <ProductSection />
        <ExploreMoreSection />
      </div>
      <SubscribeSection />
    </div>
  );
}
