import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api";

export interface UserListItem {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  avatar: string;
  status: string;
  isFirstLogin: boolean;
}

export interface CreateEmployeeRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  avatar: string;
  status: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const adminService = {
  // Create employee account
  createEmployee: async (data: CreateEmployeeRequest) => {
    return axiosClient.post<unknown, ApiResponse<void>>(
      "/admin/create-employee",
      data,
    );
  },

  // Get all users (for admin)
  getAllUsers: async () => {
    return axiosClient.get<unknown, ApiResponse<UserAccount[]>>("/admin/users");
  },

  // Get all roles
  getAllRoles: async () => {
    return axiosClient.get<unknown, ApiResponse<Role[]>>("/admin/roles");
  },

  // Delete user
  deleteUser: async (userId: string) => {
    return axiosClient.delete<unknown, ApiResponse<void>>(
      `/admin/users/${userId}`,
    );
  },
};
