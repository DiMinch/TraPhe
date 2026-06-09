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
  purchaseOrderService,
  type PurchaseOrderResponse,
} from "@/services/purchase-order.service";
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
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderResponse[]>(
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
      const [supplierRes, posRes] = await Promise.all([
        supplierService.getSupplierById(id!),
        purchaseOrderService.getAllPurchaseOrders({ supplierId: id }),
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

      // Filter POs for this supplier
      const posData = Array.isArray(posRes.data)
        ? posRes.data
        : (posRes.data as any)?.content || [];
      const filteredPOs = posData.filter(
        (po: PurchaseOrderResponse) => po.supplier?.id === id,
      );
      setPurchaseOrders(filteredPOs);
    } catch (error: any) {
      console.error("Error fetching supplier:", error);
      toast.error(error.response?.data?.message || "Failed to load supplier");
      navigate("/procurement/suppliers");
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
      navigate("/procurement/suppliers");
    } catch (error: any) {
      console.error("Error deleting supplier:", error);
      toast.error(error.response?.data?.message || "Failed to delete supplier");
    } finally {
      setIsDeleteOpen(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            Draft
          </Badge>
        );
      case "RECEIVED":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Received
          </Badge>
        );
      case "CLOSED":
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            Closed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Pagination
  const totalPages = Math.ceil(purchaseOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPOs = purchaseOrders.slice(
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
            <Button onClick={() => navigate("/procurement/suppliers")}>
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
          onClick={() => navigate("/procurement/suppliers")}
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
              className="bg-indigo-900 hover:bg-indigo-800 text-white"
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
              className="bg-indigo-900 hover:bg-indigo-800 text-white"
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
              Purchase Orders ({purchaseOrders.length})
            </h2>
          </div>

          {purchaseOrders.length === 0 ? (
            <EmptyState
              icon={<Building2 className="w-8 h-8 text-slate-400" />}
              title="No purchase orders"
              description="This supplier doesn't have any purchase orders yet."
            />
          ) : (
            <>
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
                  {currentPOs.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">
                        {po.poNumber}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {formatDate(po.createdAt)}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {formatDate(po.expectedDeliveryDate)}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {formatDate(po.actualDeliveryDate)}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {formatCurrency(po.totalAmount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(po.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/procurement/purchase-orders/${po.id}`)
                            }
                          >
                            View
                          </Button>
                        </div>
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
