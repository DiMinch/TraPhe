import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  UserInfo,
  UserAddress,
  CreateAddressRequest,
  Province,
  Commune,
} from "@/types/user.types";

export interface Address {
  id: string;
  userId: string;
  province: string;
  district: string;
  commune: string;
  detail: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddAddressRequest {
  province: string;
  district: string;
  commune: string;
  detail: string;
}

export const userService = {
  getProfile: async () => {
    return axiosClient.get<unknown, ApiResponse<UserInfo>>("/users/profile");
  },

  updateProfile: async (formData: FormData) => {
    return axiosClient.put<unknown, ApiResponse<UserInfo>>(
      "/users/profile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },

  // Address management
  getAddresses: async () => {
    return axiosClient.get<unknown, ApiResponse<Address[]>>("/users/addresses");
  },

  addAddress: async (data: AddAddressRequest) => {
    return axiosClient.post<unknown, ApiResponse<Address>>(
      "/users/addresses",
      data,
    );
  },

  deleteAddress: async (addressId: string) => {
    return axiosClient.delete<unknown, ApiResponse<void>>(
      `/users/addresses/${addressId}`,
    );
  },
};
