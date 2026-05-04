import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api";
import type { UserInfo } from "@/types/user";

export const userService = {
  getProfile: async () => {
    return axiosClient.get<any, ApiResponse<UserInfo>>("/users/profile");
  },

  updateProfile: async (formData: FormData) => {
    return axiosClient.put<any, ApiResponse<UserInfo>>(
      "/users/profile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },
};
