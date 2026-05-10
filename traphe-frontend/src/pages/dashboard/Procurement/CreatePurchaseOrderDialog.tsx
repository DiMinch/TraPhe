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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Calendar, Plus, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  purchaseOrderService,
  type PurchaseOrderItemRequest,
} from "@/services/purchase-order.service";
import {
  supplierService,
  type SupplierResponse,
} from "@/services/supplier.service";
import { productService } from "@/services/product.service";
import { partService } from "@/services/part.service";
import type { PartComponent } from "@/types/part.types";

interface Product {
  id: string;
  name: string;
}

interface ProductVariant {
  id: string;
  sku: string;
  variantName: string;
  productId: string;
  productName: string;
  sellingPrice: number;
}

interface CreatePurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface OrderItem {
  tempId: string;
  itemType: "PRODUCT" | "PART_COMPONENT";
  productVariantId?: string;
  partComponentId?: string;
  displayName: string;
  displayCode: string;
  quantityOrdered: number;
  unitPrice: number;
  warrantyPeriod: number;
  referenceTicketId?: string;
  subtotal: number;
}

export default function CreatePurchaseOrderDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreatePurchaseOrderDialogProps) {
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allVariants, setAllVariants] = useState<ProductVariant[]>([]);
  const [parts, setParts] = useState<PartComponent[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [supplierId, setSupplierId] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<
    Date | undefined
  >();
  const [items, setItems] = useState<OrderItem[]>([]);

  // New item states
  const [newItemType, setNewItemType] = useState<"PRODUCT" | "PART_COMPONENT">(
    "PRODUCT",
  );
  const [newProductId, setNewProductId] = useState("");
  const [newProductVariantId, setNewProductVariantId] = useState("");
  const [newPartComponentId, setNewPartComponentId] = useState("");
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const [newUnitPrice, setNewUnitPrice] = useState<number>(0);
  const [newWarrantyPeriod, setNewWarrantyPeriod] = useState<number>(12);
  const [newReferenceTicketId, setNewReferenceTicketId] = useState("");

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const [suppliersRes, productsRes, partsRes] = await Promise.all([
        supplierService.getAllSuppliers(),
        productService.getAllProducts(),
        partService.getAllParts(),
      ]);

      console.log("Suppliers response:", suppliersRes);
      console.log("Products response:", productsRes);
      console.log("Parts response:", partsRes);

      if (suppliersRes.data) {
        // Handle both direct array and paginated response
        const suppliersData = Array.isArray(suppliersRes.data)
          ? suppliersRes.data
          : (suppliersRes.data as any)?.content || [];
        console.log("Suppliers data:", suppliersData);
        setSuppliers(suppliersData);
      }

      if (productsRes.data) {
        // Handle both direct array and paginated response
        const productsData = Array.isArray(productsRes.data)
          ? productsRes.data
          : (productsRes.data as any)?.content || [];

        console.log("Products data:", productsData);

        // Store products
        const productsList: Product[] = productsData.map((product: any) => ({
          id: product.id,
          name: product.name,
        }));
        console.log("Products list:", productsList);
        setAllProducts(productsList);

        // Extract all variants from all products
        const variantsList: ProductVariant[] = [];
        productsData.forEach((product: any) => {
          if (product.variants && Array.isArray(product.variants)) {
            product.variants.forEach((variant: any) => {
              variantsList.push({
                id: variant.id,
                sku: variant.sku,
                variantName: variant.variantName || "Default",
                productId: product.id,
                productName: product.name,
                sellingPrice: variant.sellingPrice || 0,
              });
            });
          }
        });
        console.log("Variants list:", variantsList);
        setAllVariants(variantsList);
      }

      if (partsRes.data) {
        // Handle both direct array and paginated response
        const partsData = Array.isArray(partsRes.data)
          ? partsRes.data
          : (partsRes.data as any)?.content || [];
        console.log("Parts data:", partsData);
        setParts(partsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    }
  };

  const handleAddItem = () => {
    if (newItemType === "PRODUCT" && !newProductVariantId) {
      toast.error("Please select a product");
      return;
    }
    if (newItemType === "PART_COMPONENT" && !newPartComponentId) {
      toast.error("Please select a part component");
      return;
    }
    if (newQuantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    if (newUnitPrice <= 0) {
      toast.error("Unit price must be greater than 0");
      return;
    }

    let displayName = "";
    let displayCode = "";

    if (newItemType === "PRODUCT") {
      const selectedProduct = allVariants.find(
        (p) => p.id === newProductVariantId,
      );
      if (selectedProduct) {
        displayName = `${selectedProduct.productName} - ${selectedProduct.variantName}`;
        displayCode = selectedProduct.sku;
      }
    } else {
      const selectedPart = parts.find((p) => p.id === newPartComponentId);
      if (selectedPart) {
        displayName = selectedPart.name;
        displayCode = selectedPart.partType;
      }
    }

    const newItem: OrderItem = {
      tempId: Date.now().toString(),
      itemType: newItemType,
      productVariantId:
        newItemType === "PRODUCT" ? newProductVariantId : undefined,
      partComponentId:
        newItemType === "PART_COMPONENT" ? newPartComponentId : undefined,
      displayName,
      displayCode,
      quantityOrdered: newQuantity,
      unitPrice: newUnitPrice,
      warrantyPeriod: newWarrantyPeriod,
      referenceTicketId: newReferenceTicketId || undefined,
      subtotal: newQuantity * newUnitPrice,
    };

    setItems([...items, newItem]);

    // Reset form
    setNewProductId("");
    setNewProductVariantId("");
    setNewPartComponentId("");
    setNewQuantity(1);
    setNewUnitPrice(0);
    setNewWarrantyPeriod(12);
    setNewReferenceTicketId("");
  };

  const handleRemoveItem = (tempId: string) => {
    setItems(items.filter((item) => item.tempId !== tempId));
  };

  const handleProductSelection = (productId: string) => {
    setNewProductId(productId);
    setNewProductVariantId(""); // Reset variant when product changes
    setNewUnitPrice(0);
  };

  const handleVariantChange = (variantId: string) => {
    setNewProductVariantId(variantId);
    const variant = allVariants.find((v) => v.id === variantId);
    if (variant) {
      setNewUnitPrice(variant.sellingPrice);
    }
  };

  // Get variants for selected product
  const availableVariants = allVariants.filter(
    (v) => v.productId === newProductId,
  );

  const handlePartChange = (partId: string) => {
    setNewPartComponentId(partId);
    const part = parts.find((p) => p.id === partId);
    if (part) {
      setNewUnitPrice(part.sellingPrice || 0);
    }
  };

  const handleSubmit = async () => {
    if (!supplierId) {
      toast.error("Please select a supplier");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    setLoading(true);
    try {
      const requestItems: PurchaseOrderItemRequest[] = items.map((item) => ({
        productVariantId: item.productVariantId,
        partComponentId: item.partComponentId,
        quantityOrdered: item.quantityOrdered,
        unitPrice: item.unitPrice,
        warrantyPeriod: item.warrantyPeriod,
        referenceTicketId: item.referenceTicketId,
      }));

      const response = await purchaseOrderService.createPurchaseOrder({
        supplierId,
        expectedDeliveryDate: expectedDeliveryDate
          ? `${format(expectedDeliveryDate, "yyyy-MM-dd")}T00:00:00`
          : undefined,
        items: requestItems,
      });

      console.log("Purchase order created:", response);
      toast.success("Purchase order created successfully");

      // First call onSuccess to refresh the list, then close the dialog
      await onSuccess();
      handleClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error creating purchase order:", error);
      toast.error(
        err.response?.data?.message || "Failed to create purchase order",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSupplierId("");
    setExpectedDeliveryDate(undefined);
    setItems([]);
    setNewItemType("PRODUCT");
    setNewProductId("");
    setNewProductVariantId("");
    setNewPartComponentId("");
    setNewQuantity(1);
    setNewUnitPrice(0);
    setNewWarrantyPeriod(12);
    setNewReferenceTicketId("");
    onOpenChange(false);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="min-w-6xl max-h-[90vh] bg-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">
            Create Purchase Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Supplier and Date Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-base font-semibold">
                Supplier *
              </Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className="h-11">
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

            <div className="space-y-2">
              <Label className="text-base font-semibold">
                Expected Delivery Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-11 justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {expectedDeliveryDate
                      ? format(expectedDeliveryDate, "MMM dd, yyyy")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={expectedDeliveryDate}
                    onSelect={setExpectedDeliveryDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Add Item Section */}
          <div className="border-2 rounded-lg p-6 bg-white space-y-5">
            <h3 className="font-semibold text-lg text-slate-700">Add Item</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Item Type *</Label>
                <Select
                  value={newItemType}
                  onValueChange={(value: "PRODUCT" | "PART_COMPONENT") => {
                    setNewItemType(value);
                    setNewProductId("");
                    setNewProductVariantId("");
                    setNewPartComponentId("");
                    setNewUnitPrice(0);
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRODUCT">Product</SelectItem>
                    <SelectItem value="PART_COMPONENT">
                      Part Component
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newItemType === "PRODUCT" ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Product *</Label>
                    <Select
                      value={newProductId}
                      onValueChange={handleProductSelection}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {allProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Variant *</Label>
                    <Select
                      value={newProductVariantId}
                      onValueChange={handleVariantChange}
                      disabled={!newProductId}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue
                          placeholder={
                            newProductId
                              ? "Select variant"
                              : "Select product first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVariants.map((variant) => (
                          <SelectItem key={variant.id} value={variant.id}>
                            {variant.variantName} ({variant.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="space-y-2 lg:col-span-2">
                  <Label className="text-base font-semibold">
                    Part Component *
                  </Label>
                  <Select
                    value={newPartComponentId}
                    onValueChange={handlePartChange}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select part component" />
                    </SelectTrigger>
                    <SelectContent>
                      {parts.map((part) => (
                        <SelectItem key={part.id} value={part.id}>
                          {part.name} ({part.partType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-base font-semibold">Quantity *</Label>
                <Input
                  type="number"
                  min={1}
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value))}
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Unit Price *</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={newUnitPrice}
                  onChange={(e) => setNewUnitPrice(Number(e.target.value))}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Warranty (months)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={newWarrantyPeriod}
                  onChange={(e) => setNewWarrantyPeriod(Number(e.target.value))}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Reference Ticket ID
                </Label>
                <Input
                  value={newReferenceTicketId}
                  onChange={(e) => setNewReferenceTicketId(e.target.value)}
                  placeholder="Optional"
                  className="h-11"
                />
              </div>
            </div>

            <Button
              onClick={handleAddItem}
              className="w-full h-12 text-base bg-gradient-to-r from-indigo-600 to-indigo-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white">
                    <TableHead>Type</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Warranty</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.tempId}>
                      <TableCell>
                        <span className="text-xs px-2 py-1 rounded bg-white border border-slate-200">
                          {item.itemType === "PRODUCT" ? "Product" : "Part"}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.displayName}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {item.displayCode}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantityOrdered}
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.unitPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.warrantyPeriod}m
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${item.subtotal.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.tempId)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-white font-semibold border-t-2">
                    <TableCell colSpan={6} className="text-right">
                      Total Amount:
                    </TableCell>
                    <TableCell className="text-right text-lg">
                      ${totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="h-11 px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !supplierId || items.length === 0}
            className="h-11 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Purchase Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
