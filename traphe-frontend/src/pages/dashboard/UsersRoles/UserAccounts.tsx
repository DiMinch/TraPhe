import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  Search,
  Plus,
  Trash2,
  Filter,
  Loader2,
  Users,
  MoreHorizontal,
  UserCheck,
  UserX,
  Ban,
  Shield,
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
  PageHeader,
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
  }, [searchTerm, statusFilter, roleFilter, userAccounts]);

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

    setFilteredUsers(filtered);
    setCurrentPage(1);
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
      if (response.data) {
        setUserDetails(staffToUserAccount(response.data as any));
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
      <PageHeader
        title="User Accounts"
        subtitle="Manage system users and their roles"
        onRefresh={fetchUsers}
      />

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-end gap-3 mb-6">
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-roast hover:bg-roast/90 text-white shadow-md transition-all duration-200"
        >
          <Plus className="mr-2 w-4 h-4" />
          New User
        </Button>
      </div>

      {/* Main Card */}
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 p-6 bg-gradient-to-r from-slate-50/80 to-foam border-b border-slate-200/60">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by name, email, or phone..."
                className="pl-10 border-slate-200 focus:border-roast focus:ring-2 focus:ring-roast/20 rounded-lg h-10 bg-white shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              className="shrink-0 border-slate-200 hover:bg-white hover:border-roast rounded-lg h-10 w-10 shadow-sm transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
            </Button>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 border-slate-200 bg-white rounded-lg h-10 shadow-sm focus:border-roast focus:ring-2 focus:ring-roast/20">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                <SelectItem value="all-status">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-44 border-slate-200 bg-white rounded-lg h-10 shadow-sm focus:border-roast focus:ring-2 focus:ring-roast/20">
                <SelectValue placeholder="All role" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                <SelectItem value="all-role">All role</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="branch_manager">Branch Manager</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
                <SelectItem value="barista">Barista</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-6">
            {/* Table */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-foam to-mist flex items-center justify-center animate-pulse">
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
              <div className="rounded-xl border border-slate-200/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/50">
                      <TableHead className="font-semibold text-slate-700">
                        Name/Username
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Phone
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Email
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Role
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Chi nhánh
                      </TableHead>
                      <TableHead className="text-center font-semibold text-slate-700">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        className="border-slate-100 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-foam/30 transition-all duration-200"
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-800">
                              {user.fullName || "N/A"}
                            </div>
                            <div className="text-sm text-slate-500">
                              {user.username}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {user.phone || "N/A"}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles?.map((role, index) => (
                              <Badge
                                key={index}
                                className="bg-foam text-primary hover:bg-foam border-0 rounded-full px-3"
                              >
                                {role.replace("ROLE_", "")}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`rounded-full px-3 ${getStatusColor(user.status)}`}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {user.branchName || <span className="text-slate-400">—</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-lg hover:bg-slate-100 transition-colors"
                                  disabled={submitting}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="rounded-xl border-slate-200 shadow-lg"
                              >
                                <DropdownMenuItem
                                  onClick={() => handleViewUser(user.id)}
                                >
                                  <Users className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditRoles(user)}
                                >
                                  <Shield className="w-4 h-4 mr-2" />
                                  Manage Roles
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.status?.toUpperCase() !== "ACTIVE" && (
                                  <DropdownMenuItem
                                    onClick={() => handleActivateUser(user.id)}
                                    className="text-green-600"
                                  >
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Activate
                                  </DropdownMenuItem>
                                )}
                                {user.status?.toUpperCase() !== "SUSPENDED" && (
                                  <DropdownMenuItem
                                    onClick={() => handleSuspendUser(user.id)}
                                    className="text-yellow-600"
                                  >
                                    <UserX className="w-4 h-4 mr-2" />
                                    Suspend
                                  </DropdownMenuItem>
                                )}
                                {user.status?.toUpperCase() !==
                                  "TERMINATED" && (
                                  <DropdownMenuItem
                                    onClick={() => handleTerminateUser(user.id)}
                                    className="text-red-600"
                                  >
                                    <Ban className="w-4 h-4 mr-2" />
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
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {filteredUsers.length > 0 && (
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200/60">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-medium text-slate-700">
                    {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-slate-700">
                    {filteredUsers.length}
                  </span>{" "}
                  users
                </p>
                <Pagination>
                  <PaginationContent className="gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        className={`rounded-lg transition-colors ${
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer hover:bg-slate-100"
                        }`}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className={`cursor-pointer rounded-lg transition-all duration-200 ${currentPage === page ? "bg-roast text-white hover:bg-roast/90 shadow-md" : "text-slate-700 hover:bg-slate-100"}`}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1),
                          )
                        }
                        className={`rounded-lg transition-colors ${
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer hover:bg-slate-100"
                        }`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
