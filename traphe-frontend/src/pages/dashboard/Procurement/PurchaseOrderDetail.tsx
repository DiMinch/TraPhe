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
  Check,
  Package,
  Calendar,
  Building2,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  purchaseOrderService,
  type PurchaseOrderResponse,
  type PurchaseOrderItemResponse,
} from "@/services/purchase-order.service";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";
import { toast } from "sonner";

export default function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [purchaseOrder, setPurchaseOrder] =
    useState<PurchaseOrderResponse | null>(null);

  useEffect(() => {
    if (id) {
      fetchPurchaseOrder();
    }
  }, [id]);

  const fetchPurchaseOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await purchaseOrderService.getPurchaseOrderById(id);
      setPurchaseOrder(response.data);
    } catch (error: any) {
      console.error("Error fetching purchase order:", error);
      toast.error(
        error.response?.data?.message || "Failed to load purchase order",
      );
      navigate("/procurement/purchase-orders");
    } finally {
      setLoading(false);
    }
  };

  const handleClosePurchaseOrder = async () => {
    if (!purchaseOrder) return;

    setIsClosing(true);
    try {
      const response = await purchaseOrderService.closePurchaseOrder(
        purchaseOrder.id,
      );
      setPurchaseOrder(response.data);
      toast.success("Purchase order closed successfully");
    } catch (error: any) {
      console.error("Error closing purchase order:", error);
      toast.error(
        error.response?.data?.message || "Failed to close purchase order",
      );
    } finally {
      setIsClosing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!purchaseOrder) return;

    try {
      await purchaseOrderService.deletePurchaseOrder(purchaseOrder.id);
      toast.success("Purchase order deleted successfully");
      navigate("/procurement/purchase-orders");
    } catch (error: any) {
      console.error("Error deleting purchase order:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete purchase order",
      );
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

  const getItemName = (item: PurchaseOrderItemResponse) => {
    if (item.productVariant) {
      return `${item.productVariant.productName} - ${item.productVariant.variantName}`;
    }
    if (item.partComponent) {
      return item.partComponent.partName;
    }
    return "Unknown Item";
  };

  const getItemSku = (item: PurchaseOrderItemResponse) => {
    if (item.productVariant) {
      return item.productVariant.sku;
    }
    if (item.partComponent) {
      return item.partComponent.partNumber;
    }
    return "-";
  };

  // Calculate totals
  const totalQuantityOrdered =
    purchaseOrder?.items.reduce((sum, item) => sum + item.quantityOrdered, 0) ||
    0;
  const totalQuantityReceived =
    purchaseOrder?.items.reduce(
      (sum, item) => sum + item.quantityReceived,
      0,
    ) || 0;
  const totalAmount = purchaseOrder?.totalAmount || 0;

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  if (!purchaseOrder) {
    return (
      <PageContainer>
        <EmptyState
          icon={<FileText className="w-8 h-8 text-slate-400" />}
          title="Purchase order not found"
          description="The purchase order you're looking for doesn't exist or has been deleted."
          action={
            <Button onClick={() => navigate("/procurement/purchase-orders")}>
              Back to Purchase Orders
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
        title="Purchase Order Detail"
        subtitle={`PO Number: ${purchaseOrder.poNumber}`}
        onRefresh={fetchPurchaseOrder}
        isLoading={loading}
      >
        <Button
          variant="outline"
          onClick={() => navigate("/procurement/purchase-orders")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </PageHeader>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        {purchaseOrder.status === "RECEIVED" && (
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleClosePurchaseOrder}
            disabled={isClosing}
          >
            {isClosing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Close Purchase Order
          </Button>
        )}
        {purchaseOrder.status === "DRAFT" && (
          <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        )}
      </div>

      {/* Order Information Card */}
      <Card className="shadow-md mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-6">Order Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  PO Number
                </Label>
                <p className="mt-1 text-lg font-semibold">
                  {purchaseOrder.poNumber}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Status
                </Label>
                <div className="mt-1">
                  {getStatusBadge(purchaseOrder.status)}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Supplier
                </Label>
                <p className="mt-1 font-medium">
                  {purchaseOrder.supplier?.name || "-"}
                </p>
                {purchaseOrder.supplier?.contactName && (
                  <p className="text-sm text-gray-500">
                    Contact: {purchaseOrder.supplier.contactName}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Total Amount
                </Label>
                <p className="mt-1 text-lg font-semibold text-green-600">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Created Date
                </Label>
                <p className="mt-1">{formatDate(purchaseOrder.createdAt)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Expected Delivery
                </Label>
                <p className="mt-1">
                  {formatDate(purchaseOrder.expectedDeliveryDate)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Actual Delivery
                </Label>
                <p className="mt-1">
                  {formatDate(purchaseOrder.actualDeliveryDate)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items Card */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">
              Order Items ({purchaseOrder.items?.length || 0})
            </h2>
          </div>

          {!purchaseOrder.items || purchaseOrder.items.length === 0 ? (
            <EmptyState
              icon={<Package className="w-8 h-8 text-slate-400" />}
              title="No items"
              description="This purchase order doesn't have any items."
            />
          ) : (
            <>
              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Product / Component</TableHead>
                      <TableHead>SKU / Part Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Qty Ordered</TableHead>
                      <TableHead className="text-right">Qty Received</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {getItemName(item)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {getItemSku(item)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              item.itemType === "PRODUCT"
                                ? "border-blue-200 text-blue-700"
                                : "border-orange-200 text-orange-700"
                            }
                          >
                            {item.itemType === "PRODUCT" ? "Product" : "Part"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantityOrdered}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantityReceived}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mt-6">
                <div className="w-72 space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Total Qty Ordered:
                    </span>
                    <span className="font-medium">{totalQuantityOrdered}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Total Qty Received:
                    </span>
                    <span className="font-medium">{totalQuantityReceived}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Total Amount:
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete purchase order #
              {purchaseOrder.poNumber}? This action cannot be undone.
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
