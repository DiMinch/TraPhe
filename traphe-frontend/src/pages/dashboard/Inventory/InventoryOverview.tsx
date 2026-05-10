import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Package, DollarSign, AlertTriangle, Loader2 } from "lucide-react";
import {
  inventoryService,
  type InventoryResponse,
} from "@/services/inventory.service";
import { partService } from "@/services/part.service";
import type { PartComponent } from "@/types/part.types";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function InventoryOverviewPage() {
  const [lowStockProducts, setLowStockProducts] = useState<InventoryResponse[]>(
    [],
  );
  const [lowStockParts, setLowStockParts] = useState<PartComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStockValue, setTotalStockValue] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventoryRes, partsRes] = await Promise.all([
        inventoryService.getAllInventory(),
        partService.getLowStockParts(),
      ]);

      if (inventoryRes.statusCode === 200) {
        // Handle both direct array and paginated response
        const inventoryData = Array.isArray(inventoryRes.data)
          ? inventoryRes.data
          : (inventoryRes.data as any)?.content || [];

        // Filter low stock items
        const lowStock = inventoryData.filter(
          (item: InventoryResponse) =>
            item.quantityAvailable <= item.minThreshold,
        );
        setLowStockProducts(lowStock);

        // Calculate total stock value (simplified)
        const total = inventoryData.reduce(
          (sum: number, item: InventoryResponse) =>
            sum + item.quantityAvailable,
          0,
        );
        setTotalStockValue(total);
      }

      if (partsRes.statusCode === 200) {
        // Handle both direct array and paginated response
        const partsData = Array.isArray(partsRes.data)
          ? partsRes.data
          : (partsRes.data as any)?.content || [];
        setLowStockParts(partsData);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error.response?.data?.message || "Failed to fetch inventory data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Inventory Overview"
        subtitle="Monitor stock levels and inventory metrics"
      />

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-emerald-100 text-sm mb-1">
                  Total Stock Value
                </p>
                <p className="text-3xl font-bold">
                  {loading ? "..." : totalStockValue.toLocaleString()} units
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-amber-100 text-sm mb-1">
                  Low Stock Products
                </p>
                <p className="text-3xl font-bold">
                  {loading ? "..." : lowStockProducts.length}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-rose-500 to-rose-600 text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-rose-100 text-sm mb-1">
                  Low Stock Components
                </p>
                <p className="text-3xl font-bold">
                  {loading ? "..." : lowStockParts.length}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Stock Value Chart */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-800">
                Stock Value
              </CardTitle>
              <Select defaultValue="month">
                <SelectTrigger className="w-[140px] h-8 text-sm border-slate-200">
                  <SelectValue placeholder="By Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">By Month</SelectItem>
                  <SelectItem value="week">By Week</SelectItem>
                  <SelectItem value="year">By Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center border border-slate-200 rounded-lg bg-slate-50/50">
              <p className="text-sm text-slate-500">
                Chart placeholder - Stock Value
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm text-slate-600">Laptop</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                <span className="text-sm text-slate-600">Screen</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-slate-600">Mouse</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* On-hand Quantity Chart */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-800">
                On-hand Quantity
              </CardTitle>
              <Select defaultValue="month">
                <SelectTrigger className="w-[140px] h-8 text-sm border-slate-200">
                  <SelectValue placeholder="By Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">By Month</SelectItem>
                  <SelectItem value="week">By Week</SelectItem>
                  <SelectItem value="year">By Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center border border-slate-200 rounded-lg bg-slate-50/50">
              <p className="text-sm text-slate-500">
                Chart placeholder - On-hand Quantity
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm text-slate-600">Laptop</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                <span className="text-sm text-slate-600">Screen</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-slate-600">Mouse</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Low Stock Product Table */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-800">
              Low Stock Products
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                    <TableHead className="font-semibold text-slate-600">
                      Product Variant
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      SKU
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Available
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Min Threshold
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                      </TableCell>
                    </TableRow>
                  ) : lowStockProducts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-slate-500"
                      >
                        No low stock products
                      </TableCell>
                    </TableRow>
                  ) : (
                    lowStockProducts.map((product) => (
                      <TableRow
                        key={product.id}
                        className="hover:bg-slate-50/50"
                      >
                        <TableCell className="font-medium text-slate-800 text-sm">
                          {product.productVariant?.productName || "N/A"} -{" "}
                          {product.productVariant?.variantName || "N/A"}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {product.productVariant?.sku || "N/A"}
                        </TableCell>
                        <TableCell className="text-amber-600 font-semibold">
                          {product.quantityAvailable}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {product.minThreshold}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4">
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

        {/* Low Stock Component Table */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-800">
              Low Stock Components
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                    <TableHead className="font-semibold text-slate-600">
                      Component
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Type
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Stock
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Min Stock
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                      </TableCell>
                    </TableRow>
                  ) : lowStockParts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-slate-500"
                      >
                        No low stock components
                      </TableCell>
                    </TableRow>
                  ) : (
                    lowStockParts.map((part) => (
                      <TableRow key={part.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium text-slate-800">
                          {part.name}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {part.partType}
                        </TableCell>
                        <TableCell className="text-amber-600 font-semibold">
                          {part.currentStock}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {part.minStock}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4">
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
      </div>
    </PageContainer>
  );
}
