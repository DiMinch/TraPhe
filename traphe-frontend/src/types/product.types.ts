export interface ProductVariant {
  id: string;
  sku: string;
  barcode?: string;
  variantName: string;
  variantSpecs: string;
  sellingPrice: number;
}

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  status: string;
  categoryName: string;
  categoryId: string;
  supplierName: string;
  minStockThreshold: number;
  warrantyPeriod: number;
  commonSpecs: string;
  variants: ProductVariant[];
}

export interface CreateProductRequest {
  name: string;
  categoryId: string;
  supplierId: string;
  description?: string;
  minStockThreshold?: number;
  warrantyPeriod?: number;
  commonSpecs?: string;
}

export interface UpdateProductRequest {
  name?: string;
  categoryId?: string;
  supplierId?: string;
  description?: string;
  minStockThreshold?: number;
  warrantyPeriod?: number;
  commonSpecs?: string;
}

export interface CreateVariantRequest {
  productId: string;
  sku: string;
  barcode?: string;
  variantName: string;
  variantSpecs: string;
  purchasePriceAvg?: number;
  sellingPrice: number;
}

export interface UpdateVariantRequest {
  sku?: string;
  barcode?: string;
  variantName?: string;
  variantSpecs?: string;
  purchasePriceAvg?: number;
  sellingPrice?: number;
}
