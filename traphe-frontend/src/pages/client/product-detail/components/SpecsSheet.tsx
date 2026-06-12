import type { Product, ProductVariant } from "@/types/product.types";

interface SpecsSheetProps {
  product: Product;
  selectedVariant: ProductVariant | null;
}

export default function SpecsSheet({
  product,
  selectedVariant,
}: SpecsSheetProps) {
  const parseSpecs = (jsonStr?: string) => {
    if (!jsonStr) return {};
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      return {};
    }
  };

  const common = parseSpecs(product.commonSpecs);
  const variant = selectedVariant
    ? parseSpecs(selectedVariant.variantSpecs)
    : {};
  const allSpecs = { ...common, ...variant };

  const specsArray = Object.entries(allSpecs).map(([key, value]) => ({
    label: key,
    value: String(value),
  }));

  specsArray.push({
    label: "Warranty",
    value: `${product.warrantyPeriod || 0} Months`,
  });
  specsArray.push({ label: "Supplier", value: product.supplierName || "" });

  return null;
}
