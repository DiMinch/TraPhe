import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api";
import type { Category } from "@/types/category";

export const categoryService = {
  getAllCategories: async () => {
    return axiosClient.get<any, ApiResponse<Category[]>>("/categories");
  },
};
