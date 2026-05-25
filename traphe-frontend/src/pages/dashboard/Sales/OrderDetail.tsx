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
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Package,
  User,
  Phone,
  CreditCard,
  Calendar,
  Hash,
  Printer,
  ShoppingBag,
  Gift,
  Star,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { orderService, type OrderResponse } from "@/services/order.service";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";
import { toast } from "sonner";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [order, setOrder] = useState<OrderResponse | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await orderService.getOrderById(id);
      setOrder(response.data);
    } catch (error: any) {
      console.error("Error fetching order:", error);
      toast.error(error.response?.data?.message || "Failed to load order");
      navigate("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!order) return;

    setIsProcessing(true);
    try {
      const response = await orderService.confirmOrder(order.orderId);
      setOrder(response.data);
      toast.success("Order confirmed successfully");
    } catch (error: any) {
      console.error("Error confirming order:", error);
      toast.error(error.response?.data?.message || "Failed to confirm order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteOrder = async () => {
    if (!order) return;

    setIsProcessing(true);
    try {
      const response = await orderService.updateOrderStatus(
        order.orderId,
        "COMPLETED",
      );
      setOrder(response.data);
      toast.success("Order completed successfully");
    } catch (error: any) {
      console.error("Error completing order:", error);
      toast.error(error.response?.data?.message || "Failed to complete order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !cancelReason.trim()) {
      toast.error("Please enter a cancellation reason");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await orderService.cancelOrder(order.orderId);
      setOrder(response.data);
      toast.success("Order cancelled successfully");
      setIsCancelOpen(false);
      setCancelReason("");
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!order) return;

    setIsProcessing(true);
    try {
      await orderService.deleteOrder(order.orderId);
      toast.success("Order deleted successfully");
      navigate("/admin/orders");
    } catch (error: any) {
      console.error("Error deleting order:", error);
      toast.error(error.response?.data?.message || "Failed to delete order");
    } finally {
      setIsProcessing(false);
      setIsDeleteOpen(false);
    }
  };



  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "0đ";
    return `${amount.toLocaleString()}đ`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Confirmed
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            Cancelled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getOrderTypeBadge = (orderType: string) => {
    switch (orderType) {
      case "OFFLINE":
        return (
          <Badge
            variant="outline"
            className="border-roast/30 text-roast/90"
          >
            In-Store
          </Badge>
        );
      case "ONLINE_COD":
        return (
          <Badge
            variant="outline"
            className="border-orange-300 text-orange-700"
          >
            Online (COD)
          </Badge>
        );
      case "ONLINE_TRANSFER":
        return (
          <Badge
            variant="outline"
            className="border-emerald-300 text-emerald-700"
          >
            Online (Transfer)
          </Badge>
        );
      default:
        return <Badge variant="outline">{orderType}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "CASH":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Cash
          </Badge>
        );
      case "TRANSFER":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Bank Transfer
          </Badge>
        );
      case "COD":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            Cash on Delivery
          </Badge>
        );
      default:
        return <Badge variant="secondary">{method}</Badge>;
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer>
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-slate-400" />}
          title="Order not found"
          description="The order you're looking for doesn't exist or has been deleted."
          action={
            <Button onClick={() => navigate("/admin/orders")}>
              Back to Orders
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
        title="Order Detail"
        subtitle={`Order: ${order.orderNumber}`}
        onRefresh={fetchOrder}
        isLoading={loading}
      >
        <Button
          variant="outline"
          onClick={() => navigate("/admin/orders")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </PageHeader>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-end gap-3 mb-6">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>

        {order.status === "PENDING" && (
          <>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleConfirmOrder}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Confirm Order
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsCancelOpen(true)}
              disabled={isProcessing}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Order
            </Button>
          </>
        )}

        {order.status === "CONFIRMED" && (
          <>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleCompleteOrder}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Complete Order
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsCancelOpen(true)}
              disabled={isProcessing}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Order
            </Button>
          </>
        )}

        {order.status === "CANCELLED" && (
          <Button
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
            disabled={isProcessing}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Order
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Order Information */}
        <Card className="shadow-md lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-roast" />
              Order Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Order Number
                  </Label>
                  <p className="mt-1 text-lg font-semibold font-mono">
                    {order.orderNumber}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Status
                  </Label>
                  <div className="mt-1">{getStatusBadge(order.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Order Type
                  </Label>
                  <div className="mt-1">
                    {getOrderTypeBadge(order.orderType)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    Payment Method
                  </Label>
                  <div className="mt-1">
                    {getPaymentMethodBadge(order.paymentMethod || "N/A")}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Created At
                  </Label>
                  <p className="mt-1">{formatDate(order.createdAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-roast" />
              Customer
            </h2>
            {order.customerId || order.customerName ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Name
                  </Label>
                  <p className="mt-1 font-medium">{order.customerName || "Anonymous Customer"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Phone
                  </Label>
                  <p className="mt-1">{order.customerPhone || "N/A"}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Badge variant="secondary">Guest Customer</Badge>
                <p className="text-sm text-gray-500">No customer information registered for this transaction.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card className="shadow-md mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-roast" />
              Order Items ({order.items.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Menu Item</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Options / Toppings</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-gray-500">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.menuItemName}</p>
                        {item.notes && (
                          <p className="text-xs text-gray-400 italic mt-1">Note: {item.notes}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.sizeName ? (
                        <Badge variant="outline" className="bg-slate-50">
                          {item.sizeName}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {item.options && item.options.length > 0 && (
                          item.options.map((opt, oIdx) => (
                            <Badge key={`opt-${oIdx}`} variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                              {opt}
                            </Badge>
                          ))
                        )}
                        {item.toppings && item.toppings.length > 0 && (
                          item.toppings.map((top, tIdx) => (
                            <Badge key={`top-${tIdx}`} variant="secondary" className="text-xs bg-orange-50 text-orange-700">
                              +{top}
                            </Badge>
                          ))
                        )}
                        {(!item.options || item.options.length === 0) && (!item.toppings || item.toppings.length === 0) && (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(item.subtotal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="shadow-md mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
          <div className="max-w-md ml-auto space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>

            {order.totalDiscount > 0 && (
              <div className="flex justify-between text-red-600">
                <span className="flex items-center gap-1">
                  <Gift className="w-4 h-4" />
                  Discount
                </span>
                <span>-{formatCurrency(order.totalDiscount)}</span>
              </div>
            )}

            {order.loyaltyPointsUsed > 0 && (
              <div className="flex justify-between text-orange-600">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Points Used
                </span>
                <span>-{order.loyaltyPointsUsed} pts</span>
              </div>
            )}

            <div className="flex justify-between text-lg font-bold pt-3 border-t">
              <span>Total</span>
              <span className="text-green-600">
                {formatCurrency(order.finalAmount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Order Dialog */}
      <AlertDialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be
              undone. Please provide a reason for cancellation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <textarea
              className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-roast"
              rows={3}
              placeholder="Enter cancellation reason..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              disabled={isProcessing || !cancelReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Order Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be
              undone. All order data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Delete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
