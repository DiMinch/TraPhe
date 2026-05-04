import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api";
import type {
  UserInfo,
  UserAddress,
  CreateAddressRequest,
  Province,
  Commune,
} from "@/types/user";

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

  getAddresses: async () => {
    return axiosClient.get<any, ApiResponse<UserAddress[]>>("/users/addresses");
  },

  addAddress: async (data: CreateAddressRequest) => {
    return axiosClient.post<any, ApiResponse<UserAddress>>(
      "/users/addresses",
      data,
    );
  },

  deleteAddress: async (addressId: string) => {
    return axiosClient.delete<any, ApiResponse<null>>(
      `/users/addresses/${addressId}`,
    );
  },

  getProvinces: async () => {
    return axiosClient.get<any, ApiResponse<Province[]>>("/address/provinces");
  },

  getCommunes: async (provinceCode: string) => {
    return axiosClient.get<any, ApiResponse<Commune[]>>("/address/communes", {
      params: { provinceCode },
    });
  },
};
