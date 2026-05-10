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
import {
  Search,
  Plus,
  Download,
  Edit,
  Trash2,
  Filter,
  Loader2,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { adminService, type UserAccount } from "@/services/admin.service";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [roleFilter, setRoleFilter] = useState("all-role");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
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
        setUserAccounts(response.data);
        setFilteredUsers(response.data);
      }
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to load users";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
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
      default:
        return "bg-slate-100 text-slate-700 hover:bg-slate-100 border-0";
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-600 hover:text-primary hover:bg-primary/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-600 hover:text-red-600 hover:bg-red-50"
                            onClick={() =>
                              handleDeleteClick({
                                id: user.id,
                                name: user.fullName || user.username,
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
    </PageContainer>
  );
}
