export interface ProductCardProps {
  id: number | string;
  variantId?: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  image?: string;
  isNew?: boolean;
  discount?: string;
  description?: string;
  categoryName?: string;
  layout?: "grid" | "list";
}
