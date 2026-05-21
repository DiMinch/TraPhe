import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";
import type { Cart, AddToCartRequest } from "@/types/cart.types";

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

  updateQuantity: async (cartItemId: string, quantity: number) => {
    return axiosClient.put<any, ApiResponse<Cart>>(
      `/cart/update/${cartItemId}?quantity=${quantity}`,
    );
  },

  removeItem: async (cartItemId: string) => {
    return axiosClient.delete<any, ApiResponse<Cart>>(
      `/cart/remove/${cartItemId}`,
    );
  },

  clearCart: async () => {
    return axiosClient.delete<any, ApiResponse<void>>("/cart/clear");
  },
};
