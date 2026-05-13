export const ProductStatus = {
  ACTIVE: "ACTIVE",
  HIDDEN: "HIDDEN",
} as const;

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];
