import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductVariant,
  CreateVariantRequest,
  UpdateVariantRequest,
} from "@/types/product";

export const productService = {
  // Product CRUD
  getAllProducts: async () => {
    return axiosClient.get<any, ApiResponse<Product[]>>("/products");
  },

  getProductById: async (id: string) => {
    return axiosClient.get<any, ApiResponse<Product>>(`/products/${id}`);
  },

  createProduct: async (data: CreateProductRequest, image?: File) => {
    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" }),
    );
    if (image) {
      formData.append("image", image);
    }
    return axiosClient.post<any, ApiResponse<Product>>("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateProduct: async (
    id: string,
    data: UpdateProductRequest,
    image?: File,
  ) => {
    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" }),
    );
    if (image) {
      formData.append("image", image);
    }
    return axiosClient.put<any, ApiResponse<Product>>(
      `/products/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },

  deleteProduct: async (id: string) => {
    return axiosClient.delete<any, ApiResponse<void>>(`/products/${id}`);
  },

  // Variant CRUD
  createVariant: async (data: CreateVariantRequest) => {
    return axiosClient.post<any, ApiResponse<ProductVariant>>(
      "/products/variants",
      data,
    );
  },

  updateVariant: async (id: string, data: UpdateVariantRequest) => {
    return axiosClient.put<any, ApiResponse<ProductVariant>>(
      `/products/variants/${id}`,
      data,
    );
  },

  deleteVariant: async (id: string) => {
    return axiosClient.delete<any, ApiResponse<void>>(
      `/products/variants/${id}`,
    );
  },
};
