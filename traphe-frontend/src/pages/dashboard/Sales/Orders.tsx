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
import { Input } from "@/components/ui/input";
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
import {
  Search,
  Filter,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { orderService, type OrderResponse } from "@/services/order.service";
import {
  PageContainer,
  PageHeader,
  PageError,
  EmptyState,
} from "@/components/layout/PageLayout";

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  phone: string;
  orderType: string;
  date: string;
  totalAmount: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
}

export default function OrdersPage() {
  // const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<{
    id: string;
    orderNumber: string;
  } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [typeFilter, setTypeFilter] = useState("all-type");

  // Transform backend response to frontend format
  const transformOrder = (o: OrderResponse): Order => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customer: o.customer?.fullName || o.guestName || "Guest",
    phone: o.customer?.phone || o.guestPhone || "N/A",
    orderType: o.orderType,
    date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-GB") : "",
    totalAmount: `$${o.finalAmount?.toLocaleString() || 0}`,
    status: o.status as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED",
  });

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getAllOrders();
      const transformedData = (response.data.content || []).map(transformOrder);
      setOrders(transformedData);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      if (err.response?.status === 401) {
        setError("Authentication required. Please sign in.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to view orders.");
      } else {
        setError(err.response?.data?.message || "Failed to fetch orders");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all-status" ||
      order.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesType =
      typeFilter === "all-type" ||
      order.orderType.toLowerCase().includes(typeFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDeleteClick = (order: { id: string; orderNumber: string }) => {
    setOrderToDelete(order);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (orderToDelete) {
      try {
        await orderService.deleteOrder(orderToDelete.id);
        setIsDeleteDialogOpen(false);
        setOrderToDelete(null);
        fetchOrders();
      } catch (err: any) {
        console.error("Error deleting order:", err);
        alert(err.response?.data?.message || "Failed to delete order");
      }
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    try {
      await orderService.confirmOrder(orderId);
      fetchOrders();
    } catch (err: any) {
      console.error("Error confirming order:", err);
      alert(err.response?.data?.message || "Failed to confirm order");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;

    try {
      await orderService.cancelOrder(orderId, reason);
      fetchOrders();
    } catch (err: any) {
      console.error("Error canceling order:", err);
      alert(err.response?.data?.message || "Failed to cancel order");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Order List"
        subtitle="Manage and track all customer orders"
        onRefresh={fetchOrders}
        isLoading={loading}
      />

      {/* Error Display */}
      {error && <PageError message={error} onRetry={fetchOrders} />}

      {/* Main Card */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4 md:p-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search orders..."
                className="pl-10 bg-white border-slate-200 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              className="shrink-0 border-slate-200 hover:bg-slate-50"
            >
              <Filter className="w-4 h-4 text-slate-600" />
            </Button>

            <Select defaultValue="all-days">
              <SelectTrigger className="w-[130px] border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-days">All days</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px] border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-type">All type</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <span className="mt-3 text-slate-500 font-medium">
                Loading orders...
              </span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="w-8 h-8 text-slate-400" />}
              title="No orders found"
              description="Try adjusting your search or filter criteria"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                    <TableHead className="font-semibold text-slate-600">
                      Order No.
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Customer
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Order Type
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Total Amount
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Created Date
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
                  {filteredOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-mono bg-slate-50"
                        >
                          {order.orderNumber}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-slate-800">
                            {order.customer}
                          </div>
                          <div className="text-sm text-slate-500">
                            {order.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-700"
                        >
                          {order.orderType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-800">
                        {order.totalAmount}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {order.date}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            order.status === "COMPLETED"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : order.status === "CONFIRMED"
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                : order.status === "PENDING"
                                  ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                  : "bg-red-100 text-red-700 hover:bg-red-100"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-slate-100"
                            title="View details"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </Button>
                          {order.status === "PENDING" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-green-50 text-green-600"
                              onClick={() => handleConfirmOrder(order.id)}
                              title="Confirm order"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {(order.status === "PENDING" ||
                            order.status === "CONFIRMED") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-50 text-red-600"
                              onClick={() => handleCancelOrder(order.id)}
                              title="Cancel order"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50 text-slate-600 hover:text-red-600"
                            onClick={() =>
                              handleDeleteClick({
                                id: order.id,
                                orderNumber: order.orderNumber,
                              })
                            }
                            title="Delete order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium">{filteredOrders.length}</span>{" "}
              orders
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" className="hover:bg-slate-100" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" className="hover:bg-slate-100" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={`Order #${orderToDelete?.orderNumber || ""}`}
        onConfirm={handleDeleteConfirm}
        contextMessage="from the order list"
      />
    </PageContainer>
  );
}
