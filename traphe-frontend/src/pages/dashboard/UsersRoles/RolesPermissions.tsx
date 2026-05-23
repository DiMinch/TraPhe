import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  Loader2,
  Users,
  ChevronRight,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Clipboard,
  ChartBar,
  Tag,
  Settings,
  UserCog,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import {
  roleService,
  type Role,
  type UserInRole,
} from "@/services/role.service";
import { toast } from "sonner";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";
import { UserRole } from "@/enums/roles.enum";

// Page access configuration for each role
interface PageAccess {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  subPages?: { title: string; path: string }[];
}

// Define all available pages with their allowed roles
const allPages: (PageAccess & { allowedRoles: UserRole[] })[] = [
  {
    title: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    allowedRoles: [
      UserRole.ADMIN,
      UserRole.EMPLOYEE,
      UserRole.CASHIER,
      UserRole.ACCOUNTANT,
    ],
  },
  {
    title: "Menu",
    path: "/admin/menu",
    icon: Package,
    allowedRoles: [UserRole.ADMIN, UserRole.EMPLOYEE],
    subPages: [
      { title: "Sản phẩm", path: "/admin/menu/items" },
      { title: "Topping", path: "/admin/menu/toppings" },
      { title: "Danh mục", path: "/admin/menu/categories" },
      { title: "Menu chi nhánh", path: "/admin/menu/branch" },
    ],
  },
  {
    title: "Kho hàng",
    path: "/admin/stock",
    icon: ShoppingCart,
    allowedRoles: [UserRole.ADMIN, UserRole.EMPLOYEE],
    subPages: [
      { title: "Tổng quan", path: "/admin/stock" },
      { title: "Tồn kho", path: "/admin/stock/all" },
      { title: "Lịch sử­", path: "/admin/stock/history" },
    ],
  },
  {
    title: "NhÃ  cung cáº¥p",
    path: "/admin/suppliers",
    icon: Clipboard,
    allowedRoles: [UserRole.ADMIN, UserRole.EMPLOYEE],
    subPages: [
      { title: "Danh sÃ¡ch NCC", path: "/admin/suppliers" },
      { title: "ÄÆ¡n mua hÃ ng", path: "/admin/suppliers/purchase-orders" },
    ],
  },
  {
    title: "ÄÆ¡n hÃ ng",
    path: "/admin/orders",
    icon: ChartBar,
    allowedRoles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CASHIER],
    subPages: [
      { title: "POS", path: "/admin/orders/pos" },
      { title: "Táº¥t cáº£ Ä‘Æ¡n", path: "/admin/orders" },
    ],
  },
  {
    title: "KhÃ¡ch hÃ ng",
    path: "/admin/loyalty/customers",
    icon: Users,
    allowedRoles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CASHIER],
    subPages: [
      { title: "Danh sÃ¡ch KH", path: "/admin/loyalty/customers" },
      { title: "Háº¡ng thÃ nh viÃªn", path: "/admin/loyalty/tiers" },
    ],
  },
  {
    title: "Khuyáº¿n mÃ£i",
    path: "/admin/promotions",
    icon: Tag,
    allowedRoles: [UserRole.ADMIN],
  },
  {
    title: "BÃ¡o cÃ¡o",
    path: "/admin/reports",
    icon: BarChart3,
    allowedRoles: [UserRole.ADMIN, UserRole.ACCOUNTANT],
    subPages: [
      { title: "Doanh thu", path: "/admin/reports/revenue" },
      { title: "Lá»£i nhuáº­n", path: "/admin/reports/profit" },
      { title: "MÃ³n bÃ¡n cháº¡y", path: "/admin/reports/products" },
      { title: "Tá»“n kho", path: "/admin/reports/inventory" },
    ],
  },
  {
    title: "CÃ i Ä‘áº·t",
    path: "/admin/settings",
    icon: Settings,
    allowedRoles: [UserRole.ADMIN],
    subPages: [{ title: "Cáº¥u hÃ¬nh", path: "/admin/settings" }],
  },
  {
    title: "NhÃ¢n sá»±",
    path: "/admin/staff",
    icon: UserCog,
    allowedRoles: [UserRole.ADMIN],
    subPages: [
      { title: "TÃ i khoáº£n NV", path: "/admin/staff" },
      { title: "Vai trÃ² & Quyá»n", path: "/admin/staff/roles" },
    ],
  },
  {
    title: "Nháº­t kÃ½",
    path: "/admin/settings/audit-log",
    icon: ClipboardList,
    allowedRoles: [UserRole.ADMIN],
  },
];

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // New Role Dialog State
  const [isNewRoleDialogOpen, setIsNewRoleDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");

  // Edit Role Dialog State
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [editRoleDescription, setEditRoleDescription] = useState("");

  // Users in Role Dialog State
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [usersInRole, setUsersInRole] = useState<UserInRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await roleService.getAllRolesNoPagination();

      if (response.statusCode === 200 && response.data) {
        // Handle both direct array and paginated response
        const rolesData = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.content || [];
        setRoles(rolesData);
      } else {
        toast.error("Failed to load roles");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to load roles from server");
    } finally {
      setLoading(false);
    }
  };

  // Get the UserRole enum value from role name
  const getRoleEnum = (roleName: string): UserRole | null => {
    const roleMap: Record<string, UserRole> = {
      ROLE_ADMIN: UserRole.ADMIN,
      ROLE_EMPLOYEE: UserRole.EMPLOYEE,
      ROLE_CASHIER: UserRole.CASHIER,
      ROLE_ACCOUNTANT: UserRole.ACCOUNTANT,
      ROLE_CUSTOMER: UserRole.CUSTOMER,
    };
    return roleMap[roleName] || null;
  };

  // Get accessible pages for selected role
  const accessiblePages = useMemo(() => {
    if (!selectedRole) return [];
    const role = roles.find((r) => r.id === selectedRole);
    if (!role) return [];

    const roleEnum = getRoleEnum(role.name);
    if (!roleEnum) return [];

    return allPages.filter((page) => page.allowedRoles.includes(roleEnum));
  }, [selectedRole, roles]);

  const handleDeleteClick = (role: { id: string; name: string }) => {
    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;

    try {
      setSubmitting(true);
      await roleService.deleteRole(roleToDelete.id);
      toast.success(`Role "${roleToDelete.name}" deleted successfully`);
      setIsDeleteDialogOpen(false);
      setRoleToDelete(null);
      if (selectedRole === roleToDelete.id) {
        setSelectedRole(null);
      }
      await fetchRoles();
    } catch (error: any) {
      console.error("Error deleting role:", error);
      const errorMsg = error.response?.data?.message || "Failed to delete role";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Create new role
  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    try {
      setSubmitting(true);
      // Check if role name exists
      const existsResponse = await roleService.checkRoleExists(newRoleName);
      if (existsResponse.data === true) {
        toast.error("A role with this name already exists");
        return;
      }

      await roleService.createRole({
        name: newRoleName.trim(),
        description: newRoleDescription.trim() || undefined,
      });
      toast.success(`Role "${newRoleName}" created successfully`);
      setIsNewRoleDialogOpen(false);
      setNewRoleName("");
      setNewRoleDescription("");
      await fetchRoles();
    } catch (error: any) {
      console.error("Error creating role:", error);
      const errorMsg = error.response?.data?.message || "Failed to create role";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit role handlers
  const handleEditClick = (role: Role, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRole(role);
    setEditRoleName(role.name);
    setEditRoleDescription(role.description || "");
    setIsEditRoleDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;
    if (!editRoleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    try {
      setSubmitting(true);
      // Check if name changed and new name exists
      if (editRoleName.trim() !== editingRole.name) {
        const existsResponse = await roleService.checkRoleExists(editRoleName);
        if (existsResponse.data === true) {
          toast.error("A role with this name already exists");
          return;
        }
      }

      await roleService.updateRole(editingRole.id, {
        name: editRoleName.trim(),
        description: editRoleDescription.trim() || undefined,
      });
      toast.success(`Role updated successfully`);
      setIsEditRoleDialogOpen(false);
      setEditingRole(null);
      await fetchRoles();
    } catch (error: any) {
      console.error("Error updating role:", error);
      const errorMsg = error.response?.data?.message || "Failed to update role";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // View users in role
  const handleViewUsers = async (role: Role, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRole(role);
    setIsUsersDialogOpen(true);
    try {
      setLoadingUsers(true);
      const response = await roleService.getUsersByRole(role.id);
      const usersData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.content || [];
      setUsersInRole(usersData);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users for this role");
      setUsersInRole([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Manage user roles and their page access"
        onRefresh={fetchRoles}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role List */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-800">
              Role List
            </CardTitle>
            <Button
              onClick={() => setIsNewRoleDialogOpen(true)}
              className="bg-gradient-to-r from-roast to-roast/90 hover:from-roast/90 hover:to-roast/80 text-white h-8"
            >
              <Plus className="mr-1 w-4 h-4" />
              New Role
            </Button>
          </CardHeader>
          <CardContent className="p-0 pl-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                  <TableHead className="font-semibold text-slate-600">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Description
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10">
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="mt-2 text-gray-500">
                          Loading roles...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10">
                      <EmptyState
                        icon={<Shield className="w-8 h-8 text-slate-400" />}
                        title="No roles found"
                        description="Create your first role to manage permissions"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow
                      key={role.id}
                      className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                        selectedRole === role.id ? "bg-roast/10" : ""
                      }`}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      <TableCell className="font-medium text-slate-800">
                        {role.name}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {role.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-blue-50"
                            onClick={(e) => handleViewUsers(role, e)}
                            title="View users"
                          >
                            <Users className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-slate-100"
                            onClick={(e) => handleEditClick(role, e)}
                            title="Edit role"
                          >
                            <Edit className="w-4 h-4 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick({
                                id: role.id,
                                name: role.name,
                              });
                            }}
                            title="Delete role"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Page Access */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-800">
              Page Access
            </CardTitle>
            {selectedRole && (
              <span className="text-sm text-slate-500">
                {accessiblePages.length} pages accessible
              </span>
            )}
          </CardHeader>
          <CardContent className="p-4">
            {!selectedRole ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Shield className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm">
                  Select a role to view accessible pages
                </p>
              </div>
            ) : accessiblePages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Shield className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm">
                  No page access configured for this role
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {accessiblePages.map((page) => {
                  const IconComponent = page.icon;
                  return (
                    <div
                      key={page.path}
                      className="bg-slate-50/80 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-roast/20 rounded-lg">
                          <IconComponent className="w-4 h-4 text-roast" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 text-sm">
                            {page.title}
                          </p>
                          <p className="text-xs text-slate-500">{page.path}</p>
                        </div>
                        <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Accessible
                        </div>
                      </div>
                      {page.subPages && page.subPages.length > 0 && (
                        <div className="mt-2 ml-11 space-y-1">
                          {page.subPages.map((subPage) => (
                            <div
                              key={subPage.path}
                              className="flex items-center gap-2 text-sm text-slate-600 py-1"
                            >
                              <ChevronRight className="w-3 h-3 text-slate-400" />
                              <span>{subPage.title}</span>
                              <span className="text-xs text-slate-400">
                                {subPage.path}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={roleToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
        contextMessage="role"
      />

      {/* New Role Dialog */}
      <Dialog open={isNewRoleDialogOpen} onOpenChange={setIsNewRoleDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Add a new role to manage user permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="roleName">Role Name *</Label>
              <Input
                id="roleName"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g., MANAGER, SALES_STAFF"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="roleDescription">Description</Label>
              <Textarea
                id="roleDescription"
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                placeholder="Describe the role's responsibilities..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewRoleDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRole} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Role"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog
        open={isEditRoleDialogOpen}
        onOpenChange={setIsEditRoleDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update the role name and description.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editRoleName">Role Name *</Label>
              <Input
                id="editRoleName"
                value={editRoleName}
                onChange={(e) => setEditRoleName(e.target.value)}
                placeholder="e.g., MANAGER, SALES_STAFF"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editRoleDescription">Description</Label>
              <Textarea
                id="editRoleDescription"
                value={editRoleDescription}
                onChange={(e) => setEditRoleDescription(e.target.value)}
                placeholder="Describe the role's responsibilities..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditRoleDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Users in Role Dialog */}
      <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Users with "{editingRole?.name}" Role</DialogTitle>
            <DialogDescription>
              List of users assigned to this role.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loadingUsers ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="mt-2 text-gray-500">Loading users...</span>
              </div>
            ) : usersInRole.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No users assigned to this role</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersInRole.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.fullName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {user.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUsersDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
