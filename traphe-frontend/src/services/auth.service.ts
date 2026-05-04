import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api";
import type {
  AuthResponseData,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
} from "@/types/auth";
import type { UserInfo } from "@/types/user";

export const authService = {
  login: async (payload: LoginRequest) => {
    return axiosClient.post<any, ApiResponse<AuthResponseData>>(
      "/auth/login",
      payload,
    );
  },

  register: async (payload: RegisterRequest) => {
    return axiosClient.post<any, ApiResponse<null>>("/auth/register", payload);
  },

  verifySignup: async (payload: VerifyOtpRequest) => {
    return axiosClient.post<any, ApiResponse<null>>(
      "/auth/verify-signup",
      payload,
    );
  },

  changePassword: async (payload: ChangePasswordRequest) => {
    return axiosClient.post<any, ApiResponse<null>>(
      "/auth/change-password",
      payload,
    );
  },

  getCurrentUser: (): UserInfo | null => {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  logout: async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      localStorage.clear();
    }
  },
};
