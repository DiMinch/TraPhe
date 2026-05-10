export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  productStatus: string;
  warrantyPeriod: number;
  productVariantId: string;
  variantName: string;
  variantSpecs: string;
  sku: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  currentPrice: number;
  priceChanged: boolean;
  subtotal: number;
  availableStock: number;
  isAvailable: boolean;
  addedAt: string;
}

export interface Cart {
  id: string;
  customerId: string;
  customerName: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productVariantId: string;
  quantity?: number;
}

export interface UpdateCartRequest {
  productVariantId: string;
  quantity: number;
}
