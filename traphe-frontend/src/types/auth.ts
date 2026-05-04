import type { UserInfo } from "./user";

export interface GoogleLoginRequest {
  idToken: string;
}

export interface CreatePasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface AuthResponseData extends UserInfo {
  accessToken: string;
  type: string;
  refreshToken: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password?: string;
  fullName: string;
  phone: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
