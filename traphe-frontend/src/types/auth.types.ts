import type { UserInfo } from "./user.types";

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

export interface AuthResponseData {
  accessToken: string;
  tokenType: string;
  refreshToken: string;
  user: UserInfo;
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
