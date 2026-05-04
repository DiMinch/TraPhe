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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Upload,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  BellIcon,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { CURRENT_USER } from "@/constants/user";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { dashboardSuppliers } from "@/data/mockData";

interface Supplier {
  id: number;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  totalPOs: number;
  status: "Active" | "Inactive";
}

export default function SuppliersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>(dashboardSuppliers);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter suppliers by search term
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone.includes(searchTerm) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSuppliers = filteredSuppliers.slice(startIndex, endIndex);

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contactName: "",
    phone: "",
    email: "",
    status: "Active" as "Active" | "Inactive",
    province: "",
    district: "",
    commune: "",
    street: "",
  });

  const handleAddSupplier = () => {
    const supplier: Supplier = {
      id: suppliers.length + 1,
      name: newSupplier.name,
      contactName: newSupplier.contactName,
      phone: newSupplier.phone,
      email: newSupplier.email,
      totalPOs: 0,
      status: newSupplier.status,
    };
    setSuppliers([...suppliers, supplier]);
    setIsNewSupplierOpen(false);
    setNewSupplier({
      name: "",
      contactName: "",
      phone: "",
      email: "",
      status: "Active",
      province: "",
      district: "",
      commune: "",
      street: "",
    });
  };

  const handleDeleteClick = (supplier: { id: number; name: string }) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (supplierToDelete) {
      setSuppliers(suppliers.filter((s) => s.id !== supplierToDelete.id));
      setIsDeleteDialogOpen(false);
      setSupplierToDelete(null);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Suppliers</h1>
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

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6 justify-end">
        <Button
          className="bg-indigo-900 hover:bg-indigo-800 text-white"
          onClick={() => setIsNewSupplierOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Supplier
        </Button>
        <Button className="bg-indigo-900 hover:bg-indigo-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Import CSV
        </Button>
        <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
          <Upload className="w-4 h-4 mr-2" />
          Bulk Update
        </Button>
      </div>

      {/* Main Card */}
      <Card className="shadow-md">
        <CardContent className="p-6 pt-0">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search"
                className="pl-10 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead className="w-[200px]">Contact Name</TableHead>
                <TableHead className="w-[150px]">Phone</TableHead>
                <TableHead className="w-[200px]">Email</TableHead>
                <TableHead className="w-[120px]">Total POs</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[120px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <button
                      onClick={() =>
                        navigate(`/procurement/suppliers/${supplier.name}`)
                      }
                      className="font-medium text-indigo-900 hover:underline cursor-pointer"
                    >
                      {supplier.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {supplier.contactName}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {supplier.phone}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {supplier.email}
                  </TableCell>
                  <TableCell className="text-center text-gray-700">
                    {supplier.totalPOs}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        supplier.status === "Active"
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                      }
                    >
                      {supplier.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleDeleteClick({
                            id: supplier.id,
                            name: supplier.name,
                          })
                        }
                      >
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
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
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
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* New Supplier Dialog */}
      <Dialog open={isNewSupplierOpen} onOpenChange={setIsNewSupplierOpen}>
        <DialogContent className="max-w-[700px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              New Supplier
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={newSupplier.name}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, name: e.target.value })
                  }
                  placeholder="Enter supplier name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Status *</Label>
                <Select
                  value={newSupplier.status}
                  onValueChange={(value: "Active" | "Inactive") =>
                    setNewSupplier({ ...newSupplier, status: value })
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Name *</Label>
                <Input
                  value={newSupplier.contactName}
                  onChange={(e) =>
                    setNewSupplier({
                      ...newSupplier,
                      contactName: e.target.value,
                    })
                  }
                  placeholder="Enter contact name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={newSupplier.phone}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Email *</Label>
              <Input
                value={newSupplier.email}
                onChange={(e) =>
                  setNewSupplier({ ...newSupplier, email: e.target.value })
                }
                placeholder="Enter email address"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="mb-2 block">Address</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Province"
                  value={newSupplier.province}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, province: e.target.value })
                  }
                />
                <Input
                  placeholder="District"
                  value={newSupplier.district}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, district: e.target.value })
                  }
                />
                <Input
                  placeholder="Commune"
                  value={newSupplier.commune}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, commune: e.target.value })
                  }
                />
                <Input
                  placeholder="Street"
                  value={newSupplier.street}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, street: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewSupplierOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-indigo-900 hover:bg-indigo-800 text-white"
              onClick={handleAddSupplier}
            >
              Add Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={supplierToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
        contextMessage="from the supplier list"
      />
    </div>
  );
}
