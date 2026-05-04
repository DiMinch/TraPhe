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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Edit,
  Trash2,
  MoreHorizontal,
  BellIcon,
  ChevronRight,
  Save,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { CURRENT_USER } from "@/constants/user";

interface PurchaseOrder {
  id: number;
  poNumber: number;
  createdDate: string;
  expectedDate: string;
  actualDate: string;
  totalAmount: string;
  status: "CLOSED" | "PENDING" | "COMPLETED";
}

export default function SupplierDetailPage() {
  // const { supplierName } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [supplierData, setSupplierData] = useState({
    name: "ABC",
    status: "Active",
    contactName: "Nguyen Van A",
    phone: "+84 972 188 755",
    email: "nguyenvana@abc.gmai",
    province: "",
    district: "",
    commune: "",
    street: "",
  });

  const purchaseHistory: PurchaseOrder[] = [
    {
      id: 1,
      poNumber: 1,
      createdDate: "23/11/2024",
      expectedDate: "23/12/2024",
      actualDate: "23/11/2025",
      totalAmount: "$ 100,000",
      status: "CLOSED",
    },
  ];

  const handleSave = () => {
    console.log("Saving supplier changes...");
    setIsEditing(false);
  };

  const handleDelete = () => {
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    // Handle delete logic here
    console.log("Deleting supplier:", supplierData.name);
    setIsDeleteOpen(false);
    navigate("/procurement/suppliers");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Supplier Detail</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome {CURRENT_USER.role} {CURRENT_USER.name}
          </span>
          <Button variant="outline" size="icon">
            <BellIcon className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            CN
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
        <button
          onClick={() => navigate("/procurement/suppliers")}
          className="hover:text-gray-900"
        >
          Suppliers
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{supplierData.name}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        {isEditing ? (
          <Button
            className="bg-indigo-900 hover:bg-indigo-800 text-white"
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        ) : (
          <Button
            className="bg-indigo-900 hover:bg-indigo-800 text-white"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
        <Button
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>

      {/* Supplier Information Card */}
      <Card className="shadow-md mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Name
                </Label>
                <Input
                  value={supplierData.name}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setSupplierData({ ...supplierData, name: e.target.value })
                  }
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Status
                </Label>
                <Select
                  value={supplierData.status}
                  disabled={!isEditing}
                  onValueChange={(value) =>
                    setSupplierData({ ...supplierData, status: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Contact Name
                </Label>
                <Input
                  value={supplierData.contactName}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setSupplierData({
                      ...supplierData,
                      contactName: e.target.value,
                    })
                  }
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Phone
                </Label>
                <Input
                  value={supplierData.phone}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setSupplierData({ ...supplierData, phone: e.target.value })
                  }
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  value={supplierData.email}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setSupplierData({ ...supplierData, email: e.target.value })
                  }
                  className="mt-1 bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="mt-6">
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Address
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Province"
                value={supplierData.province}
                disabled={!isEditing}
                onChange={(e) =>
                  setSupplierData({ ...supplierData, province: e.target.value })
                }
                className="bg-gray-50"
              />
              <Input
                placeholder="District"
                value={supplierData.district}
                disabled={!isEditing}
                onChange={(e) =>
                  setSupplierData({ ...supplierData, district: e.target.value })
                }
                className="bg-gray-50"
              />
              <Input
                placeholder="Commune"
                value={supplierData.commune}
                disabled={!isEditing}
                onChange={(e) =>
                  setSupplierData({ ...supplierData, commune: e.target.value })
                }
                className="bg-gray-50"
              />
              <Input
                placeholder="Street"
                value={supplierData.street}
                disabled={!isEditing}
                onChange={(e) =>
                  setSupplierData({ ...supplierData, street: e.target.value })
                }
                className="bg-gray-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase History Card */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-6">Purchase History</h2>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>PO Number</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Expected Date</TableHead>
                <TableHead>Actual Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseHistory.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">{po.poNumber}</TableCell>
                  <TableCell className="text-gray-700">
                    {po.createdDate}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {po.expectedDate}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {po.actualDate}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {po.totalAmount}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        po.status === "CLOSED"
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
                          : po.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                            : "bg-green-100 text-green-700 hover:bg-green-100"
                      }
                    >
                      {po.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete supplier "{supplierData.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
