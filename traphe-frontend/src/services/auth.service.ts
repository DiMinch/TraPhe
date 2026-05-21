import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  AuthResponseData,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  GoogleLoginRequest,
  CreatePasswordRequest,
} from "@/types/auth.types";
import type { UserInfo } from "@/types/user.types";

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
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  loginGoogle: async (payload: GoogleLoginRequest) => {
    return axiosClient.post<any, ApiResponse<AuthResponseData>>(
      "/auth/google",
      payload,
    );
  },

  createPassword: async (payload: CreatePasswordRequest) => {
    return axiosClient.post<any, ApiResponse<null>>(
      "/auth/create-password",
      payload,
    );
  },

  skipLinking: async () => {
    return axiosClient.post<any, ApiResponse<null>>("/auth/skip-linking");
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
