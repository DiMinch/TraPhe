import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { productService } from "@/services/product.service";
import type { Product, ProductVariant } from "@/types/product.types";
import ProductSection from "./components/ProductSection";
import ExploreMoreSection from "./components/ExploreMoreSection";
import SubscribeSection from "@/components/common/subscribe/SubscribeSection";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

export default function ClientProductDetailPage() {
  const { id } = useParams();
  const { selectedBranchId } = useCart();
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
        const res = await productService.getProductById(id, selectedBranchId);
        if (res.statusCode === 200 && res.data) {
          const raw = res.data as any;
          // Map backend MenuItemDetailResponse to frontend Product shape
          const mapped: Product = {
            id: raw.id,
            name: raw.name,
            imageUrl: raw.imageUrl || null,
            description: raw.description || "",
            status: raw.status || "ACTIVE",
            categoryName: raw.categoryName || "",
            categoryId: raw.categoryId || "",
            basePrice: raw.basePrice || 0,
            preparationTime: raw.preparationTime || 0,
            allowToppings: raw.allowToppings || false,
            sizes: raw.sizes || [],
            isDrink: raw.drink ?? raw.isDrink ?? false,
            createdAt: raw.createdAt || "",
            supplierName: "",
            minStockThreshold: 0,
            warrantyPeriod: 0,
            commonSpecs: "",
            branchAvailable: raw.branchAvailable,
            effectivePrice: raw.effectivePrice,
            unavailableReason: raw.unavailableReason,
            // Drink customization options
            optionGroups: raw.optionGroups || [],
            availableToppings: raw.availableToppings || [],
            // Map sizes → variants
            variants: (raw.sizes || []).map((s: any) => ({
              id: s.id,
              sku: "",
              variantName: s.sizeName || "Default",
              variantSpecs: "",
              sellingPrice: Number(s.sellingPrice) || Number(raw.basePrice) || 0,
            })),
          };
          // If no sizes, create a single default variant from basePrice
          if (mapped.variants && mapped.variants.length === 0 && raw.basePrice) {
            mapped.variants = [{
              id: raw.id,
              sku: "",
              variantName: "Mặc định",
              variantSpecs: "",
              sellingPrice: Number(raw.basePrice),
            }];
          }
          setProduct(mapped);
          if (mapped.variants && mapped.variants.length > 0) {
            setSelectedVariant(mapped.variants[0]);
          }
        }
      } catch (error) {
        toast.error("Failed to load product details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, selectedBranchId]);

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
        <ExploreMoreSection isDrink={product.isDrink} />
      </div>
      <SubscribeSection />
    </div>
  );
}
