import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";

// ---- Legacy interfaces (kept for backwards compat with other pages) ----

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

// ---- Staff interfaces (aligned with AdminStaffController) ----

export interface StaffMember {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string;
  isActive: boolean; // JSON: "active" (Jackson auto-strips "is" prefix on boolean)
  active?: boolean;  // Jackson may serialize as "active" instead of "isActive"
  roles: string[];   // e.g. ["ROLE_CASHIER", "ROLE_BARISTA"]
  branchId: string | null;
  branchName: string | null;
}

export interface CreateStaffRequest {
  email: string;
  fullName: string;
  phoneNumber?: string;
  password: string;
  roles?: string[];  // e.g. ["ROLE_CASHIER"]
  branchId?: string;
}

export interface UpdateStaffRequest {
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface UpdateStaffRoleRequest {
  roles: string[]; // e.g. ["ROLE_BARISTA"]
}

export interface UpdateStaffBranchRequest {
  branchId: string | null;
}

// ---- Branch interface (for the branch dropdown) ----

export interface BranchOption {
  id: string;
  name: string;
  address?: string;
}

// =====================================================================
// Admin Service — uses /api/admin/staff (AdminStaffController)
// =====================================================================

export const adminService = {
  // ---- Staff CRUD (AdminStaffController: /api/admin/staff) ----

  /** GET /api/admin/staff — List all staff (scoped by branch for BM) */
  getAllStaff: async () => {
    return axiosClient.get<unknown, ApiResponse<StaffMember[]>>("/admin/staff");
  },

  /** GET /api/admin/staff/{id} */
  getStaffById: async (id: string) => {
    return axiosClient.get<unknown, ApiResponse<StaffMember>>(`/admin/staff/${id}`);
  },

  /** POST /api/admin/staff — Create a new staff member */
  createStaff: async (data: CreateStaffRequest) => {
    return axiosClient.post<unknown, ApiResponse<StaffMember>>("/admin/staff", data);
  },

  /** PUT /api/admin/staff/{id} — Update staff info (name, phone, active) */
  updateStaff: async (id: string, data: UpdateStaffRequest) => {
    return axiosClient.put<unknown, ApiResponse<StaffMember>>(`/admin/staff/${id}`, data);
  },

  /** PUT /api/admin/staff/{id}/role — Replace staff roles */
  updateStaffRole: async (id: string, data: UpdateStaffRoleRequest) => {
    return axiosClient.put<unknown, ApiResponse<StaffMember>>(`/admin/staff/${id}/role`, data);
  },

  /** PUT /api/admin/staff/{id}/branch — Change staff branch */
  updateStaffBranch: async (id: string, data: UpdateStaffBranchRequest) => {
    return axiosClient.put<unknown, ApiResponse<StaffMember>>(`/admin/staff/${id}/branch`, data);
  },

  /** DELETE /api/admin/staff/{id} — Soft-delete (disable) staff */
  deleteStaff: async (id: string) => {
    return axiosClient.delete<unknown, ApiResponse<void>>(`/admin/staff/${id}`);
  },

  // ---- Branch listing (for dropdowns) ----

  /** GET /api/admin/branches */
  getAllBranches: async () => {
    return axiosClient.get<unknown, ApiResponse<BranchOption[]>>("/admin/branches");
  },

  // ---- Legacy user admin methods (kept for other pages that may still use them) ----

  createEmployee: async (data: { username: string; email: string; password: string; fullName: string; phone?: string; roleName: string }) => {
    // Redirect to the new Staff API
    return adminService.createStaff({
      email: data.email,
      fullName: data.fullName,
      phoneNumber: data.phone,
      password: data.password,
      roles: [data.roleName],
    });
  },

  getAllUsers: async () => {
    // Map to getAllStaff — returns StaffMember[] which is close enough
    return adminService.getAllStaff();
  },

  getUserById: async (userId: string) => {
    return adminService.getStaffById(userId);
  },

  getUserStats: async () => {
    return axiosClient.get<unknown, ApiResponse<UserStats>>("/admin/users/stats");
  },

  searchUsers: async (keyword: string) => {
    return axiosClient.get<unknown, ApiResponse<UserAccount[]>>("/admin/users/search", { params: { keyword } });
  },

  filterUsers: async (params: UserFilterParams) => {
    return axiosClient.get<unknown, ApiResponse<UserAccount[]>>("/admin/users/filter", { params });
  },

  getUsersByStatus: async (status: string) => {
    return axiosClient.get<unknown, ApiResponse<UserAccount[]>>("/admin/users/by-status", { params: { status } });
  },

  getUsersByRole: async (role: string) => {
    return axiosClient.get<unknown, ApiResponse<UserAccount[]>>("/admin/users/by-role", { params: { role } });
  },

  updateUserStatus: async (userId: string, status: string) => {
    return axiosClient.put<unknown, ApiResponse<UserAccount>>(`/admin/users/${userId}/status`, null, { params: { status } });
  },

  activateUser: async (userId: string) => {
    return adminService.updateStaff(userId, { fullName: "", isActive: true });
  },

  suspendUser: async (userId: string) => {
    return adminService.updateStaff(userId, { fullName: "", isActive: false });
  },

  terminateUser: async (userId: string) => {
    return adminService.deleteStaff(userId);
  },

  replaceUserRoles: async (userId: string, roleIds: string[]) => {
    return axiosClient.put<unknown, ApiResponse<UserAccount>>(`/admin/users/${userId}/roles/replace`, roleIds);
  },

  addRolesToUser: async (userId: string, roleIds: string[]) => {
    return axiosClient.post<unknown, ApiResponse<UserAccount>>(`/admin/users/${userId}/roles/batch-add`, roleIds);
  },

  removeRolesFromUser: async (userId: string, roleIds: string[]) => {
    return axiosClient.post<unknown, ApiResponse<UserAccount>>(`/admin/users/${userId}/roles/batch-remove`, roleIds);
  },

  getAllRoles: async () => {
    return axiosClient.get<unknown, ApiResponse<Role[]>>("/admin/roles");
  },

  deleteUser: async (userId: string) => {
    return adminService.deleteStaff(userId);
  },
};
