// ===== TraPhe F&B Product Types =====
// Aligned with backend MenuItemResponse, MenuItemDetailResponse

export interface MenuItemSize {
  id: string;
  sizeName: string;
  sellingPrice: number;
  displayOrder: number;
}

export interface OptionValue {
  id: string;
  label: string;
  sortOrder: number;
  default: boolean;
}

export interface OptionGroup {
  id: string;
  name: string;
  type: string; // SUGAR, ICE, TEMPERATURE, etc.
  displayOrder: number;
  values: OptionValue[];
  required: boolean;
}

export interface ToppingOption {
  id: string;
  name: string;
  extraPrice: number;
  imageUrl: string | null;
  available: boolean;
}

export interface Product {
  id: string;
  name: string;
  imageUrl: string | null;
  description: string;
  status: string;
  categoryId: string;
  categoryName: string;
  basePrice: number | null;
  preparationTime: number;
  allowToppings: boolean;
  sizes: MenuItemSize[];
  ingredientId?: string | null;
  createdAt: string;
  branchAvailable?: boolean | null;
  effectivePrice?: number | null;
  unavailableReason?: string | null;
  isDrink: boolean;

  // Drink customization options from backend
  optionGroups?: OptionGroup[];
  availableToppings?: ToppingOption[];

  // Legacy PC-Shop compatibility fields
  variants?: ProductVariant[];
  supplierName?: string;
  warrantyPeriod?: number;
  minStockThreshold?: number;
  commonSpecs?: string;
}

export interface ProductPageResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
}

// Legacy compatibility aliases (used by admin pages)
export interface ProductVariant {
  id: string;
  sku?: string;
  barcode?: string;
  variantName: string;
  variantSpecs?: string;
  sellingPrice: number;
}

export interface CreateProductRequest {
  name: string;
  categoryId: string;
  description?: string;
  basePrice?: number;
  preparationTime?: number;
  isDrink?: boolean;
  allowToppings?: boolean;
  sizes?: { sizeName: string; sellingPrice: number; displayOrder: number }[];
  toppingIds?: string[];
  optionGroupIds?: string[];
  ingredientId?: string;

  // Legacy PC-Shop compatibility fields
  supplierId?: string;
  warrantyPeriod?: number;
  minStockThreshold?: number;
  commonSpecs?: string;
}

export interface UpdateProductRequest {
  name?: string;
  categoryId?: string;
  description?: string;
  basePrice?: number;
  preparationTime?: number;
  isDrink?: boolean;
  allowToppings?: boolean;
  status?: string;
  sizes?: { sizeName: string; sellingPrice: number; displayOrder: number }[];
  toppingIds?: string[];
  optionGroupIds?: string[];
  ingredientId?: string;

  // Legacy PC-Shop compatibility fields
  supplierId?: string;
  warrantyPeriod?: number;
  minStockThreshold?: number;
  commonSpecs?: string;
}

export interface CreateVariantRequest {
  productId: string;
  sizeName?: string;
  sellingPrice: number;
  displayOrder?: number;

  // Legacy PC-Shop compatibility fields
  sku?: string;
  barcode?: string;
  variantName?: string;
  variantSpecs?: string;
  purchasePriceAvg?: number;
}

export interface UpdateVariantRequest {
  sizeName?: string;
  sellingPrice?: number;
  displayOrder?: number;

  // Legacy PC-Shop compatibility fields
  sku?: string;
  barcode?: string;
  variantName?: string;
  variantSpecs?: string;
  purchasePriceAvg?: number;
}

export interface GetProductsParams {
  page?: number;
  size?: number;
  sort?: string[];
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  status?: string;
  isDrink?: boolean;
  sortBy?: string;
  sortDir?: string;
  [key: string]: any;
}
