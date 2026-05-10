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
  Loader2,
  Building2,
  MoreHorizontal,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import {
  supplierService,
  type SupplierResponse,
  type SupplierRequest,
} from "@/services/supplier.service";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";

interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  totalPOs: number;
  status: "Active" | "Inactive";
}

export default function SuppliersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  const [isEditSupplierOpen, setIsEditSupplierOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Transform backend response to frontend format
  const transformSupplier = (s: SupplierResponse): Supplier => ({
    id: s.id,
    name: s.name || "",
    contactName: s.contact_name || "",
    phone: s.phone || "",
    email: s.email || "",
    address: s.address || "",
    totalPOs: 0, // Backend doesn't provide this, could be calculated separately
    status: s.isDeleted ? "Inactive" : "Active",
  });

  // Fetch suppliers from API
  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await supplierService.getAllSuppliers();
      // Handle both direct array and paginated response
      const suppliersData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.content || [];
      const transformedData = suppliersData.map(transformSupplier);
      setSuppliers(transformedData);
    } catch (err: any) {
      console.error("Error fetching suppliers:", err);
      if (err.response?.status === 401) {
        setError("Authentication required. Please sign in.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to view suppliers.");
      } else {
        setError(err.response?.data?.message || "Failed to fetch suppliers");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch suppliers on component mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

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

  const [editSupplier, setEditSupplier] = useState({
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

  const handleAddSupplier = async () => {
    try {
      const request: SupplierRequest = {
        name: newSupplier.name,
        contact_name: newSupplier.contactName,
        phone: newSupplier.phone,
        email: newSupplier.email,
        address: [
          newSupplier.street,
          newSupplier.commune,
          newSupplier.district,
          newSupplier.province,
        ]
          .filter(Boolean)
          .join(", "),
      };

      await supplierService.createSupplier(request);
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
      // Refresh the list
      fetchSuppliers();
    } catch (err: any) {
      console.error("Error creating supplier:", err);
      alert(err.response?.data?.message || "Failed to create supplier");
    }
  };

  const handleEditClick = (supplier: Supplier) => {
    setSupplierToEdit(supplier);
    // Parse address back to components (simple split by comma)
    const addressParts = supplier.address.split(", ").reverse();
    setEditSupplier({
      name: supplier.name,
      contactName: supplier.contactName,
      phone: supplier.phone,
      email: supplier.email,
      status: supplier.status,
      province: addressParts[0] || "",
      district: addressParts[1] || "",
      commune: addressParts[2] || "",
      street: addressParts[3] || "",
    });
    setIsEditSupplierOpen(true);
  };

  const handleUpdateSupplier = async () => {
    if (!supplierToEdit) return;

    try {
      const request: SupplierRequest = {
        name: editSupplier.name,
        contact_name: editSupplier.contactName,
        phone: editSupplier.phone,
        email: editSupplier.email,
        address: [
          editSupplier.street,
          editSupplier.commune,
          editSupplier.district,
          editSupplier.province,
        ]
          .filter(Boolean)
          .join(", "),
      };

      await supplierService.updateSupplier(supplierToEdit.id, request);
      setIsEditSupplierOpen(false);
      setSupplierToEdit(null);
      // Refresh the list
      fetchSuppliers();
    } catch (err: any) {
      console.error("Error updating supplier:", err);
      alert(err.response?.data?.message || "Failed to update supplier");
    }
  };

  const handleDeleteClick = (supplier: { id: string; name: string }) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (supplierToDelete) {
      try {
        await supplierService.deleteSupplier(supplierToDelete.id);
        setIsDeleteDialogOpen(false);
        setSupplierToDelete(null);
        // Refresh the list
        fetchSuppliers();
      } catch (err: any) {
        console.error("Error deleting supplier:", err);
        alert(err.response?.data?.message || "Failed to delete supplier");
      }
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Suppliers"
        subtitle="Manage your supplier relationships"
        onRefresh={fetchSuppliers}
      />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6 justify-end">
        <Button
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md"
          onClick={() => setIsNewSupplierOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Supplier
        </Button>
        <Button
          variant="outline"
          className="border-slate-200 hover:bg-slate-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Import CSV
        </Button>
        <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md">
          <Upload className="w-4 h-4 mr-2" />
          Bulk Update
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Main Card */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, contact, phone, email..."
                className="pl-10 bg-white border-slate-200 focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <span className="mt-3 text-slate-500 font-medium">
                Loading suppliers...
              </span>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <EmptyState
              icon={<Building2 className="w-8 h-8 text-slate-400" />}
              title="No suppliers found"
              description="Add your first supplier to get started"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                    <TableHead className="w-[200px] font-semibold text-slate-600">
                      Name
                    </TableHead>
                    <TableHead className="w-[200px] font-semibold text-slate-600">
                      Contact Name
                    </TableHead>
                    <TableHead className="w-[150px] font-semibold text-slate-600">
                      Phone
                    </TableHead>
                    <TableHead className="w-[200px] font-semibold text-slate-600">
                      Email
                    </TableHead>
                    <TableHead className="w-[120px] font-semibold text-slate-600">
                      Total POs
                    </TableHead>
                    <TableHead className="w-[120px] font-semibold text-slate-600">
                      Status
                    </TableHead>
                    <TableHead className="w-[120px] text-center font-semibold text-slate-600">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        No suppliers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentSuppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell>
                          <button
                            onClick={() =>
                              navigate(`/procurement/suppliers/${supplier.id}`)
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditClick(supplier)}
                            >
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

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

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditSupplierOpen} onOpenChange={setIsEditSupplierOpen}>
        <DialogContent className="max-w-[700px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit Supplier
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={editSupplier.name}
                  onChange={(e) =>
                    setEditSupplier({ ...editSupplier, name: e.target.value })
                  }
                  placeholder="Enter supplier name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Status *</Label>
                <Select
                  value={editSupplier.status}
                  onValueChange={(value: "Active" | "Inactive") =>
                    setEditSupplier({ ...editSupplier, status: value })
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
                  value={editSupplier.contactName}
                  onChange={(e) =>
                    setEditSupplier({
                      ...editSupplier,
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
                  value={editSupplier.phone}
                  onChange={(e) =>
                    setEditSupplier({ ...editSupplier, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Email *</Label>
              <Input
                value={editSupplier.email}
                onChange={(e) =>
                  setEditSupplier({ ...editSupplier, email: e.target.value })
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
                  value={editSupplier.province}
                  onChange={(e) =>
                    setEditSupplier({
                      ...editSupplier,
                      province: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="District"
                  value={editSupplier.district}
                  onChange={(e) =>
                    setEditSupplier({
                      ...editSupplier,
                      district: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Commune"
                  value={editSupplier.commune}
                  onChange={(e) =>
                    setEditSupplier({
                      ...editSupplier,
                      commune: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Street"
                  value={editSupplier.street}
                  onChange={(e) =>
                    setEditSupplier({ ...editSupplier, street: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditSupplierOpen(false);
                setSupplierToEdit(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
              onClick={handleUpdateSupplier}
            >
              Save Changes
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
    </PageContainer>
  );
}
