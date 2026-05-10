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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Download, Edit, Trash2, Shield, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { adminService, type Role } from "@/services/admin.service";
import { toast } from "sonner";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";

interface Permission {
  id: string;
  name: string;
  description: string;
  checked: boolean;
}

interface PermissionModule {
  name: string;
  permissions: Permission[];
}

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [rolePermissions, setRolePermissions] = useState<
    Record<string, PermissionModule[]>
  >({});

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllRoles();

      if (response.success && response.data) {
        setRoles(response.data);
        // Initialize permissions for each role
        const initialPermissions: Record<string, PermissionModule[]> = {};
        response.data.forEach((role) => {
          initialPermissions[role.id] = getDefaultPermissions();
        });
        setRolePermissions(initialPermissions);
        toast.success("Roles loaded successfully");
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

  const getDefaultPermissions = (): PermissionModule[] => {
    return [
      {
        name: "User Management",
        permissions: [
          {
            id: "user.view",
            name: "View Users",
            description: "Can view user list and details",
            checked: false,
          },
          {
            id: "user.create",
            name: "Create Users",
            description: "Can create new users",
            checked: false,
          },
          {
            id: "user.edit",
            name: "Edit Users",
            description: "Can edit user information",
            checked: false,
          },
          {
            id: "user.delete",
            name: "Delete Users",
            description: "Can delete users",
            checked: false,
          },
        ],
      },
      {
        name: "Product Management",
        permissions: [
          {
            id: "product.view",
            name: "View Products",
            description: "Can view product list",
            checked: false,
          },
          {
            id: "product.create",
            name: "Create Products",
            description: "Can create new products",
            checked: false,
          },
          {
            id: "product.edit",
            name: "Edit Products",
            description: "Can edit product information",
            checked: false,
          },
          {
            id: "product.delete",
            name: "Delete Products",
            description: "Can delete products",
            checked: false,
          },
        ],
      },
      {
        name: "Order Management",
        permissions: [
          {
            id: "order.view",
            name: "View Orders",
            description: "Can view order list",
            checked: false,
          },
          {
            id: "order.manage",
            name: "Manage Orders",
            description: "Can update order status",
            checked: false,
          },
          {
            id: "order.cancel",
            name: "Cancel Orders",
            description: "Can cancel orders",
            checked: false,
          },
        ],
      },
    ];
  };

  const permissionModules = selectedRole
    ? rolePermissions[selectedRole] || getDefaultPermissions()
    : [];

  const handlePermissionToggle = (
    moduleIndex: number,
    permissionId: string,
  ) => {
    if (!selectedRole) return;
    const updatedModules = [...permissionModules];
    const permission = updatedModules[moduleIndex].permissions.find(
      (p) => p.id === permissionId,
    );
    if (permission) {
      permission.checked = !permission.checked;
      setRolePermissions({
        ...rolePermissions,
        [selectedRole]: updatedModules,
      });
      toast.success("Permission updated (Note: Backend integration pending)");
    }
  };

  const handleDeleteClick = (role: { id: string; name: string }) => {
    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (roleToDelete) {
      toast.info("Role deletion - Backend endpoint not yet available");
      setIsDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Manage user roles and their access permissions"
        onRefresh={fetchRoles}
      />

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg">
          <Plus className="mr-2 w-4 h-4" />
          New User
        </Button>
        <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg">
          <Plus className="mr-2 w-4 h-4" />
          Import CSV
        </Button>
        <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg">
          <Download className="mr-2 w-4 h-4" />
          Bulk Update
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role List */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-800">
              Role List
            </CardTitle>
            <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white h-8">
              <Plus className="mr-1 w-4 h-4" />
              New Role
            </Button>
          </CardHeader>
          <CardContent className="p-0 pl-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
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
                        selectedRole === role.id ? "bg-indigo-50" : ""
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
                            className="h-7 w-7 hover:bg-slate-100"
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

        {/* Permissions */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-800">
              Permissions
            </CardTitle>
            <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white h-8">
              <Plus className="mr-1 w-4 h-4" />
              New Permission
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {permissionModules.map((module, moduleIndex) => (
              <div key={module.name} className="bg-slate-50/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-slate-800">
                  {module.name}
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-slate-200">
                      <TableHead className="w-[80px] font-semibold text-slate-600">
                        Enable
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600">
                        Permission
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600">
                        Description
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {module.permissions.map((permission) => (
                      <TableRow
                        key={permission.id}
                        className="hover:bg-white/50"
                      >
                        <TableCell>
                          <Checkbox
                            checked={permission.checked}
                            onCheckedChange={() =>
                              handlePermissionToggle(moduleIndex, permission.id)
                            }
                            className="border-slate-300"
                          />
                        </TableCell>
                        <TableCell className="text-sm font-medium text-slate-700">
                          {permission.name}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {permission.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
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
    </PageContainer>
  );
}
