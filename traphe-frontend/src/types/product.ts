import { ProductStatus } from "../enums/product.js";

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
  status: ProductStatus;
  categoryName: string;
  categoryId: string;
  supplierName: string;
  minStockThreshold: number;
  warrantyPeriod: number;
  commonSpecs: string;
  variants: ProductVariant[];
}
