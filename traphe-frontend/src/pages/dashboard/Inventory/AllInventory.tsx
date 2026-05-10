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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  RefreshCw,
  Edit,
  Minus,
  Plus,
  Loader2,
  ArrowUpDown,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import {
  inventoryService,
  type InventoryResponse,
} from "@/services/inventory.service";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  productVariantId: string;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  physical: number;
  reserved: number;
  available: number;
  status: "Active" | "Inactive";
}

export default function AllInventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newQuantity, setNewQuantity] = useState(0);
  const [reason, setReason] = useState("Data Entry Error");
  const [note, setNote] = useState("");
  const [activeTab, setActiveTab] = useState("variants");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [partsData, setPartsData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [submitting, setSubmitting] = useState(false);

  // Fetch inventory data from API
  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getAllInventory();

      console.log("Raw API response:", response);

      // Handle both direct array and paginated response
      const rawData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.content || [];

      // Transform API response to match InventoryItem interface
      // Only include PRODUCT type items (variants)
      const transformedData: InventoryItem[] = rawData
        .filter((item: InventoryResponse) => {
          // Only include items with valid productVariant (type === "PRODUCT")
          if (
            item.type !== "PRODUCT" ||
            !item.productVariant ||
            !item.productVariant.id
          ) {
            return false;
          }
          return true;
        })
        .map((item: InventoryResponse) => {
          const pv = item.productVariant!;
          return {
            id: item.id,
            productVariantId: pv.id,
            name: pv.variantName
              ? `${pv.productName} - ${pv.variantName}`
              : pv.productName || "Unknown Product",
            sku: pv.sku || "N/A",
            category: pv.categoryName || "N/A",
            supplier: pv.supplier?.name || "N/A",
            physical: item.quantityPhysical || 0,
            reserved: item.quantityReserved || 0,
            available: item.quantityAvailable || 0,
            status: "Active" as const,
          };
        });

      console.log("Transformed data:", transformedData);
      setInventoryData(transformedData);
    } catch (err: any) {
      console.error("Error fetching inventory:", err);

      // Handle different error types
      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          setError("Authentication required. Please sign in.");
        } else if (status === 403) {
          setError(
            "You don't have permission to view inventory. ADMIN or EMPLOYEE role required.",
          );
        } else if (status === 400) {
          setError(
            "Invalid request. Please check your authentication and try again.",
          );
        } else {
          setError(
            `Server error (${status}): ${
              err.response.data?.message || "Failed to fetch inventory"
            }`,
          );
        }
      } else if (err.request) {
        setError(
          "Cannot connect to server. Please check if the backend is running.",
        );
      } else {
        setError(err.message || "Failed to fetch inventory data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchParts();
    fetchCategories();
  }, []);

  // Fetch parts/components data from inventory API
  const fetchParts = async () => {
    try {
      const response = await inventoryService.getAllInventory();
      console.log("Parts API response:", response);

      const rawData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.content || [];

      // Transform parts data to match InventoryItem interface
      // Only include COMPONENT type items
      const transformedParts: InventoryItem[] = rawData
        .filter((item: InventoryResponse) => {
          return (
            item.type === "COMPONENT" &&
            item.partComponent &&
            item.partComponent.id
          );
        })
        .map((item: InventoryResponse) => {
          const pc = item.partComponent!;
          return {
            id: item.id,
            productVariantId: pc.id, // Use part id as variant id for compatibility
            name: pc.name,
            sku: pc.id.substring(0, 8).toUpperCase(), // Generate a short code from ID
            category: pc.partType || "Part Component",
            supplier: pc.supplier?.name || "N/A",
            physical: item.quantityPhysical || 0,
            reserved: item.quantityReserved || 0,
            available: item.quantityAvailable || 0,
            status:
              (item.quantityAvailable || 0) > 0
                ? ("Active" as const)
                : ("Inactive" as const),
          };
        });

      console.log("Transformed parts data:", transformedParts);
      setPartsData(transformedParts);
    } catch (err: unknown) {
      console.error("Error fetching parts:", err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { categoryService } = await import("@/services/category.service");
      const response = await categoryService.getAllCategories();
      const categoriesData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.content || [];
      setCategories(categoriesData);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
    }
  };

  const productVariants: InventoryItem[] = inventoryData;
  const partsComponents: InventoryItem[] = partsData;

  // Filter items by search term and status
  const filteredVariants = productVariants.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all-status" ||
      item.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const filteredParts = partsComponents.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all-status" ||
      item.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleStockAdjustment = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewQuantity(item.physical);
    setIsStockAdjustmentOpen(true);
  };

  const handleEditClick = (item: InventoryItem) => {
    // Validate that item has productVariantId
    if (!item.productVariantId || item.productVariantId === "") {
      toast.error(
        "Cannot edit this item: Product Variant information is missing.",
      );
      console.error("Item missing productVariantId:", item);
      return;
    }

    setEditItem(item);
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editItem) return;

    // Validate productVariantId
    if (!editItem.productVariantId || editItem.productVariantId === "") {
      toast.error("Product Variant ID is missing. Cannot update inventory.");
      console.error("Invalid productVariantId:", editItem);
      return;
    }

    // Check if physical quantity changed
    const originalItem = inventoryData.find((item) => item.id === editItem.id);
    if (!originalItem) {
      toast.error("Original item not found!");
      return;
    }

    const difference = editItem.physical - originalItem.physical;

    // Don't send adjustment if no change
    if (difference === 0) {
      toast.info("No changes detected in stock quantity.");
      setIsEditDialogOpen(false);
      return;
    }

    setSubmitting(true);
    try {
      console.log("Original item:", originalItem);
      console.log("Edited item:", editItem);
      console.log("Difference:", difference);

      // Use STOCK_IN for adding, STOCK_OUT for removing
      const transactionType = difference > 0 ? "STOCK_IN" : "STOCK_OUT";

      const adjustmentData = {
        reason: `Manual Edit - Inventory Update (${difference > 0 ? "+" : ""}${difference})`,
        items: [
          {
            productVariantId: editItem.productVariantId,
            type: transactionType,
            quantity: Math.abs(difference),
            reason: `Manual Edit - Inventory Update (${difference > 0 ? "+" : ""}${difference})`,
          },
        ],
      };

      console.log(
        "Sending adjustment data:",
        JSON.stringify(adjustmentData, null, 2),
      );

      // Step 1: Create the adjustment (PENDING status)
      const createResponse =
        await inventoryService.createStockAdjustment(adjustmentData);
      console.log("Adjustment created:", createResponse);

      // Step 2: Auto-approve the adjustment to apply changes
      if (createResponse.data?.id) {
        const approveResponse = await inventoryService.approveStockAdjustment(
          createResponse.data.id,
        );
        console.log("Adjustment approved:", approveResponse);
      }

      toast.success(
        `Stock updated! ${difference > 0 ? "Added" : "Removed"} ${Math.abs(difference)} units.`,
      );

      setIsEditDialogOpen(false);
      await fetchInventory();
    } catch (err: any) {
      console.error("Error updating inventory:", err);
      console.error("Error response:", err.response);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update inventory";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;

    // Don't send if no change
    if (difference === 0) {
      toast.info("No changes detected. Please adjust the quantity.");
      return;
    }

    setSubmitting(true);
    try {
      // Use STOCK_IN for adding, STOCK_OUT for removing
      const transactionType = difference > 0 ? "STOCK_IN" : "STOCK_OUT";

      const adjustmentData = {
        reason: note || reason,
        items: [
          {
            productVariantId: selectedItem.productVariantId,
            type: transactionType,
            quantity: Math.abs(difference),
            reason: note || reason,
          },
        ],
      };

      // Step 1: Create the adjustment (PENDING status)
      const createResponse =
        await inventoryService.createStockAdjustment(adjustmentData);

      // Step 2: Auto-approve the adjustment to apply changes
      if (createResponse.data?.id) {
        await inventoryService.approveStockAdjustment(createResponse.data.id);
      }

      toast.success(
        `Stock adjusted! ${difference > 0 ? "Added" : "Removed"} ${Math.abs(difference)} units.`,
      );
      setIsStockAdjustmentOpen(false);
      fetchInventory();
      setNote("");
    } catch (err: any) {
      console.error("Error creating stock adjustment:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to create stock adjustment";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const difference = selectedItem ? newQuantity - selectedItem.physical : 0;

  // Refresh data based on active tab
  const handleRefresh = () => {
    if (activeTab === "variants") {
      fetchInventory();
    } else {
      fetchParts();
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Inventory"
        subtitle="Manage stock levels and adjustments"
        onRefresh={handleRefresh}
      />
      <div className="flex flex-wrap items-center justify-end gap-3 mb-4">
        <Button
          className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white shadow-md"
          onClick={() => {
            if (filteredVariants.length > 0) {
              handleStockAdjustment(filteredVariants[0]);
            } else {
              toast.warning("No inventory items available to adjust");
            }
          }}
        >
          <ArrowUpDown className="w-4 h-4 mr-2" />
          Stock Adjustment
        </Button>
      </div>
      {/* Tabs */}
      <Tabs
        defaultValue="variants"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-4"
      >
        <TabsList className="bg-white/90 backdrop-blur-sm shadow-md rounded-xl p-1">
          <TabsTrigger
            value="variants"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-4 transition-all duration-200"
          >
            Product Variants
          </TabsTrigger>
          <TabsTrigger
            value="components"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-4 transition-all duration-200"
          >
            Parts Component
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, SKU, category..."
              className="pl-10 bg-white border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg h-10 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-[240px] justify-start text-left font-normal bg-white border-slate-200 ${
                  !dateRange.from && !dateRange.to && "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
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
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range: any) => {
                  setDateRange({
                    from: range?.from,
                    to: range?.to,
                  });
                }}
                numberOfMonths={2}
              />
              <div className="p-3 border-t flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    setDateRange({ from: undefined, to: undefined })
                  }
                >
                  Clear
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-white border-slate-200 rounded-lg h-10 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-lg">
              <SelectItem value="all-status">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Apply Button */}
          <Button
            onClick={() => {
              if (activeTab === "variants") {
                fetchInventory();
              } else {
                fetchParts();
              }
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-10 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Apply
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
              <span className="mt-4 text-slate-600 font-medium">
                Loading inventory data...
              </span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center max-w-md">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <p className="text-red-600 font-semibold text-lg mb-2">
                    Error Loading Inventory
                  </p>
                  <p className="text-red-700 text-sm mb-6">{error}</p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={fetchInventory}
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                    {error.includes("Authentication") && (
                      <Button
                        onClick={() => (window.location.href = "/sign-in")}
                        size="sm"
                        className="rounded-lg bg-indigo-600 hover:bg-indigo-700"
                      >
                        Sign In
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-slate-500 text-xs">
                  Make sure you're logged in with ADMIN or EMPLOYEE role and the
                  backend server is running on port 8080.
                </p>
              </div>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <>
              <div className="rounded-xl border border-slate-200/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                      <TableHead className="font-semibold text-slate-700">
                        Name
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Suppliers
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Physical
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Reserved
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Available
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
                    {(activeTab === "variants"
                      ? filteredVariants
                      : filteredParts
                    ).map((item) => (
                      <TableRow
                        key={item.id}
                        className="hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-indigo-50/30 transition-all duration-200"
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-800">
                              {item.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {item.sku}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {item.supplier}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.physical}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.reserved}
                        </TableCell>
                        <TableCell className="font-semibold text-indigo-600">
                          {item.available}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`rounded-full px-3 ${
                              item.status === "Active"
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-lg hover:bg-indigo-50 transition-colors"
                              onClick={() => handleStockAdjustment(item)}
                              disabled={!item.productVariantId}
                              title={
                                !item.productVariantId
                                  ? "Product Variant not found"
                                  : "Stock Adjustment"
                              }
                            >
                              <RefreshCw className="w-4 h-4 text-indigo-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-lg hover:bg-slate-100 transition-colors"
                              onClick={() => handleEditClick(item)}
                              disabled={!item.productVariantId}
                              title={
                                !item.productVariantId
                                  ? "Product Variant not found - Cannot edit"
                                  : "Edit Item"
                              }
                            >
                              <Edit className="w-4 h-4 text-slate-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200/60">
                <Pagination>
                  <PaginationContent className="gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        className="rounded-lg hover:bg-slate-100 transition-colors"
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        isActive
                        className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        className="rounded-lg hover:bg-slate-100 transition-colors"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <Dialog
        open={isStockAdjustmentOpen}
        onOpenChange={setIsStockAdjustmentOpen}
      >
        <DialogContent className="max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Stock Adjustment
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Product Variant */}
            <div className="space-y-2">
              <Label>Product Variant</Label>
              <Select defaultValue="macbook">
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="macbook">
                    MacBook Air M1 (Ram 8GB, 256GB)
                  </SelectItem>
                  <SelectItem value="other">Other Product</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">SKU: MB-M1-GR-256</p>
            </div>

            {/* Quantity Adjustment */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Current Stock</Label>
                <Input
                  value={selectedItem?.physical || 0}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label>New Quantity</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setNewQuantity(Math.max(0, newQuantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={newQuantity}
                    onChange={(e) =>
                      setNewQuantity(parseInt(e.target.value) || 0)
                    }
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setNewQuantity(newQuantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Difference</Label>
                <Input
                  value={difference > 0 ? `+${difference}` : difference}
                  disabled
                  className={`bg-gray-50 ${
                    difference > 0
                      ? "text-green-600"
                      : difference < 0
                        ? "text-red-600"
                        : ""
                  }`}
                />
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Data Entry Error">
                    Data Entry Error
                  </SelectItem>
                  <SelectItem value="Damaged">Damaged</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                  <SelectItem value="Recount">Recount</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea
                placeholder="None"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-white h-20 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsStockAdjustmentOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                className="bg-indigo-900 hover:bg-indigo-800 text-white"
                onClick={handleUpdate}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog - Stock Adjustment */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit Inventory
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Product Info (Read-only) */}
            <div className="space-y-2">
              <Label>Product</Label>
              <Input
                value={editItem?.name || ""}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input
                  value={editItem?.sku || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={editItem?.category || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* Editable Stock Quantity */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Physical Stock *</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setEditItem((prev) =>
                        prev
                          ? {
                              ...prev,
                              physical: Math.max(0, prev.physical - 1),
                            }
                          : prev,
                      )
                    }
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={editItem?.physical ?? 0}
                    onChange={(e) =>
                      setEditItem((prev) =>
                        prev
                          ? { ...prev, physical: parseInt(e.target.value) || 0 }
                          : prev,
                      )
                    }
                    className="bg-white text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setEditItem((prev) =>
                        prev ? { ...prev, physical: prev.physical + 1 } : prev,
                      )
                    }
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reserved</Label>
                <Input
                  type="number"
                  value={editItem?.reserved ?? 0}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Available</Label>
                <Input
                  type="number"
                  value={(editItem?.physical ?? 0) - (editItem?.reserved ?? 0)}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* Difference indicator */}
            {editItem && (
              <div className="text-sm">
                {(() => {
                  const originalItem = inventoryData.find(
                    (item) => item.id === editItem.id,
                  );
                  const diff =
                    editItem.physical - (originalItem?.physical ?? 0);
                  if (diff === 0) return null;
                  return (
                    <p className={diff > 0 ? "text-green-600" : "text-red-600"}>
                      Stock change: {diff > 0 ? "+" : ""}
                      {diff} units
                    </p>
                  );
                })()}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white"
                onClick={handleEditSave}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Stock"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
