import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category.types";

export const categoryService = {
  getAllCategories: async () => {
    return axiosClient.get<any, ApiResponse<Category[]>>("/categories");
  },

  getCategoryById: async (id: string) => {
    return axiosClient.get<unknown, ApiResponse<Category>>(`/categories/${id}`);
  },

  createCategory: async (data: CreateCategoryRequest, imageFile?: File) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
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
    formData.append("data", JSON.stringify(data));
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
};
