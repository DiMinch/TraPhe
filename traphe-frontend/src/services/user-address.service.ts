import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  UserAddress,
  CreateUserAddressRequest,
  UpdateUserAddressRequest,
} from "@/types/address.types";

export const userAddressService = {
  /** Lấy tất cả địa chỉ giao hàng (địa chỉ mặc định ở đầu) */
  getMyAddresses: async () => {
    return axiosClient.get<any, ApiResponse<UserAddress[]>>(
      "/users/addresses",
    );
  },

  /** Xem chi tiết 1 địa chỉ */
  getAddressById: async (id: string) => {
    return axiosClient.get<any, ApiResponse<UserAddress>>(
      `/users/addresses/${id}`,
    );
  },

  /** Thêm địa chỉ mới */
  createAddress: async (data: CreateUserAddressRequest) => {
    return axiosClient.post<any, ApiResponse<UserAddress>>(
      "/users/addresses",
      data,
    );
  },

  /** Cập nhật địa chỉ */
  updateAddress: async (id: string, data: UpdateUserAddressRequest) => {
    return axiosClient.put<any, ApiResponse<UserAddress>>(
      `/users/addresses/${id}`,
      data,
    );
  },

  /** Xoá địa chỉ */
  deleteAddress: async (id: string) => {
    return axiosClient.delete<any, ApiResponse<null>>(
      `/users/addresses/${id}`,
    );
  },

  /** Đặt địa chỉ làm mặc định */
  setDefaultAddress: async (id: string) => {
    return axiosClient.patch<any, ApiResponse<UserAddress>>(
      `/users/addresses/${id}/default`,
    );
  },
};
