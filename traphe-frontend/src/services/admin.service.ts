import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";

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
  roleName: string;
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

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  terminatedUsers: number;
  newUsersThisMonth: number;
}

export interface UserFilterParams {
  keyword?: string;
  status?: string;
  role?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export const adminService = {
  // Create employee account
  createEmployee: async (data: CreateEmployeeRequest) => {
    return axiosClient.post<unknown, ApiResponse<void>>(
      "/admin/create-employee",
      data,
    );
  },

  // Get all users (for admin) with pagination
  getAllUsers: async (params?: {
    role?: string;
    status?: string;
    page?: number;
    size?: number;
  }) => {
    const queryParams: any = {};

    if (params?.role && params.role !== "all-roles") {
      queryParams.role = params.role.toUpperCase();
    }
    if (params?.status && params.status !== "all-status") {
      queryParams.status = params.status.toUpperCase();
    }
    if (params?.page !== undefined) queryParams.page = params.page;
    if (params?.size !== undefined) queryParams.size = params.size;

    return axiosClient.get<unknown, ApiResponse<UserAccount[]>>(
      "/admin/users",
      { params: queryParams },
    );
  },

  // Get user detail by ID
  getUserById: async (userId: string) => {
    return axiosClient.get<unknown, ApiResponse<UserAccount>>(
      `/admin/users/${userId}`,
    );
  },

  // Get user statistics
  getUserStats: async () => {
    return axiosClient.get<unknown, ApiResponse<UserStats>>(
      "/admin/users/stats",
    );
  },

  // Search users by keyword
  searchUsers: async (keyword: string) => {
    return axiosClient.get<unknown, ApiResponse<UserAccount[]>>(
      "/admin/users/search",
      { params: { keyword } },
    );
  },

  // Search users with filters
  filterUsers: async (params: UserFilterParams) => {
    return axiosClient.get<unknown, ApiResponse<UserAccount[]>>(
      "/admin/users/filter",
      { params },
    );
  },

  // Get users by status
  getUsersByStatus: async (status: string) => {
    return axiosClient.get<unknown, ApiResponse<UserAccount[]>>(
      "/admin/users/by-status",
      { params: { status } },
    );
  },

  // Get users by role
  getUsersByRole: async (role: string) => {
    return axiosClient.get<unknown, ApiResponse<UserAccount[]>>(
      "/admin/users/by-role",
      { params: { role } },
    );
  },

  // Update user status
  updateUserStatus: async (userId: string, status: string) => {
    return axiosClient.put<unknown, ApiResponse<UserAccount>>(
      `/admin/users/${userId}/status`,
      null,
      { params: { status } },
    );
  },

  // Activate user
  activateUser: async (userId: string) => {
    return axiosClient.post<unknown, ApiResponse<UserAccount>>(
      `/admin/users/${userId}/activate`,
    );
  },

  // Suspend user
  suspendUser: async (userId: string) => {
    return axiosClient.post<unknown, ApiResponse<UserAccount>>(
      `/admin/users/${userId}/suspend`,
    );
  },

  // Terminate user
  terminateUser: async (userId: string) => {
    return axiosClient.post<unknown, ApiResponse<UserAccount>>(
      `/admin/users/${userId}/terminate`,
    );
  },

  // Replace all user roles
  replaceUserRoles: async (userId: string, roleIds: string[]) => {
    return axiosClient.put<unknown, ApiResponse<UserAccount>>(
      `/admin/users/${userId}/roles/replace`,
      roleIds,
    );
  },

  // Add multiple roles to user
  addRolesToUser: async (userId: string, roleIds: string[]) => {
    return axiosClient.post<unknown, ApiResponse<UserAccount>>(
      `/admin/users/${userId}/roles/batch-add`,
      roleIds,
    );
  },

  // Remove multiple roles from user
  removeRolesFromUser: async (userId: string, roleIds: string[]) => {
    return axiosClient.post<unknown, ApiResponse<UserAccount>>(
      `/admin/users/${userId}/roles/batch-remove`,
      roleIds,
    );
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
