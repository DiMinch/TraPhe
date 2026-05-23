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
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  Building2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  supplierService,
  type SupplierResponse,
  type SupplierRequest,
} from "@/services/supplier.service";
import {
  branchStockService,
  type StockTransactionResponse,
} from "@/services/branch-stock.service";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";
import { toast } from "sonner";

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [supplier, setSupplier] = useState<SupplierResponse | null>(null);
  const [transactions, setTransactions] = useState<StockTransactionResponse[]>(
    [],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form state for editing
  const [formData, setFormData] = useState({
    name: "",
    contact_name: "",
    phone: "",
    email: "",
    address: "",
  });

  // Fetch supplier and purchase orders
  useEffect(() => {
    if (id) {
      fetchSupplierData();
    }
  }, [id]);

  const fetchSupplierData = async () => {
    setLoading(true);
    try {
      const [supplierRes] = await Promise.all([
        supplierService.getSupplierById(id!),
      ]);

      const supplierData = supplierRes.data;
      setSupplier(supplierData);
      setFormData({
        name: supplierData.name || "",
        contact_name: supplierData.contact_name || "",
        phone: supplierData.phone || "",
        email: supplierData.email || "",
        address: supplierData.address || "",
      });

      // Fetch stock transactions for this supplier
      const txRes = await branchStockService.getTransactions({ referenceId: id, size: 100 });
      setTransactions(txRes.data?.content || []);
    } catch (error: any) {
      console.error("Error fetching supplier:", error);
      toast.error(error.response?.data?.message || "Failed to load supplier");
      navigate("/admin/suppliers");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    setSaving(true);
    try {
      const request: SupplierRequest = {
        name: formData.name,
        contact_name: formData.contact_name || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
      };

      const response = await supplierService.updateSupplier(id!, request);
      setSupplier(response.data);
      setIsEditing(false);
      toast.success("Supplier updated successfully");
    } catch (error: any) {
      console.error("Error updating supplier:", error);
      toast.error(error.response?.data?.message || "Failed to update supplier");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (supplier) {
      setFormData({
        name: supplier.name || "",
        contact_name: supplier.contact_name || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: supplier.address || "",
      });
    }
    setIsEditing(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await supplierService.deleteSupplier(id!);
      toast.success("Supplier deleted successfully");
      navigate("/admin/suppliers");
    } catch (error: any) {
      console.error("Error deleting supplier:", error);
      toast.error(error.response?.data?.message || "Failed to delete supplier");
    } finally {
      setIsDeleteOpen(false);
    }
  };



  const getTxTypeBadge = (type: string) => {
    switch (type) {
      case "IMPORT":
        return <Badge className="bg-emerald-100 text-emerald-700">Nhập kho</Badge>;
      case "RETURN":
        return <Badge className="bg-red-100 text-red-700">Trả hàng</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Pagination
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTxs = transactions.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  if (!supplier) {
    return (
      <PageContainer>
        <EmptyState
          icon={<Building2 className="w-8 h-8 text-slate-400" />}
          title="Supplier not found"
          description="The supplier you're looking for doesn't exist or has been deleted."
          action={
            <Button onClick={() => navigate("/admin/suppliers")}>
              Back to Suppliers
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Supplier Detail"
        subtitle={`View and manage supplier: ${supplier.name}`}
        onRefresh={fetchSupplierData}
        isLoading={loading}
      >
        <Button
          variant="outline"
          onClick={() => navigate("/admin/suppliers")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </PageHeader>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              className="bg-roast hover:bg-roast/90 text-white"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>
          </>
        ) : (
          <>
            <Button
              className="bg-roast hover:bg-roast/90 text-white"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </>
        )}
      </div>

      {/* Supplier Information Card */}
      <Card className="shadow-md mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-6">Supplier Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.name}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1"
                  placeholder="Enter supplier name"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Contact Name
                </Label>
                <Input
                  value={formData.contact_name}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_name: e.target.value })
                  }
                  className="mt-1"
                  placeholder="Enter contact name"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Phone
                </Label>
                <Input
                  value={formData.phone}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="mt-1"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Address
                </Label>
                <Input
                  value={formData.address}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="mt-1"
                  placeholder="Enter address"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Status
                </Label>
                <div className="mt-1">
                  <Badge
                    className={
                      supplier.isDeleted
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }
                  >
                    {supplier.isDeleted ? "Inactive" : "Active"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase History Card */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">
              Lịch sử nhập hàng ({transactions.length})
            </h2>
          </div>

          {transactions.length === 0 ? (
            <EmptyState
              icon={<Building2 className="w-8 h-8 text-slate-400" />}
              title="Không có lịch sử nhập hàng"
              description="Nhà cung cấp này chưa có đợt nhập hàng nào."
            />
          ) : (
            <>
              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Ngày nhập</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Nguyên liệu</TableHead>
                    <TableHead className="text-right">SL Tăng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTxs.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-gray-700">
                        {new Date(tx.createdAt).toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell>{getTxTypeBadge(tx.type)}</TableCell>
                      <TableCell className="font-medium">
                        {tx.ingredientName}
                      </TableCell>
                      <TableCell className="text-right font-medium text-emerald-600">
                        +{tx.quantityChange}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
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
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
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
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete supplier "{supplier.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
