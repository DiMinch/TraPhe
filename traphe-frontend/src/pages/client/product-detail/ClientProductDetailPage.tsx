import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { productService } from "@/services/product.service";
import type { Product, ProductVariant } from "@/types/product.types";
import ProductSection from "./components/ProductSection";
import ExploreMoreSection from "./components/ExploreMoreSection";
import SubscribeSection from "@/components/common/subscribe/SubscribeSection";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ClientProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await productService.getProductById(id);
        if (res.statusCode === 200 && res.data) {
          const data = res.data;
          setProduct(data);
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
        }
      } catch (error) {
        toast.error("Failed to load product details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!product) return <div>Product not found</div>;

  return (
    <div className="bg-white pt-10">
      <div className="max-w-7xl mx-auto px-6">
        <ProductSection
          product={product}
          selectedVariant={selectedVariant}
          onVariantChange={setSelectedVariant}
        />
        <ExploreMoreSection />
      </div>
      <SubscribeSection />
    </div>
  );
}
