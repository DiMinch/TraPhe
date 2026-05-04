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
import {
  Plus,
  Download,
  Edit,
  Trash2,
  MoreHorizontal,
  BellIcon,
} from "lucide-react";
import { useState } from "react";
import { CURRENT_USER } from "@/constants/user";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { dashboardRolePermissions, dashboardRoles } from "@/data/mockData";

interface Role {
  id: number;
  name: string;
  permissions: string;
}

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
  const [selectedRole, setSelectedRole] = useState<number>(
    dashboardRoles[0]?.id ?? 1,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [rolePermissions, setRolePermissions] = useState<
    Record<number, PermissionModule[]>
  >(dashboardRolePermissions);

  const roles: Role[] = dashboardRoles;

  const permissionModules = rolePermissions[selectedRole] || [];

  const handlePermissionToggle = (
    moduleIndex: number,
    permissionId: string,
  ) => {
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
    }
  };

  const handleDeleteClick = (role: { id: number; name: string }) => {
    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (roleToDelete) {
      // In a real app, you would delete the role from the list
      // For now, just close the dialog
      setIsDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Roles & Permissions</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome {CURRENT_USER.role} {CURRENT_USER.name}
          </span>
          <Button variant="outline" size="icon">
            <BellIcon />
          </Button>
          <Button variant="outline" size="sm">
            CN
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        <Button className="bg-indigo-900 hover:bg-indigo-800 text-white">
          <Plus className="mr-2" />
          New User
        </Button>
        <Button className="bg-indigo-900 hover:bg-indigo-800 text-white">
          <Plus className="mr-2" />
          Import CSV
        </Button>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <Download className="mr-2" />
          Bulk Update
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-2 gap-6">
        {/* Role List */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Role List</CardTitle>
            <Button className="bg-indigo-900 hover:bg-indigo-800 text-white h-8">
              <Plus className="mr-1" />
              New Role
            </Button>
          </CardHeader>
          <CardContent className="p-0 pl-4 ">
            <Table className="">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Name</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow
                    key={role.id}
                    className={`cursor-pointer ${
                      selectedRole === role.id ? "bg-gray-100" : ""
                    }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="text-gray-600">
                      {role.permissions}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Edit />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick({
                              id: role.id,
                              name: role.name,
                            });
                          }}
                        >
                          <Trash2 />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Role List (Permissions) */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Role List</CardTitle>
            <Button className="bg-indigo-900 hover:bg-indigo-800 text-white h-8">
              <Plus className="mr-1" />
              New Permission
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {permissionModules.map((module, moduleIndex) => (
              <div key={module.name}>
                <h3 className="font-semibold mb-3">{module.name}</h3>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[100px]">Checkbox</TableHead>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Role Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {module.permissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <Checkbox
                            checked={permission.checked}
                            onCheckedChange={() =>
                              handlePermissionToggle(moduleIndex, permission.id)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {permission.name}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
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
    </div>
  );
}
