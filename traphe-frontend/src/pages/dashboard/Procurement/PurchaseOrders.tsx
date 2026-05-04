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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Edit,
  Trash2,
  Check,
  BellIcon,
  X,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import OrderItemsTable from "./OrderItemsTable";
import { format } from "date-fns";
import { CURRENT_USER } from "@/constants/user";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import {
  purchaseOrderService,
  type PurchaseOrderResponse,
  type PurchaseOrderRequest,
} from "@/services/purchase-order.service";
import {
  supplierService,
  type SupplierResponse,
} from "@/services/supplier.service";

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

interface OrderItem {
  id: number;
  productVariantId: string;
  product: string;
  sku: string;
  referenceTicket: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: string;
  subtotal: string;
  warrantyPeriod: number;
}

export default function PurchaseOrdersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
    totalAmount: po.totalAmount ? `$${po.totalAmount.toLocaleString()}` : "$0",
    status: po.status,
  });

  // Fetch purchase orders from API
  const fetchPurchaseOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await purchaseOrderService.getAllPurchaseOrders();
      const transformedData = response.data.map(transformPurchaseOrder);
      setPurchaseOrders(transformedData);
    } catch (err: any) {
      console.error("Error fetching purchase orders:", err);
      if (err.response?.status === 401) {
        setError("Authentication required. Please sign in.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to view purchase orders.");
      } else if (err.response?.status === 400) {
        setError(
          "Backend data error. Some purchase order items may have invalid data.",
        );
      } else {
        setError(
          err.response?.data?.message || "Failed to fetch purchase orders",
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
      setSuppliers(response.data);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPurchaseOrders();
    fetchSuppliers();
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

  const [newOrder, setNewOrder] = useState({
    supplierId: "",
    expectedDate: "",
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      id: 1,
      productVariantId: "",
      product: "",
      sku: "",
      referenceTicket: "",
      quantityOrdered: 0,
      quantityReceived: 0,
      unitPrice: "",
      subtotal: "",
      warrantyPeriod: 0,
    },
  ]);

  const handleAddItem = () => {
    const newItem: OrderItem = {
      id: orderItems.length + 1,
      productVariantId: "",
      product: "",
      sku: "",
      referenceTicket: "",
      quantityOrdered: 0,
      quantityReceived: 0,
      unitPrice: "",
      subtotal: "",
      warrantyPeriod: 0,
    };
    setOrderItems([...orderItems, newItem]);
  };

  const handleRemoveItem = (id: number) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  const handleItemChange = (
    id: number,
    field: keyof OrderItem,
    value: unknown,
  ) => {
    setOrderItems(
      orderItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleSaveDraft = async () => {
    try {
      // Validate
      if (!newOrder.supplierId) {
        alert("Please select a supplier");
        return;
      }
      if (orderItems.length === 0 || !orderItems[0].productVariantId) {
        alert("Please add at least one item");
        return;
      }

      const request: PurchaseOrderRequest = {
        supplierId: newOrder.supplierId,
        expectedDeliveryDate: newOrder.expectedDate || undefined,
        items: orderItems
          .filter((item) => item.productVariantId)
          .map((item) => ({
            productVariantId: item.productVariantId,
            quantityOrdered: item.quantityOrdered,
            unitPrice: parseFloat(item.unitPrice) || 0,
            warrantyPeriod: item.warrantyPeriod || 0,
            referenceTicketId: item.referenceTicket || undefined,
          })),
      };

      await purchaseOrderService.createPurchaseOrder(request);
      setIsNewOrderOpen(false);
      resetNewOrderForm();
      fetchPurchaseOrders();
    } catch (err: any) {
      console.error("Error creating purchase order:", err);
      alert(err.response?.data?.message || "Failed to create purchase order");
    }
  };

  const resetNewOrderForm = () => {
    setNewOrder({
      supplierId: "",
      expectedDate: "",
    });
    setOrderItems([
      {
        id: 1,
        productVariantId: "",
        product: "",
        sku: "",
        referenceTicket: "",
        quantityOrdered: 0,
        quantityReceived: 0,
        unitPrice: "",
        subtotal: "",
        warrantyPeriod: 0,
      },
    ]);
  };

  const handleMarkAsOrdered = () => {
    // For now, this just saves as draft since backend creates in DRAFT status
    handleSaveDraft();
  };

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
      } catch (err: any) {
        console.error("Error deleting purchase order:", err);
        alert(
          err.response?.data?.message ||
            "Failed to delete purchase order. Only DRAFT orders can be deleted.",
        );
      }
    }
  };

  const handleReceiveGoods = async (orderId: string) => {
    try {
      // For simplicity, receive all ordered quantities
      const order = purchaseOrders.find((po) => po.id === orderId);
      if (!order) return;

      // Get the full order details to get items
      const response = await purchaseOrderService.getPurchaseOrderById(orderId);
      const items = response.data.items
        .filter((item) => item.productVariant)
        .map((item) => ({
          productVariantId: item.productVariant!.id,
          quantityReceived: item.quantityOrdered,
        }));

      await purchaseOrderService.receiveGoods(orderId, { items });
      fetchPurchaseOrders();
    } catch (err: any) {
      console.error("Error receiving goods:", err);
      alert(err.response?.data?.message || "Failed to receive goods");
    }
  };

  const handleCloseOrder = async (orderId: string) => {
    try {
      await purchaseOrderService.closePurchaseOrder(orderId);
      fetchPurchaseOrders();
    } catch (err: any) {
      console.error("Error closing order:", err);
      alert(err.response?.data?.message || "Failed to close purchase order");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Purchase Orders</h1>
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

      {/* Action Button */}
      <div className="flex justify-end gap-3 mb-6">
        <Button
          variant="outline"
          onClick={fetchPurchaseOrders}
          disabled={loading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
        <Button
          className="bg-indigo-900 hover:bg-indigo-800 text-white"
          onClick={() => setIsNewOrderOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Purchase Order
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Main Card */}
      <Card className="shadow-md">
        <CardContent className="p-6 pt-0">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search"
                className="pl-10 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="w-4 h-4" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="shrink-0 h-9">
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
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="ml-2 text-gray-600">
                Loading purchase orders...
              </span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Expected Date</TableHead>
                  <TableHead>Actual Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-500"
                    >
                      No purchase orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentOrders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell>
                        <button
                          onClick={() =>
                            navigate(`/procurement/purchase-orders/${po.id}`)
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
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {po.status === "DRAFT" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleDeleteClick({
                                  id: po.id,
                                  poNumber: po.poNumber,
                                })
                              }
                              title="Delete (DRAFT only)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                          {po.status === "DRAFT" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600"
                              onClick={() => handleReceiveGoods(po.id)}
                              title="Receive Goods"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          {po.status === "RECEIVED" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600"
                              onClick={() => handleCloseOrder(po.id)}
                              title="Close Order"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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

      {/* New Purchase Order Dialog */}
      <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <DialogContent className="min-w-[90vw] max-h-[90vh] flex flex-col bg-white overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              New Product
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNewOrderOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto">
            {/* Order Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Supplier *
                </Label>
                <Select
                  value={newOrder.supplierId}
                  onValueChange={(value) =>
                    setNewOrder({ ...newOrder, supplierId: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Expected Delivery Date
                </Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="datetime-local"
                    value={newOrder.expectedDate}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, expectedDate: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <OrderItemsTable
              orderItems={orderItems}
              onItemChange={handleItemChange}
              onRemoveItem={handleRemoveItem}
              onAddItem={handleAddItem}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsNewOrderOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-indigo-900 hover:bg-indigo-800 text-white"
                onClick={handleSaveDraft}
              >
                Save Draft
              </Button>
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                onClick={handleMarkAsOrdered}
              >
                Mark as Ordered
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={`PO #${orderToDelete?.poNumber || ""}`}
        onConfirm={handleDeleteConfirm}
        contextMessage="from the purchase orders"
      />
    </div>
  );
}
