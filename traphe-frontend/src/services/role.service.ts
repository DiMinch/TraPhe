import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";

export interface Role {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export interface UserInRole {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  avatar: string;
  status: string;
}

export const roleService = {
  // Get all roles with pagination
  getAllRoles: async (params?: { page?: number; size?: number }) => {
    return axiosClient.get<unknown, ApiResponse<Role[]>>("/admin/roles", {
      params,
    });
  },

  // Get all roles without pagination
  getAllRolesNoPagination: async () => {
    return axiosClient.get<unknown, ApiResponse<Role[]>>("/admin/roles/all");
  },

  // Get role by ID
  getRoleById: async (id: string) => {
    return axiosClient.get<unknown, ApiResponse<Role>>(`/admin/roles/${id}`);
  },

  // Get role by name
  getRoleByName: async (name: string) => {
    return axiosClient.get<unknown, ApiResponse<Role>>("/admin/roles/by-name", {
      params: { name },
    });
  },

  // Check if role name exists
  checkRoleExists: async (name: string) => {
    return axiosClient.get<unknown, ApiResponse<boolean>>(
      "/admin/roles/exists",
      {
        params: { name },
      },
    );
  },

  // Create new role
  createRole: async (data: CreateRoleRequest) => {
    return axiosClient.post<unknown, ApiResponse<Role>>("/admin/roles", data);
  },

  // Update role
  updateRole: async (id: string, data: UpdateRoleRequest) => {
    return axiosClient.put<unknown, ApiResponse<Role>>(
      `/admin/roles/${id}`,
      data,
    );
  },

  // Delete role
  deleteRole: async (id: string) => {
    return axiosClient.delete<unknown, ApiResponse<void>>(`/admin/roles/${id}`);
  },

  // Get users by role
  getUsersByRole: async (roleId: string) => {
    return axiosClient.get<unknown, ApiResponse<UserInRole[]>>(
      `/admin/roles/${roleId}/users`,
    );
  },
};
