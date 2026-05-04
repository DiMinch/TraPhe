export interface ProductCardProps {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  image?: string;
  isNew?: boolean;
  discount?: string;
}
