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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Search,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Loader2,
  CalendarIcon,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { orderService, type OrderResponse } from "@/services/order.service";
import { toast } from "sonner";
import {
  PageContainer,
  PageHeader,
  PageError,
  EmptyState,
} from "@/components/layout/PageLayout";
import type { DateRange } from "react-day-picker";

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  phone: string;
  orderType: string;
  date: string;
  rawDate: Date;
  totalAmount: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
}

export default function OrdersPage() {
  const navigate = useNavigate();
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 10;

  // Transform backend response to frontend format
  const transformOrder = (o: OrderResponse): Order => {
    const createdDate = o.createdAt ? new Date(o.createdAt) : new Date();
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.customer?.fullName || o.guestName || "Guest",
      phone: o.customer?.phone || o.guestPhone || "N/A",
      orderType: o.orderType,
      date: createdDate.toLocaleDateString("en-GB"),
      rawDate: createdDate,
      totalAmount: `${o.finalAmount?.toLocaleString() || 0}đ`,
      status: o.status as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED",
    };
  };

  // Fetch orders with server-side pagination and filtering
  const fetchOrders = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      setError(null);
      try {
        const response = await orderService.getAllOrders({
          page: page - 1, // Backend uses 0-indexed pages
          size: itemsPerPage,
          status: statusFilter !== "all-status" ? statusFilter : undefined,
          orderType: typeFilter !== "all-type" ? typeFilter : undefined,
          startDate: dateRange?.from
            ? format(dateRange.from, "yyyy-MM-dd")
            : undefined,
          endDate: dateRange?.to
            ? format(dateRange.to, "yyyy-MM-dd")
            : undefined,
          sort: "createdAt,desc",
        });

        const pageData = response.data;
        const transformedData = (pageData.content || []).map(transformOrder);

        setOrders(transformedData);
        setTotalPages(pageData.totalPages || 1);
        setTotalElements(pageData.totalElements || 0);
        setCurrentPage(page);
      } catch (err: unknown) {
        const error = err as {
          response?: { status?: number; data?: { message?: string } };
        };
        console.error("Error fetching orders:", err);
        if (error.response?.status === 401) {
          setError("Authentication required. Please sign in.");
        } else if (error.response?.status === 403) {
          setError("You don't have permission to view orders.");
        } else if (error.response?.status === 404) {
          setError("Orders endpoint not found. Please contact support.");
        } else {
          setError(
            error.response?.data?.message ||
              "Failed to fetch orders. The API endpoint may not be available.",
          );
        }
        toast.error(error.response?.data?.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, typeFilter, dateRange, itemsPerPage],
  );

  // Fetch orders on mount and when filters change
  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchOrders(page);
    }
  };

  // Handle search with debounce (client-side filter since backend may not support search)
  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(term) ||
      order.customer.toLowerCase().includes(term) ||
      order.phone.includes(searchTerm)
    );
  });

  const handleDeleteClick = (order: { id: string; orderNumber: string }) => {
    setOrderToDelete(order);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (orderToDelete) {
      try {
        await orderService.deleteOrder(orderToDelete.id);
        toast.success("Order deleted successfully");
        setIsDeleteDialogOpen(false);
        setOrderToDelete(null);
        fetchOrders(currentPage);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        console.error("Error deleting order:", err);
        toast.error(error.response?.data?.message || "Failed to delete order");
      }
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    try {
      await orderService.confirmOrder(orderId);
      toast.success("Order confirmed successfully");
      fetchOrders(currentPage);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Error confirming order:", err);
      toast.error(error.response?.data?.message || "Failed to confirm order");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;

    try {
      await orderService.cancelOrder(orderId, reason);
      toast.success("Order cancelled successfully");
      fetchOrders(currentPage);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Error canceling order:", err);
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Order List"
        subtitle="Manage and track all customer orders"
        onRefresh={() => fetchOrders(currentPage)}
        isLoading={loading}
      />

      {/* Error Display */}
      {error && <PageError message={error} onRetry={() => fetchOrders(1)} />}

      {/* Main Card */}
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 p-5 bg-gradient-to-r from-slate-50/80 to-white border-b border-slate-100">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search orders..."
                className="pl-10 bg-white border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 rounded-xl h-11 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[260px] justify-start text-left font-normal border-slate-200 bg-white hover:bg-slate-50 rounded-xl h-11 shadow-sm"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    <span className="text-slate-400">Pick date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 rounded-xl shadow-xl"
                align="start"
              >
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  className="rounded-xl"
                />
                <div className="p-3 border-t flex justify-end bg-slate-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDateRange(undefined)}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    Clear
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px] border-slate-200 bg-white rounded-xl h-11 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all-type">All Types</SelectItem>
                <SelectItem value="OFFLINE">Offline</SelectItem>
                <SelectItem value="ONLINE_COD">Online COD</SelectItem>
                <SelectItem value="ONLINE_TRANSFER">Online Transfer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] border-slate-200 bg-white rounded-xl h-11 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all-status">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="p-5">
            {loading ? (
              <div className="flex flex-col items-center bg-white justify-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 animate-pulse"></div>
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <span className="mt-4 text-slate-500 font-medium">
                  Loading orders...
                </span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <EmptyState
                icon={<ShoppingCart className="w-10 h-10 text-slate-400" />}
                title="No orders found"
                description="Try adjusting your search or filter criteria"
              />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200/60">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/50 hover:bg-slate-50 border-b border-slate-200">
                      <TableHead className="font-semibold text-slate-700 py-4">
                        Order No.
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Customer
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Order Type
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Total Amount
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Created Date
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Status
                      </TableHead>
                      <TableHead className="text-center font-semibold text-slate-700">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="border-slate-100 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-indigo-50/30 transition-all duration-200"
                      >
                        <TableCell className="py-4">
                          <Badge
                            variant="outline"
                            className="font-mono bg-slate-50 border-slate-200 px-3 py-1"
                          >
                            {order.orderNumber}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-semibold text-slate-800">
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
                            className="bg-indigo-50 text-indigo-700 border-0 font-medium"
                          >
                            {order.orderType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-slate-800">
                          {order.totalAmount}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {order.date}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`font-medium px-3 py-1 ${
                              order.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                : order.status === "CONFIRMED"
                                  ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                  : order.status === "PENDING"
                                    ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                    : "bg-red-100 text-red-700 hover:bg-red-100"
                            }`}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                              title="View details"
                              onClick={() =>
                                navigate(`/sales/orders/${order.id}`)
                              }
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {order.status === "PENDING" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
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
                                className="h-9 w-9 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                                onClick={() => handleCancelOrder(order.id)}
                                title="Cancel order"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-colors"
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
          </div>

          {/* Pagination */}
          {!loading && totalElements > 0 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, totalElements)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {totalElements}
                </span>{" "}
                orders
              </p>
              <Pagination>
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={`rounded-lg hover:bg-slate-100 ${
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }`}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                    // Show first 5, last 5, or range around current page
                    let pageNum: number;
                    if (totalPages <= 10) {
                      pageNum = i + 1;
                    } else if (currentPage <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 4) {
                      pageNum = totalPages - 9 + i;
                    } else {
                      pageNum = currentPage - 4 + i;
                    }
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className={`cursor-pointer rounded-lg ${
                            currentPage === pageNum
                              ? "bg-indigo-600 text-white hover:bg-indigo-700 border-0"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={`rounded-lg hover:bg-slate-100 ${
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
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
