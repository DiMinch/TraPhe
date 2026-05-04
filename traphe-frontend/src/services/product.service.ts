import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api";
import type { Product } from "@/types/product";

export const productService = {
  getAllProducts: async () => {
    return axiosClient.get<any, ApiResponse<Product[]>>("/products");
  },

  getProductById: async (id: string) => {
    return axiosClient.get<any, ApiResponse<Product>>(`/products/${id}`);
  },
};
