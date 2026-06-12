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
import { userService } from "@/services/user.service";
import type { Province, Commune } from "@/types/user.types";
import { toast } from "sonner";

interface SearchableSelectProps<T> {
  value: string;
  onChange: (value: string) => void;
  options: T[];
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;
  placeholder: string;
  disabled?: boolean;
}

function SearchableSelect<T>({
  value,
  onChange,
  options,
  getOptionValue,
  getOptionLabel,
  placeholder,
  disabled = false,
}: SearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedOption = options.find((opt) => getOptionValue(opt) === value);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm(selectedOption ? getOptionLabel(selectedOption) : "");
    }
  }, [isOpen, selectedOption, options]);

  const cleanVietnameseName = (name: string): string => {
    if (!name) return "";
    let cleaned = name.trim();
    const prefixes = [
      /^(tỉnh|thành phố|thành\s*phố)\s+/i,
      /^(phường|xã|thị trấn|thị\s*trấn)\s+/i
    ];
    for (const regex of prefixes) {
      cleaned = cleaned.replace(regex, "");
    }
    return cleaned
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");
  };

  const filteredOptions = options.filter((option) => {
    if (!searchTerm) return true;
    const cleanedLabel = cleanVietnameseName(getOptionLabel(option));
    const cleanedSearch = cleanVietnameseName(searchTerm);
    return cleanedLabel.includes(cleanedSearch);
  });

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          className="w-full flex h-10 w-full rounded-md border border-[#E2DDD7] bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5C3317] disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
        />
        {searchTerm && (
          <button
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            onClick={() => {
              setSearchTerm("");
              onChange("");
              setIsOpen(true);
            }}
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && !disabled && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-[#E2DDD7] bg-white text-stone-900 shadow-lg outline-none">
            <div className="p-1">
              {filteredOptions.length === 0 ? (
                <div className="relative flex w-full select-none items-center rounded-sm py-1.5 px-2 text-sm text-gray-400">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const val = getOptionValue(option);
                  const label = getOptionLabel(option);
                  const isSelected = val === value;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        onChange(val);
                        setSearchTerm(label);
                        setIsOpen(false);
                      }}
                      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors hover:bg-[#F5EAD8] hover:text-[#5C3317] ${
                        isSelected ? "bg-[#EFE5D3] text-[#5C3317] font-semibold" : ""
                      }`}
                    >
                      {label}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
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
  const transformSupplier = (
    s: SupplierResponse,
  ): Supplier => ({
    id: s.id,
    name: s.name || "",
    contactName: s.contact_name || "",
    phone: s.phone || "",
    email: s.email || "",
    address: s.address || "",
    status: s.isDeleted ? "Inactive" : "Active",
  });

  // Fetch suppliers from API
  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const suppliersResponse = await supplierService.getAllSuppliers();
      const suppliersData = Array.isArray(suppliersResponse.data)
        ? suppliersResponse.data
        : (suppliersResponse.data as any)?.content || [];
      const transformedData = suppliersData.map((s: SupplierResponse) =>
        transformSupplier(s),
      );
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
    provinceCode: "",
    commune: "",
    communeCode: "",
    street: "",
  });

  const [editSupplier, setEditSupplier] = useState({
    name: "",
    contactName: "",
    phone: "",
    email: "",
    status: "Active" as "Active" | "Inactive",
    province: "",
    provinceCode: "",
    commune: "",
    communeCode: "",
    street: "",
  });

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [newCommunes, setNewCommunes] = useState<Commune[]>([]);
  const [editCommunes, setEditCommunes] = useState<Commune[]>([]);
  const [isLoadingNewCommunes, setIsLoadingNewCommunes] = useState(false);
  const [isLoadingEditCommunes, setIsLoadingEditCommunes] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await userService.getProvinces();
        if (res.statusCode === 200 && res.data) {
          const provincesData = Array.isArray(res.data)
            ? res.data
            : (res.data as any)?.content || [];
          setProvinces(provincesData);
        }
      } catch (error) {
        console.error("Failed to load provinces", error);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch communes when newSupplier.provinceCode changes
  useEffect(() => {
    if (newSupplier.provinceCode) {
      const fetchCommunes = async () => {
        setIsLoadingNewCommunes(true);
        try {
          const res = await userService.getCommunes(newSupplier.provinceCode);
          if (res.statusCode === 200 && res.data) {
            const communesData = Array.isArray(res.data)
              ? res.data
              : (res.data as any)?.content || [];
            setNewCommunes(communesData);
          }
        } catch (error) {
          console.error("Failed to load communes", error);
        } finally {
          setIsLoadingNewCommunes(false);
        }
      };
      fetchCommunes();
    } else {
      setNewCommunes([]);
    }
  }, [newSupplier.provinceCode]);

  // Fetch communes when editSupplier.provinceCode changes
  useEffect(() => {
    if (editSupplier.provinceCode) {
      const fetchCommunes = async () => {
        setIsLoadingEditCommunes(true);
        try {
          const res = await userService.getCommunes(editSupplier.provinceCode);
          if (res.statusCode === 200 && res.data) {
            const communesData = Array.isArray(res.data)
              ? res.data
              : (res.data as any)?.content || [];
            setEditCommunes(communesData);
          }
        } catch (error) {
          console.error("Failed to load communes", error);
        } finally {
          setIsLoadingEditCommunes(false);
        }
      };
      fetchCommunes();
    } else {
      setEditCommunes([]);
    }
  }, [editSupplier.provinceCode]);

  const handleNewProvinceChange = (code: string) => {
    const selected = provinces.find((p) => String(p.code) === code);
    setNewSupplier((prev) => ({
      ...prev,
      provinceCode: code,
      province: selected ? selected.name : "",
      communeCode: "",
      commune: "",
    }));
  };

  const handleNewCommuneChange = (code: string) => {
    const selected = newCommunes.find((c) => String(c.code) === code);
    setNewSupplier((prev) => ({
      ...prev,
      communeCode: code,
      commune: selected ? selected.name : "",
    }));
  };

  const handleEditProvinceChange = (code: string) => {
    const selected = provinces.find((p) => String(p.code) === code);
    setEditSupplier((prev) => ({
      ...prev,
      provinceCode: code,
      province: selected ? selected.name : "",
      communeCode: "",
      commune: "",
    }));
  };

  const handleEditCommuneChange = (code: string) => {
    const selected = editCommunes.find((c) => String(c.code) === code);
    setEditSupplier((prev) => ({
      ...prev,
      communeCode: code,
      commune: selected ? selected.name : "",
    }));
  };

  const handleAddSupplier = async () => {
    if (
      !newSupplier.name ||
      !newSupplier.contactName ||
      !newSupplier.phone ||
      !newSupplier.email ||
      !newSupplier.street ||
      !newSupplier.provinceCode ||
      !newSupplier.communeCode
    ) {
      toast.warning("Please fill in all required fields (*)");
      return;
    }

    try {
      const request: SupplierRequest = {
        name: newSupplier.name,
        contact_name: newSupplier.contactName,
        phone: newSupplier.phone,
        email: newSupplier.email,
        address: [
          newSupplier.street,
          newSupplier.commune,
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
        provinceCode: "",
        commune: "",
        communeCode: "",
        street: "",
      });
      toast.success("Supplier created successfully");
      fetchSuppliers();
    } catch (err: any) {
      console.error("Error creating supplier:", err);
      toast.error(err.response?.data?.message || "Failed to create supplier");
    }
  };

  const handleEditClick = async (supplier: Supplier) => {
    setSupplierToEdit(supplier);
    // Parse address back to components (simple split by comma)
    const addressParts = supplier.address.split(", ").reverse();
    const isOldFormat = addressParts.length >= 4;
    const provName = addressParts[0] || "";
    const commName = isOldFormat ? (addressParts[2] || "") : (addressParts[1] || "");
    const streetName = isOldFormat ? (addressParts[3] || "") : (addressParts[2] || "");

    // Find province by name (case-insensitive, trimmed comparison)
    const matchedProvince = provinces.find(
      (p) => p.name.trim().toLowerCase() === provName.trim().toLowerCase()
    );

    let provCode = "";
    let commCode = "";
    let matchedCommunes: Commune[] = [];

    if (matchedProvince) {
      provCode = String(matchedProvince.code);
      // Fetch communes synchronously here so we can match the commune name
      try {
        setIsLoadingEditCommunes(true);
        const res = await userService.getCommunes(provCode);
        if (res.statusCode === 200 && res.data) {
          matchedCommunes = Array.isArray(res.data)
            ? res.data
            : (res.data as any)?.content || [];
          setEditCommunes(matchedCommunes);

          // Find commune by name
          const matchedCommune = matchedCommunes.find(
            (c) => c.name.trim().toLowerCase() === commName.trim().toLowerCase()
          );
          if (matchedCommune) {
            commCode = String(matchedCommune.code);
          }
        }
      } catch (error) {
        console.error("Failed to load communes for editing supplier", error);
      } finally {
        setIsLoadingEditCommunes(false);
      }
    }

    setEditSupplier({
      name: supplier.name,
      contactName: supplier.contactName,
      phone: supplier.phone,
      email: supplier.email,
      status: supplier.status,
      province: provName,
      provinceCode: provCode,
      commune: commName,
      communeCode: commCode,
      street: streetName,
    });
    setIsEditSupplierOpen(true);
  };

  const handleUpdateSupplier = async () => {
    if (!supplierToEdit) return;

    if (
      !editSupplier.name ||
      !editSupplier.contactName ||
      !editSupplier.phone ||
      !editSupplier.email ||
      !editSupplier.street ||
      !editSupplier.province ||
      !editSupplier.commune
    ) {
      toast.warning("Please fill in all required fields (*)");
      return;
    }

    try {
      const request: SupplierRequest = {
        name: editSupplier.name,
        contact_name: editSupplier.contactName,
        phone: editSupplier.phone,
        email: editSupplier.email,
        address: [
          editSupplier.street,
          editSupplier.commune,
          editSupplier.province,
        ]
          .filter(Boolean)
          .join(", "),
      };

      await supplierService.updateSupplier(supplierToEdit.id, request);
      setIsEditSupplierOpen(false);
      setSupplierToEdit(null);
      toast.success("Supplier updated successfully");
      fetchSuppliers();
    } catch (err: any) {
      console.error("Error updating supplier:", err);
      toast.error(err.response?.data?.message || "Failed to update supplier");
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
          className="bg-roast hover:bg-roast/90 text-white shadow-md transition-all duration-200"
          onClick={() => setIsNewSupplierOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Supplier
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
                      Tên NCC
                    </TableHead>
                    <TableHead className="w-[200px] font-semibold text-slate-600">
                      Người liên hệ
                    </TableHead>
                    <TableHead className="w-[150px] font-semibold text-slate-600">
                      Số điện thoại
                    </TableHead>
                    <TableHead className="w-[200px] font-semibold text-slate-600">
                      Email
                    </TableHead>
                    <TableHead className="w-[120px] font-semibold text-slate-600">
                      Trạng thái
                    </TableHead>
                    <TableHead className="w-[120px] text-center font-semibold text-slate-600">
                      Thác tác
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
                              navigate(`/admin/suppliers/${supplier.id}`)
                            }
                            className="font-medium text-roast hover:text-caramel hover:underline cursor-pointer"
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
                        <TableCell>
                          <Badge
                            className={
                              supplier.status === "Active"
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                            }
                          >
                            {supplier.status === "Active" ? "Hoạt động" : "Ngưng hợp tác"}
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
                        className={`cursor-pointer ${currentPage === page ? "bg-primary text-white hover:bg-primary/90" : "text-black"}`}
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

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Province / City *</Label>
                <SearchableSelect<Province>
                  value={newSupplier.provinceCode}
                  onChange={handleNewProvinceChange}
                  options={provinces}
                  getOptionValue={(p) => String(p.code)}
                  getOptionLabel={(p) => p.name}
                  placeholder="Search Province / City"
                />
              </div>
              <div className="space-y-2">
                <Label>Commune / Ward *</Label>
                <SearchableSelect<Commune>
                  value={newSupplier.communeCode}
                  onChange={handleNewCommuneChange}
                  options={newCommunes}
                  getOptionValue={(c) => String(c.code)}
                  getOptionLabel={(c) => c.name}
                  placeholder={isLoadingNewCommunes ? "Loading..." : "Search Commune / Ward"}
                  disabled={!newSupplier.provinceCode || isLoadingNewCommunes}
                />
              </div>
              <div className="space-y-2">
                <Label>Street Address *</Label>
                <Input
                  placeholder="Số nhà, Tên đường"
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
              className="bg-roast hover:bg-roast/90 text-white transition-all duration-200"
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

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Province / City *</Label>
                <SearchableSelect<Province>
                  value={editSupplier.provinceCode}
                  onChange={handleEditProvinceChange}
                  options={provinces}
                  getOptionValue={(p) => String(p.code)}
                  getOptionLabel={(p) => p.name}
                  placeholder="Search Province / City"
                />
              </div>
              <div className="space-y-2">
                <Label>Commune / Ward *</Label>
                <SearchableSelect<Commune>
                  value={editSupplier.communeCode}
                  onChange={handleEditCommuneChange}
                  options={editCommunes}
                  getOptionValue={(c) => String(c.code)}
                  getOptionLabel={(c) => c.name}
                  placeholder={isLoadingEditCommunes ? "Loading..." : "Search Commune / Ward"}
                  disabled={!editSupplier.provinceCode || isLoadingEditCommunes}
                />
              </div>
              <div className="space-y-2">
                <Label>Street Address *</Label>
                <Input
                  placeholder="Số nhà, Tên đường"
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
              className="bg-roast hover:bg-roast/90 text-white transition-all duration-200"
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
