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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Trash2,
  Loader2,
  ShoppingCart,
  PackageCheck,
  FileCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";
import {
  purchaseOrderService,
  type PurchaseOrderResponse,
} from "@/services/purchase-order.service";
import {
  supplierService,
  type SupplierResponse,
} from "@/services/supplier.service";
import CreatePurchaseOrderDialog from "./CreatePurchaseOrderDialog";
import ReceiveGoodsDialog from "./ReceiveGoodsDialog";

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier: string;
  contactName: string;
  createdDate: string;
  expectedDate: string;
  actualDate: string;
  totalAmount: string;
  status: "DRAFT" | "RECEIVED" | "CLOSED";
}

export default function PurchaseOrdersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPOForReceive, setSelectedPOForReceive] =
    useState<PurchaseOrderResponse | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<{
    id: string;
    poNumber: string;
  } | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [supplierFilter, setSupplierFilter] = useState("all-suppliers");
  const itemsPerPage = 8;

  // Transform backend response to frontend format
  const transformPurchaseOrder = (
    po: PurchaseOrderResponse,
  ): PurchaseOrder => ({
    id: po.id,
    poNumber: po.poNumber,
    supplierId: po.supplier?.id || "",
    supplier: po.supplier?.name || "N/A",
    contactName: po.supplier?.contactName || "",
    createdDate: po.createdAt
      ? new Date(po.createdAt).toLocaleDateString("en-GB")
      : "",
    expectedDate: po.expectedDeliveryDate
      ? new Date(po.expectedDeliveryDate).toLocaleDateString("en-GB")
      : "",
    actualDate: po.actualDeliveryDate
      ? new Date(po.actualDeliveryDate).toLocaleDateString("en-GB")
      : "",
    totalAmount: po.totalAmount ? `${po.totalAmount.toLocaleString()}đ` : "0đ",
    status: po.status,
  });

  // Fetch purchase orders from API
  const fetchPurchaseOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await purchaseOrderService.getAllPurchaseOrders();
      console.log("Fetch PO response:", response);

      // Backend returns PageResponse with content array
      const purchaseOrdersData = response.data?.content || [];

      console.log("Purchase orders data:", purchaseOrdersData);
      const transformedData = purchaseOrdersData.map(transformPurchaseOrder);

      // Sort by created date descending (newest first)
      transformedData.sort((a, b) => {
        const dateA = a.createdDate
          ? new Date(a.createdDate.split("/").reverse().join("-"))
          : new Date(0);
        const dateB = b.createdDate
          ? new Date(b.createdDate.split("/").reverse().join("-"))
          : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      console.log("Transformed data:", transformedData);
      setPurchaseOrders(transformedData);
    } catch (err: unknown) {
      const error = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      console.error("Error fetching purchase orders:", err);
      if (error.response?.status === 401) {
        setError("Authentication required. Please sign in.");
      } else if (error.response?.status === 403) {
        setError("You don't have permission to view purchase orders.");
      } else if (error.response?.status === 400) {
        setError(
          "Backend data error. Some purchase order items may have invalid data.",
        );
      } else {
        setError(
          error.response?.data?.message || "Failed to fetch purchase orders",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch suppliers for dropdown
  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getAllSuppliers();
      // Handle both direct array and paginated response
      const suppliersData = Array.isArray(response.data)
        ? response.data
        : (response.data as { content?: SupplierResponse[] })?.content || [];
      setSuppliers(suppliersData);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPurchaseOrders();
    fetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter purchase orders
  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch =
      order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.contactName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all-status" ||
      order.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesSupplier =
      supplierFilter === "all-suppliers" || order.supplierId === supplierFilter;

    return matchesSearch && matchesStatus && matchesSupplier;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handleDeleteClick = (order: { id: string; poNumber: string }) => {
    setOrderToDelete(order);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (orderToDelete) {
      try {
        await purchaseOrderService.deletePurchaseOrder(orderToDelete.id);
        setIsDeleteDialogOpen(false);
        setOrderToDelete(null);
        fetchPurchaseOrders();
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        console.error("Error deleting purchase order:", err);
        alert(
          error.response?.data?.message ||
            "Failed to delete purchase order. Only DRAFT orders can be deleted.",
        );
      }
    }
  };

  const handleReceiveGoods = async (orderId: string) => {
    try {
      // Get the full order details to show in dialog
      const response = await purchaseOrderService.getPurchaseOrderById(orderId);
      setSelectedPOForReceive(response.data);
      setIsReceiveDialogOpen(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Error loading purchase order:", err);
      alert(error.response?.data?.message || "Failed to load purchase order");
    }
  };

  const handleCloseOrder = async (orderId: string) => {
    try {
      await purchaseOrderService.closePurchaseOrder(orderId);
      fetchPurchaseOrders();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Error closing order:", err);
      alert(error.response?.data?.message || "Failed to close purchase order");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Purchase Orders"
        subtitle="Manage and track your purchase orders"
        onRefresh={fetchPurchaseOrders}
      />

      {/* Action Button */}
      <div className="flex justify-end gap-3 mb-6">
        <Button
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Purchase Order
        </Button>
      </div>

      {/* Dialogs */}
      <CreatePurchaseOrderDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchPurchaseOrders}
      />

      <ReceiveGoodsDialog
        open={isReceiveDialogOpen}
        onOpenChange={setIsReceiveDialogOpen}
        purchaseOrder={selectedPOForReceive}
        onSuccess={fetchPurchaseOrders}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        itemName={orderToDelete?.poNumber || "this purchase order"}
        contextMessage="from the purchase orders list"
      />

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm">
          {error}
        </div>
      )}

      {/* Main Card */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6 pt-0">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6 pt-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by PO number, supplier..."
                className="pl-10 bg-white border-slate-200"
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

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="shrink-0 h-9 border-slate-200 hover:bg-slate-50"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                        {format(dateRange.to, "MMM dd, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM dd, yyyy")
                    )
                  ) : (
                    "All days"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    setDateRange({
                      from: range?.from,
                      to: range?.to,
                    });
                  }}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-suppliers">All suppliers</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <span className="mt-3 text-gray-600">
                Loading purchase orders...
              </span>
            </div>
          ) : currentOrders.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="w-8 h-8 text-slate-400" />}
              title="No purchase orders found"
              description="Create a new purchase order to get started"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                  <TableHead className="font-semibold text-slate-600">
                    PO Number
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Supplier
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Created Date
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Expected Date
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Actual Date
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Total Amount
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
                {currentOrders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell>
                      <button
                        onClick={() =>
                          navigate(`/admin/suppliers/purchase-orders/${po.id}`)
                        }
                        className="font-medium text-indigo-900 hover:underline cursor-pointer"
                      >
                        {po.poNumber}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {po.supplier}
                        </div>
                        <div className="text-sm text-gray-500">
                          {po.contactName}
                        </div>
                      </div>
                    </TableCell>
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
                          po.status === "DRAFT"
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                            : po.status === "RECEIVED"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                        }
                      >
                        {po.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        {po.status === "DRAFT" && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              className="h-8 px-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                              onClick={() => handleReceiveGoods(po.id)}
                              title="Receive Goods"
                            >
                              <PackageCheck className="w-4 h-4 mr-1" />
                              Receive
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() =>
                                handleDeleteClick({
                                  id: po.id,
                                  poNumber: po.poNumber,
                                })
                              }
                              title="Delete Draft"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {po.status === "RECEIVED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 border-blue-300 text-blue-700 hover:bg-blue-50"
                            onClick={() => handleCloseOrder(po.id)}
                            title="Close Order"
                          >
                            <FileCheck className="w-4 h-4 mr-1" />
                            Close
                          </Button>
                        )}
                        {po.status === "CLOSED" && (
                          <span className="text-slate-400 text-sm">
                            Completed
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
    </PageContainer>
  );
}
