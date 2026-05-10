import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  Cart,
  AddToCartRequest,
  UpdateCartRequest,
} from "@/types/cart.types";

export const cartService = {
  getCart: async () => {
    return axiosClient.get<any, ApiResponse<Cart>>("/cart");
  },

  getCount: async () => {
    return axiosClient.get<any, ApiResponse<{ count: number }>>("/cart/count");
  },

  addToCart: async (data: AddToCartRequest) => {
    return axiosClient.post<any, ApiResponse<Cart>>("/cart/add", data);
  },

  updateQuantity: async (data: UpdateCartRequest) => {
    return axiosClient.put<any, ApiResponse<Cart>>("/cart/update", data);
  },

  incrementItem: async (variantId: string) => {
    return axiosClient.put<any, ApiResponse<Cart>>(
      `/cart/increment/${variantId}`,
    );
  },

  decrementItem: async (variantId: string) => {
    return axiosClient.put<any, ApiResponse<Cart>>(
      `/cart/decrement/${variantId}`,
    );
  },

  removeItem: async (variantId: string) => {
    return axiosClient.delete<any, ApiResponse<Cart>>(
      `/cart/remove/${variantId}`,
    );
  },

  clearCart: async () => {
    return axiosClient.delete<any, ApiResponse<void>>("/cart/clear");
  },
};
