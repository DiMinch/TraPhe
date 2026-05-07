import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategorySpec,
  CreateCategorySpecRequest,
} from "@/types/category.types";

export const categoryService = {
  getAllCategories: async () => {
    return axiosClient.get<unknown, ApiResponse<Category[]>>("/categories");
  },

  getCategoryById: async (id: string) => {
    return axiosClient.get<unknown, ApiResponse<Category>>(`/categories/${id}`);
  },

  createCategory: async (data: CreateCategoryRequest, imageFile?: File) => {
    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" }),
    );
    if (imageFile) {
      formData.append("image", imageFile);
    }
    return axiosClient.post<unknown, ApiResponse<Category>>(
      "/categories",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },

  updateCategory: async (
    id: string,
    data: UpdateCategoryRequest,
    imageFile?: File,
  ) => {
    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" }),
    );
    if (imageFile) {
      formData.append("image", imageFile);
    }
    return axiosClient.put<unknown, ApiResponse<Category>>(
      `/categories/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },

  deleteCategory: async (id: string) => {
    return axiosClient.delete<unknown, ApiResponse<void>>(`/categories/${id}`);
  },

  // Spec management
  getSpecs: async (categoryId: string) => {
    return axiosClient.get<unknown, ApiResponse<CategorySpec[]>>(
      `/categories/${categoryId}/specs`,
    );
  },

  createSpec: async (data: CreateCategorySpecRequest) => {
    return axiosClient.post<unknown, ApiResponse<CategorySpec>>(
      "/categories/specs",
      data,
    );
  },

  updateSpec: async (specId: string, data: CreateCategorySpecRequest) => {
    return axiosClient.put<unknown, ApiResponse<CategorySpec>>(
      `/categories/specs/${specId}`,
      data,
    );
  },

  deleteSpec: async (specId: string) => {
    return axiosClient.delete<unknown, ApiResponse<void>>(
      `/categories/specs/${specId}`,
    );
  },
};
