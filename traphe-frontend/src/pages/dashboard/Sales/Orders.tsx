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
  BellIcon,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
// import { useNavigate } from "react-router";
import { CURRENT_USER } from "@/constants/user";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { orderService, type OrderResponse } from "@/services/order.service";

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
      const transformedData = response.data.map(transformOrder);
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Order List</h1>
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

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Main Card */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="outline"
              onClick={fetchOrders}
              disabled={loading}
              className="shrink-0"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

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

            <Select defaultValue="all-days">
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-days">All days</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-type">All type</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
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
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="ml-2 text-gray-600">Loading orders...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Order No.</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order Type</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-gray-700">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {order.customer}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                          {order.orderType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {order.totalAmount}
                      </TableCell>
                      <TableCell className="text-gray-700">
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
                                  ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                  : "bg-red-100 text-red-700 hover:bg-red-100"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {order.status === "PENDING" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600"
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
                              className="h-8 w-8 text-red-600"
                              onClick={() => handleCancelOrder(order.id)}
                              title="Cancel order"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
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

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={`Order #${orderToDelete?.orderNumber || ""}`}
        onConfirm={handleDeleteConfirm}
        contextMessage="from the order list"
      />
    </div>
  );
}
