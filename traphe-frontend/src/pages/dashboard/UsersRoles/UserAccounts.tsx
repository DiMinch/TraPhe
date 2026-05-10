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
  Download,
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
  type UserAccount,
  type Role,
} from "@/services/admin.service";
import { roleService } from "@/services/role.service";
import { toast } from "sonner";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";

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

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, roleFilter, userAccounts]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers();
      if (response.data) {
        // Handle both direct array and paginated response
        const usersData = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.content || [];
        setUserAccounts(usersData);
        setFilteredUsers(usersData);
      }
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to load users";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
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
      console.error("Error fetching roles:", error);
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
        setUserDetails(response.data);
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

  return (
    <PageContainer>
      <PageHeader
        title="User Accounts"
        subtitle="Manage system users and their roles"
        onRefresh={fetchUsers}
      />

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-end gap-3 mb-6">
        <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md">
          <Plus className="mr-2 w-4 h-4" />
          New User
        </Button>
        <Button
          variant="outline"
          className="border-slate-200 hover:bg-slate-50"
        >
          <Plus className="mr-2 w-4 h-4" />
          Import CSV
        </Button>
        <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md">
          <Download className="mr-2 w-4 h-4" />
          Bulk Update
        </Button>
      </div>

      {/* Main Card */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by name, email, or phone..."
                className="pl-10 border-slate-200 focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              className="shrink-0 border-slate-200 hover:bg-slate-50"
            >
              <Filter className="w-4 h-4" />
            </Button>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 border-slate-200">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40 border-slate-200">
                <SelectValue placeholder="All role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-role">All role</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <span className="mt-3 text-slate-500 font-medium">
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                    <TableHead className="font-semibold text-slate-600">
                      Name/Username
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Phone
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Email
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Role
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Status
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-600">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-slate-50 hover:bg-slate-50/50 transition-colors"
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
                              className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0"
                            >
                              {role.replace("ROLE_", "")}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={submitting}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
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
                              {user.status?.toUpperCase() !== "TERMINATED" && (
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
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-medium">
                  {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)}
                </span>{" "}
                of <span className="font-medium">{filteredUsers.length}</span>{" "}
                users
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      className={`hover:bg-slate-100 ${
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }`}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className={`cursor-pointer ${currentPage === page ? "bg-primary text-white hover:bg-primary/90" : ""}`}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      className={`hover:bg-slate-100 ${
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={userToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
        contextMessage="from the user accounts"
      />

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
