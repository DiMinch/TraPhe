import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar,
  Loader2,
  Plus,
  X,
  Package,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Barcode,
  Truck,
  ClipboardCheck,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  purchaseOrderService,
  type PurchaseOrderResponse,
  type ReceiveGoodsItemRequest,
} from "@/services/purchase-order.service";

interface ReceiveGoodsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder: PurchaseOrderResponse | null;
  onSuccess: () => void;
}

interface ReceiveItem {
  id: string;
  itemType: "PRODUCT" | "PART_COMPONENT";
  productVariantId?: string;
  partComponentId?: string;
  displayName: string;
  displayCode: string;
  quantityOrdered: number;
  quantityReceived: number;
  serialNumbers: string[];
  unitPrice: number;
}

export default function ReceiveGoodsDialog({
  open,
  onOpenChange,
  purchaseOrder,
  onSuccess,
}: ReceiveGoodsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [actualDeliveryDate, setActualDeliveryDate] = useState<
    Date | undefined
  >(new Date());
  const [items, setItems] = useState<ReceiveItem[]>([]);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [serialInput, setSerialInput] = useState("");

  useEffect(() => {
    if (open && purchaseOrder) {
      // Initialize items from purchase order
      const initialItems: ReceiveItem[] = purchaseOrder.items.map((item) => {
        let displayName = "";
        let displayCode = "";
        let itemType: "PRODUCT" | "PART_COMPONENT" = "PRODUCT";
        let productVariantId: string | undefined;
        let partComponentId: string | undefined;

        if (item.productVariant) {
          itemType = "PRODUCT";
          productVariantId = item.productVariant.id;
          displayName = `${item.productVariant.productName} - ${item.productVariant.variantName}`;
          displayCode = item.productVariant.sku;
        } else if (item.partComponent) {
          itemType = "PART_COMPONENT";
          partComponentId = item.partComponent.id;
          displayName = item.partComponent.partName;
          displayCode = item.partComponent.partNumber;
        }

        return {
          id: item.id,
          itemType,
          productVariantId,
          partComponentId,
          displayName,
          displayCode,
          quantityOrdered: item.quantityOrdered,
          quantityReceived: item.quantityOrdered, // Default to ordered quantity
          serialNumbers: [],
          unitPrice: item.unitPrice,
        };
      });
      setItems(initialItems);
    }
  }, [open, purchaseOrder]);

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantityReceived: Math.max(0, quantity),
              // Clear serial numbers if quantity changes for products
              serialNumbers:
                item.itemType === "PRODUCT" &&
                quantity !== item.serialNumbers.length
                  ? []
                  : item.serialNumbers,
            }
          : item,
      ),
    );
  };

  const handleAddSerial = (itemId: string) => {
    if (!serialInput.trim()) {
      toast.error("Please enter a serial number");
      return;
    }

    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    // Check if serial already exists in this item
    if (item.serialNumbers.includes(serialInput.trim())) {
      toast.error("Serial number already added");
      return;
    }

    // Check if we've reached the quantity limit
    if (item.serialNumbers.length >= item.quantityReceived) {
      toast.error("Cannot add more serial numbers than quantity received");
      return;
    }

    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              serialNumbers: [...i.serialNumbers, serialInput.trim()],
            }
          : i,
      ),
    );

    setSerialInput("");
  };

  const handleRemoveSerial = (itemId: string, serial: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              serialNumbers: item.serialNumbers.filter((s) => s !== serial),
            }
          : item,
      ),
    );
  };

  const validateSubmission = (): string | null => {
    // Check if all product items have correct number of serials
    for (const item of items) {
      if (item.itemType === "PRODUCT" && item.quantityReceived > 0) {
        if (item.serialNumbers.length !== item.quantityReceived) {
          return `${item.displayName}: Must provide exactly ${item.quantityReceived} serial numbers (currently have ${item.serialNumbers.length})`;
        }
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateSubmission();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (!purchaseOrder) return;

    setLoading(true);
    try {
      const requestItems: ReceiveGoodsItemRequest[] = items.map((item) => ({
        productVariantId: item.productVariantId,
        partComponentId: item.partComponentId,
        quantityReceived: item.quantityReceived,
        serialNumbers:
          item.itemType === "PRODUCT" ? item.serialNumbers : undefined,
      }));

      await purchaseOrderService.receiveGoods(purchaseOrder.id, {
        actualDeliveryDate: actualDeliveryDate
          ? format(actualDeliveryDate, "yyyy-MM-dd'T'HH:mm:ss")
          : undefined,
        items: requestItems,
      });

      toast.success("Goods received successfully and added to inventory");
      handleClose();
      onSuccess();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error receiving goods:", error);
      toast.error(err.response?.data?.message || "Failed to receive goods");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setItems([]);
    setExpandedItemId(null);
    setSerialInput("");
    setActualDeliveryDate(new Date());
    onOpenChange(false);
  };

  if (!purchaseOrder) return null;

  // Calculate progress
  const totalItems = items.length;
  const completedItems = items.filter((item) => {
    if (item.itemType === "PART_COMPONENT") return item.quantityReceived >= 0;
    return item.serialNumbers.length === item.quantityReceived;
  }).length;
  const progressPercentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        {/* Fixed Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 md:p-6 rounded-t-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl md:text-2xl font-bold text-white">
                  Receive Goods
                </DialogTitle>
                <div className="text-green-100 text-sm mt-1">
                  {purchaseOrder.poNumber}
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Supplier Info - Mobile Optimized */}
          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-green-200">Supplier:</span>
                <span className="ml-2 font-medium">
                  {purchaseOrder.supplier.name}
                </span>
              </div>
              <div>
                <span className="text-green-200">Contact:</span>
                <span className="ml-2">
                  {purchaseOrder.supplier.contactName}
                </span>
              </div>
              <div>
                <span className="text-green-200">Phone:</span>
                <span className="ml-2">{purchaseOrder.supplier.phone}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>
                {completedItems}/{totalItems} items ready
              </span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* Actual Delivery Date */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              Actual Delivery Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-11"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {actualDeliveryDate
                    ? format(actualDeliveryDate, "EEEE, MMM dd, yyyy")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={actualDeliveryDate}
                  onSelect={setActualDeliveryDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Items List - Fully Mobile Responsive */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" />
              Items to Receive ({items.length})
            </h3>

            {/* Desktop Table View */}
            <div className="hidden lg:block border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-[80px]">Type</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-center w-[80px]">
                      Ordered
                    </TableHead>
                    <TableHead className="text-center w-[100px]">
                      Receive
                    </TableHead>
                    <TableHead className="w-[140px]">Serials</TableHead>
                    <TableHead className="w-[60px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const isComplete =
                      item.itemType === "PART_COMPONENT" ||
                      item.serialNumbers.length === item.quantityReceived;

                    return (
                      <TableRow
                        key={item.id}
                        className={isComplete ? "bg-green-50/50" : ""}
                      >
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              item.itemType === "PRODUCT"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }
                          >
                            {item.itemType === "PRODUCT" ? (
                              <Package className="w-3 h-3 mr-1" />
                            ) : (
                              <Wrench className="w-3 h-3 mr-1" />
                            )}
                            {item.itemType === "PRODUCT" ? "Product" : "Part"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.displayName}
                        </TableCell>
                        <TableCell className="text-slate-600 font-mono text-sm">
                          {item.displayCode}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {item.quantityOrdered}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={item.quantityOrdered * 2}
                            value={item.quantityReceived}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.id,
                                Number(e.target.value),
                              )
                            }
                            className="w-20 text-center h-9"
                          />
                        </TableCell>
                        <TableCell>
                          {item.itemType === "PRODUCT" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setExpandedItemId(
                                  expandedItemId === item.id ? null : item.id,
                                )
                              }
                              className={
                                item.serialNumbers.length ===
                                item.quantityReceived
                                  ? "border-green-500 text-green-700 bg-green-50"
                                  : "border-amber-500 text-amber-700 bg-amber-50"
                              }
                            >
                              <Barcode className="w-3 h-3 mr-1" />
                              {item.serialNumbers.length}/
                              {item.quantityReceived}
                            </Button>
                          ) : (
                            <span className="text-slate-400 text-sm italic">
                              Not required
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isComplete ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-3">
              {items.map((item) => {
                const isComplete =
                  item.itemType === "PART_COMPONENT" ||
                  item.serialNumbers.length === item.quantityReceived;

                return (
                  <div
                    key={item.id}
                    className={`border rounded-xl p-4 shadow-sm space-y-3 transition-colors ${
                      isComplete ? "bg-green-50 border-green-200" : "bg-white"
                    }`}
                  >
                    {/* Item Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={
                              item.itemType === "PRODUCT"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }
                          >
                            {item.itemType === "PRODUCT" ? (
                              <Package className="w-3 h-3 mr-1" />
                            ) : (
                              <Wrench className="w-3 h-3 mr-1" />
                            )}
                            {item.itemType === "PRODUCT" ? "Product" : "Part"}
                          </Badge>
                          {isComplete ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                        <div className="font-semibold text-slate-800 text-base">
                          {item.displayName}
                        </div>
                        <div className="text-sm text-slate-500 font-mono">
                          {item.displayCode}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Section */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-white rounded-lg border">
                      <div>
                        <Label className="text-xs text-slate-500 font-medium">
                          Ordered Qty
                        </Label>
                        <div className="text-2xl font-bold text-slate-800">
                          {item.quantityOrdered}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500 font-medium">
                          Receive Qty
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          max={item.quantityOrdered * 2}
                          value={item.quantityReceived}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              Number(e.target.value),
                            )
                          }
                          className="h-12 text-xl font-bold text-center"
                        />
                      </div>
                    </div>

                    {/* Serial Numbers Section - Only for Products */}
                    {item.itemType === "PRODUCT" && (
                      <div>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setExpandedItemId(
                              expandedItemId === item.id ? null : item.id,
                            )
                          }
                          className={`w-full h-12 text-base ${
                            item.serialNumbers.length === item.quantityReceived
                              ? "border-green-500 text-green-700 bg-green-50"
                              : "border-amber-500 text-amber-700 bg-amber-50"
                          }`}
                        >
                          <Barcode className="w-4 h-4 mr-2" />
                          Serial Numbers: {item.serialNumbers.length}/
                          {item.quantityReceived}
                          {item.serialNumbers.length <
                            item.quantityReceived && (
                            <span className="ml-2 text-xs">
                              (Need{" "}
                              {item.quantityReceived -
                                item.serialNumbers.length}{" "}
                              more)
                            </span>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Serial Number Input Section - Expanded View */}
            {expandedItemId && (
              <div className="border-2 border-blue-300 rounded-xl p-4 bg-blue-50 space-y-4 animate-in slide-in-from-top-2">
                {(() => {
                  const item = items.find((i) => i.id === expandedItemId);
                  if (!item || item.itemType !== "PRODUCT") return null;

                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                            <Barcode className="w-5 h-5" />
                            Serial Numbers
                          </h4>
                          <p className="text-sm text-slate-600">
                            {item.displayName}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedItemId(null)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Serial Input - Large touch target for mobile */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Scan or enter serial number"
                          value={serialInput}
                          onChange={(e) => setSerialInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSerial(item.id);
                            }
                          }}
                          className="bg-white h-12 text-base"
                          autoFocus
                        />
                        <Button
                          onClick={() => handleAddSerial(item.id)}
                          className="h-12 px-4 bg-gradient-to-r from-blue-600 to-blue-700"
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Progress indicator */}
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-sm font-medium">Added</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-lg font-bold ${
                              item.serialNumbers.length ===
                              item.quantityReceived
                                ? "text-green-600"
                                : "text-amber-600"
                            }`}
                          >
                            {item.serialNumbers.length} /{" "}
                            {item.quantityReceived}
                          </span>
                          {item.serialNumbers.length ===
                          item.quantityReceived ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                      </div>

                      {/* Serial list */}
                      {item.serialNumbers.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {item.serialNumbers.map((serial, index) => (
                            <div
                              key={serial}
                              className="flex items-center justify-between bg-white p-3 rounded-lg border"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-400 w-6">
                                  #{index + 1}
                                </span>
                                <span className="font-mono font-medium">
                                  {serial}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-red-100"
                                onClick={() =>
                                  handleRemoveSerial(item.id, serial)
                                }
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {item.serialNumbers.length < item.quantityReceived && (
                        <div className="flex items-center gap-2 text-amber-600 text-sm p-3 bg-amber-50 rounded-lg">
                          <AlertCircle className="w-4 h-4" />
                          Need{" "}
                          {item.quantityReceived -
                            item.serialNumbers.length}{" "}
                          more serial number(s)
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <DialogFooter className="flex-col sm:flex-row gap-3 p-4 md:p-6 border-t bg-slate-50 mt-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="w-full sm:w-auto h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || progressPercentage < 100}
            className="w-full sm:w-auto h-12 bg-gradient-to-r from-green-600 to-green-700 text-base font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Confirm Receipt & Stock In
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
