import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import {
  adminService,
  type StaffMember,
  type BranchOption,
  type Role,
} from "@/services/admin.service";
import { authService } from "@/services/auth.service";
import { UserRole } from "@/enums/roles.enum";
import { roleService } from "@/services/role.service";
import axiosClient from "@/lib/axios-client";
import { toast } from "sonner";
import {
  PageContainer,
  EmptyState,
} from "@/components/layout/PageLayout";

// Adapt StaffMember → the shape the table already expects
interface UserAccount {
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
  branchId?: string | null;
  branchName?: string | null;
}

function staffToUserAccount(s: StaffMember): UserAccount {
  return {
    id: String(s.id),
    username: s.email,
    email: s.email,
    fullName: s.fullName || "",
    phone: s.phoneNumber || "",
    avatar: s.avatarUrl || "",
    status: (s.isActive ?? s.active) ? "ACTIVE" : "INACTIVE",
    roles: s.roles ? Array.from(s.roles) : [],
    isActive: s.isActive ?? (s as any).active ?? true,
    createdAt: "",
    updatedAt: "",
    branchId: s.branchId,
    branchName: s.branchName,
  };
}

export default function UserAccountsPage() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [roleFilter, setRoleFilter] = useState("all-role");
  const [branchFilter, setBranchFilter] = useState("all-branch");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Roles management
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  // User details dialog
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<UserAccount | null>(null);

  // Create employee dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
    roleName: "",
    branchId: "",
  });

  // Branch data
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const currentUser = authService.getCurrentUser();
  const isBranchManager = currentUser?.roles?.includes(UserRole.BRANCH_MANAGER) && !currentUser?.roles?.includes(UserRole.ADMIN);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchBranches();
  }, []);

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, roleFilter, branchFilter, userAccounts]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllStaff();
      // The backend returns a raw List<StaffResponse> (not ApiResponse-wrapped).
      // The axios interceptor returns response.data, so `response` is already
      // the array or an ApiResponse object depending on the controller.
      const rawData = (response as any)?.data ?? response;
      const staffList = Array.isArray(rawData)
        ? rawData
        : (rawData as any)?.content || [];

      const usersData = staffList.map(staffToUserAccount);
      // Sort: active first, then by name
      usersData.sort((a: UserAccount, b: UserAccount) => a.fullName.localeCompare(b.fullName));

      setUserAccounts(usersData);
      setFilteredUsers(usersData);
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to load staff";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      if (isBranchManager && currentUser?.branchId) {
        setBranches([{ id: currentUser.branchId, name: "Chi nhánh của tôi" }]);
        return;
      }
      const res = await axiosClient.get<unknown, any>("/branches");
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.content || [];
      setBranches(list);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await roleService.getAllRolesNoPagination();
      if (response.data) {
        const rolesData = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.content || [];
        setAvailableRoles(rolesData);
      }
    } catch (error) {
      console.error("Error fetching roles, using fallback:", error);
      // Fallback: provide hardcoded role list so the UI still works
      setAvailableRoles([
        { id: "ROLE_ADMIN", name: "ROLE_ADMIN", description: "Administrator", createdAt: "", updatedAt: "" },
        { id: "ROLE_BRANCH_MANAGER", name: "ROLE_BRANCH_MANAGER", description: "Branch Manager", createdAt: "", updatedAt: "" },
        { id: "ROLE_CASHIER", name: "ROLE_CASHIER", description: "Cashier", createdAt: "", updatedAt: "" },
        { id: "ROLE_BARISTA", name: "ROLE_BARISTA", description: "Barista", createdAt: "", updatedAt: "" },
        { id: "ROLE_EMPLOYEE", name: "ROLE_EMPLOYEE", description: "Employee", createdAt: "", updatedAt: "" },
      ]);
    }
  };

  const filterUsers = () => {
    let filtered = [...userAccounts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all-status") {
      filtered = filtered.filter(
        (user) => user.status.toLowerCase() === statusFilter,
      );
    }

    // Role filter
    if (roleFilter !== "all-role") {
      filtered = filtered.filter((user) =>
        user.roles?.some((role) =>
          role.toLowerCase().includes(roleFilter.toLowerCase()),
        ),
      );
    }

    // Branch filter
    if (branchFilter !== "all-branch") {
      filtered = filtered.filter(
        (user) => user.branchId === branchFilter,
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Full Name", "Username", "Email", "Phone", "Roles", "Status", "Branch"];
    const rows = filteredUsers.map(u => [
      u.id,
      u.fullName,
      u.username,
      u.email,
      u.phone,
      u.roles.join("; "),
      u.status,
      u.branchName || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `staff_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRoleBadge = (roles: string[]) => {
    if (!roles || roles.length === 0) return <span className="text-slate-400">—</span>;
    const roleName = roles[0];
    const cleanRole = roleName.replace("ROLE_", "");
    let icon = "person";
    let bg = "bg-stone-50 text-stone-700 border-stone-100";
    
    if (cleanRole === "ADMIN") {
      icon = "shield";
      bg = "bg-red-50 text-red-700 border-red-100";
    } else if (cleanRole === "BRANCH_MANAGER" || cleanRole === "MANAGER") {
      icon = "storefront";
      bg = "bg-purple-50 text-purple-700 border-purple-100";
    } else if (cleanRole === "BARISTA") {
      icon = "local_cafe";
      bg = "bg-blue-50 text-blue-700 border-blue-100";
    } else if (cleanRole === "CASHIER") {
      icon = "point_of_sale";
      bg = "bg-orange-50 text-orange-700 border-orange-100";
    }

    const displayName = cleanRole === "BRANCH_MANAGER" ? "Branch Manager" : cleanRole.charAt(0) + cleanRole.slice(1).toLowerCase();

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${bg}`}>
        <span className="material-symbols-outlined text-[14px]">{icon}</span>
        {displayName}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Active
          </span>
        );
      case "INACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Inactive
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-100">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Suspended
          </span>
        );
      case "TERMINATED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-100">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
            Terminated
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-800 text-xs font-medium border border-yellow-200">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
            On Leave
          </span>
        );
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case "ACTIVE":
        return "bg-green-100 text-green-700 hover:bg-green-100 border-0";
      case "INACTIVE":
      case "PENDING":
        return "bg-slate-100 text-slate-700 hover:bg-slate-100 border-0";
      case "SUSPENDED":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0";
      case "TERMINATED":
        return "bg-red-100 text-red-700 hover:bg-red-100 border-0";
      default:
        return "bg-slate-100 text-slate-700 hover:bg-slate-100 border-0";
    }
  };

  // User status actions
  const handleActivateUser = async (userId: string) => {
    try {
      setSubmitting(true);
      await adminService.activateUser(userId);
      toast.success("User activated successfully");
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to activate user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      setSubmitting(true);
      await adminService.suspendUser(userId);
      toast.success("User suspended successfully");
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to suspend user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTerminateUser = async (userId: string) => {
    try {
      setSubmitting(true);
      await adminService.terminateUser(userId);
      toast.success("User terminated successfully");
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to terminate user");
    } finally {
      setSubmitting(false);
    }
  };

  // Roles management
  const handleEditRoles = (user: UserAccount) => {
    setSelectedUser(user);
    // Map role names to role IDs
    const userRoleIds = availableRoles
      .filter((role) => user.roles?.includes(role.name))
      .map((role) => role.id);
    setSelectedRoleIds(userRoleIds);
    setIsRolesDialogOpen(true);
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      await adminService.replaceUserRoles(selectedUser.id, selectedRoleIds);
      toast.success("User roles updated successfully");
      setIsRolesDialogOpen(false);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update roles");
    } finally {
      setSubmitting(false);
    }
  };

  // View user details
  const handleViewUser = async (userId: string) => {
    try {
      const response = await adminService.getUserById(userId);
      const rawData = (response as any)?.data ?? response;
      if (rawData) {
        setUserDetails(staffToUserAccount(rawData as any));
        setIsUserDetailsOpen(true);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load user details",
      );
    }
  };

  const handleDeleteClick = (user: { id: string; name: string }) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await adminService.deleteUser(userToDelete.id);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to delete user";
      toast.error(errorMsg);
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  // Create employee handler
  const handleCreateEmployee = async () => {
    // Validate form
    if (
      !newEmployee.email.trim() ||
      !newEmployee.password.trim() ||
      !newEmployee.fullName.trim() ||
      !newEmployee.roleName
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmployee.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Password validation (minimum 6 characters)
    if (newEmployee.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setSubmitting(true);
      await adminService.createStaff({
        email: newEmployee.email.trim(),
        password: newEmployee.password,
        fullName: newEmployee.fullName.trim(),
        phoneNumber: newEmployee.phone.trim() || undefined,
        roles: [newEmployee.roleName],
        branchId: isBranchManager ? undefined : (newEmployee.branchId || undefined),
      });
      toast.success("Tạo nhân viên thành công!");
      setIsCreateDialogOpen(false);
      // Reset form
      setNewEmployee({
        username: "",
        email: "",
        password: "",
        fullName: "",
        phone: "",
        roleName: "",
        branchId: "",
      });
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create employee");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      {/* Header Section */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="font-ui-heading text-xl font-bold text-espresso">Staff Management</h1>
          <p className="text-smoke mt-1 text-sm">Manage employee profiles, roles, and branch assignments.</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-admin-border rounded-lg text-espresso bg-white hover:bg-cream transition-colors text-sm font-medium shadow-none h-10"
            variant="outline"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-roast text-white rounded-lg hover:bg-caramel transition-colors text-sm font-medium border-0 h-10"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add New Staff
          </Button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-admin-surface border border-admin-border rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-wrap gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">search</span>
            <Input
              className="w-full pl-10 pr-4 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-sm focus:outline-none focus-visible:ring-0 focus:border-roast focus:ring-1 focus:ring-roast transition-colors h-10 shadow-none"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="py-2.5 pl-4 pr-8 bg-admin-bg border border-admin-border rounded-lg text-sm focus:outline-none focus:border-roast focus:ring-1 focus:ring-roast text-espresso appearance-none font-medium h-10 w-48 shadow-none">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-admin-border rounded-lg">
                <SelectItem value="all-branch">All Branches</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="py-2.5 pl-4 pr-8 bg-admin-bg border border-admin-border rounded-lg text-sm focus:outline-none focus:border-roast focus:ring-1 focus:ring-roast text-espresso appearance-none font-medium h-10 w-48 shadow-none">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-admin-border rounded-lg">
                <SelectItem value="all-role">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="branch_manager">Branch Manager</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
                <SelectItem value="barista">Barista</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="py-2.5 pl-4 pr-8 bg-admin-bg border border-admin-border rounded-lg text-sm focus:outline-none focus:border-roast focus:ring-1 focus:ring-roast text-espresso appearance-none font-medium h-10 w-48 shadow-none">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-admin-border rounded-lg">
                <SelectItem value="all-status">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-smoke">
          <span className="material-symbols-outlined text-[18px]">filter_list</span>
          <span>{filteredUsers.length} Total Staff</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-admin-surface border border-admin-border rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-foam flex items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin text-roast" />
              </div>
              <span className="mt-4 text-slate-600 font-medium">
                Loading users...
              </span>
            </div>
          ) : currentUsers.length === 0 ? (
            <EmptyState
              icon={<Users className="w-8 h-8 text-slate-400" />}
              title="No users found"
              description="Try adjusting your search or filter criteria"
            />
          ) : (
            <Table className="w-full text-left border-collapse">
              <TableHeader>
                <TableRow className="bg-admin-bg border-b border-admin-border text-smoke text-xs uppercase tracking-wider font-semibold hover:bg-admin-bg">
                  <TableHead className="px-6 py-4 font-ui-heading text-smoke font-semibold h-auto">Staff Member</TableHead>
                  <TableHead className="px-6 py-4 font-ui-heading text-smoke font-semibold h-auto">Role</TableHead>
                  <TableHead className="px-6 py-4 font-ui-heading text-smoke font-semibold h-auto">Branch</TableHead>
                  <TableHead className="px-6 py-4 font-ui-heading text-smoke font-semibold h-auto">Contact Info</TableHead>
                  <TableHead className="px-6 py-4 font-ui-heading text-smoke font-semibold h-auto">Status</TableHead>
                  <TableHead className="px-6 py-4 font-ui-heading text-smoke font-semibold text-right h-auto">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-admin-border text-sm">
                {currentUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-admin-bg/50 transition-colors border-admin-border"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            alt={`${user.fullName} Avatar`}
                            className="w-10 h-10 shrink-0 rounded-full object-cover border border-admin-border"
                            src={user.avatar}
                          />
                        ) : (
                          <div className="w-10 h-10 shrink-0 rounded-full bg-latte flex items-center justify-center text-white font-bold border border-admin-border text-sm">
                            {user.fullName
                              ? user.fullName
                                  .split(" ")
                                  .filter(Boolean)
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()
                              : "US"}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-espresso">{user.fullName || "N/A"}</div>
                          <div className="text-xs text-smoke">ID: #EMP-{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.roles)}
                    </td>
                    <td className="px-6 py-4 text-smoke">
                      {user.branchName || <span className="text-stone-400">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-espresso">{user.email}</div>
                      <div className="text-xs text-smoke">{user.phone || "—"}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg hover:bg-slate-100 transition-colors text-smoke hover:text-roast shadow-none"
                            disabled={submitting}
                          >
                            <span className="material-symbols-outlined">more_vert</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rounded-xl border-slate-200 shadow-lg bg-white"
                        >
                          <DropdownMenuItem
                            onClick={() => handleViewUser(user.id)}
                            className="cursor-pointer"
                          >
                            <span className="material-symbols-outlined mr-2 text-[18px]">person</span>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditRoles(user)}
                            className="cursor-pointer"
                          >
                            <span className="material-symbols-outlined mr-2 text-[18px]">shield</span>
                            Manage Roles
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status?.toUpperCase() !== "ACTIVE" && (
                            <DropdownMenuItem
                              onClick={() => handleActivateUser(user.id)}
                              className="text-green-600 cursor-pointer"
                            >
                              <span className="material-symbols-outlined mr-2 text-[18px] text-green-600">check_circle</span>
                              Activate
                            </DropdownMenuItem>
                          )}
                          {user.status?.toUpperCase() !== "SUSPENDED" && (
                            <DropdownMenuItem
                              onClick={() => handleSuspendUser(user.id)}
                              className="text-yellow-600 cursor-pointer"
                            >
                              <span className="material-symbols-outlined mr-2 text-[18px] text-yellow-600">block</span>
                              Suspend
                            </DropdownMenuItem>
                          )}
                          {user.status?.toUpperCase() !== "TERMINATED" && (
                            <DropdownMenuItem
                              onClick={() => handleTerminateUser(user.id)}
                              className="text-red-600 cursor-pointer"
                            >
                              <span className="material-symbols-outlined mr-2 text-[18px] text-red-600">cancel</span>
                              Terminate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleDeleteClick({
                                id: user.id,
                                name: user.fullName || user.username,
                              })
                            }
                            className="text-red-600 cursor-pointer"
                          >
                            <span className="material-symbols-outlined mr-2 text-[18px] text-red-600">delete</span>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-admin-border bg-white flex items-center justify-between">
            <div className="text-sm text-smoke">
              Showing <span className="font-medium text-espresso">{startIndex + 1}</span> to <span className="font-medium text-espresso">{Math.min(endIndex, filteredUsers.length)}</span> of <span className="font-medium text-espresso">{filteredUsers.length}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-admin-border rounded text-sm text-smoke hover:bg-admin-bg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 border rounded text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-roast border-roast text-white"
                      : "border-admin-border text-smoke hover:bg-admin-bg"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-admin-border rounded text-sm text-smoke hover:bg-admin-bg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={userToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
        contextMessage="from the user accounts"
      />

      {/* Create Employee Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Employee</DialogTitle>
            <DialogDescription>
              Add a new employee account to the system
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={newEmployee.username}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, username: e.target.value })
                }
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Enter full name"
                value={newEmployee.fullName}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, fullName: e.target.value })
                }
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={newEmployee.email}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, email: e.target.value })
                }
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={newEmployee.phone}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, phone: e.target.value })
                }
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newEmployee.roleName}
                onValueChange={(value) =>
                  setNewEmployee({ ...newEmployee, roleName: value })
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name.replace("ROLE_", "")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!isBranchManager && (
              <div className="space-y-2">
                <Label htmlFor="branchId">Chi nhánh</Label>
                <Select
                  value={newEmployee.branchId}
                  onValueChange={(value) =>
                    setNewEmployee({ ...newEmployee, branchId: value })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Chọn chi nhánh" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {isBranchManager && (
              <p className="text-xs text-slate-500 italic">
                Nhân viên sẽ tự động được gán vào chi nhánh của bạn.
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password (min 6 characters)"
                value={newEmployee.password}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, password: e.target.value })
                }
                className="h-11"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateEmployee}
              disabled={submitting}
              className="bg-roast hover:bg-roast/90 text-white"
            >
              {submitting && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Create Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Roles Dialog */}
      <Dialog open={isRolesDialogOpen} onOpenChange={setIsRolesDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage User Roles</DialogTitle>
            <DialogDescription>
              Update roles for{" "}
              {selectedUser?.fullName || selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="mb-3 block">Select Roles</Label>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {availableRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50"
                >
                  <Checkbox
                    id={role.id}
                    checked={selectedRoleIds.includes(role.id)}
                    onCheckedChange={() => handleRoleToggle(role.id)}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={role.id}
                      className="font-medium cursor-pointer"
                    >
                      {role.name}
                    </Label>
                    {role.description && (
                      <p className="text-sm text-slate-500">
                        {role.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRolesDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveRoles} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Roles"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {userDetails && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-4">
                {userDetails.avatar ? (
                  <img
                    src={userDetails.avatar}
                    alt={userDetails.fullName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                    <Users className="w-8 h-8 text-slate-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">
                    {userDetails.fullName}
                  </h3>
                  <p className="text-slate-500">@{userDetails.username}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500">Email</Label>
                  <p className="font-medium">{userDetails.email}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Phone</Label>
                  <p className="font-medium">{userDetails.phone || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Status</Label>
                  <Badge className={getStatusColor(userDetails.status)}>
                    {userDetails.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-slate-500">Roles</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {userDetails.roles?.map((role, i) => (
                      <Badge key={i} variant="secondary">
                        {role.replace("ROLE_", "")}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-slate-500">Created At</Label>
                  <p className="font-medium">
                    {userDetails.createdAt
                      ? new Date(userDetails.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-500">Updated At</Label>
                  <p className="font-medium">
                    {userDetails.updatedAt
                      ? new Date(userDetails.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUserDetailsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
