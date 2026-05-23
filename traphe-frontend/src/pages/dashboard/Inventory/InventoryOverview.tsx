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
  type InventoryOverviewResponse,
  type LowStockProductItem,
  type LowStockComponentItem,
} from "@/services/inventory.service";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const ITEMS_PER_PAGE = 5;

export default function InventoryOverviewPage() {
  const [overviewData, setOverviewData] =
    useState<InventoryOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Time range states for charts
  const [stockValueTimeRange, setStockValueTimeRange] = useState("MONTH");
  const [onHandTimeRange, setOnHandTimeRange] = useState("MONTH");

  // Pagination states
  const [productPage, setProductPage] = useState(1);
  const [componentPage, setComponentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventoryOverview(
        stockValueTimeRange,
        onHandTimeRange,
      );

      if (response.statusCode === 200 && response.data) {
        setOverviewData(response.data);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error.response?.data?.message || "Failed to fetch inventory data",
      );
    } finally {
      setLoading(false);
    }
  }, [stockValueTimeRange, onHandTimeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Paginated low stock products
  const paginatedProducts =
    overviewData?.lowStockProducts?.slice(
      (productPage - 1) * ITEMS_PER_PAGE,
      productPage * ITEMS_PER_PAGE,
    ) || [];
  const totalProductPages = Math.ceil(
    (overviewData?.lowStockProducts?.length || 0) / ITEMS_PER_PAGE,
  );

  // Paginated low stock components
  const paginatedComponents =
    overviewData?.lowStockComponents?.slice(
      (componentPage - 1) * ITEMS_PER_PAGE,
      componentPage * ITEMS_PER_PAGE,
    ) || [];
  const totalComponentPages = Math.ceil(
    (overviewData?.lowStockComponents?.length || 0) / ITEMS_PER_PAGE,
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

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
                <p className="text-2xl font-bold">
                  {loading
                    ? "..."
                    : formatCurrency(overviewData?.totalStockValue || 0)}
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
                  {loading ? "..." : overviewData?.lowStockProductCount || 0}
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
                  {loading ? "..." : overviewData?.lowStockComponentCount || 0}
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
              <Select
                value={stockValueTimeRange}
                onValueChange={setStockValueTimeRange}
              >
                <SelectTrigger className="w-[140px] h-8 text-sm border-slate-200">
                  <SelectValue placeholder="By Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTH">By Month</SelectItem>
                  <SelectItem value="WEEK">By Week</SelectItem>
                  <SelectItem value="YEAR">By Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[200px] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-roast" />
              </div>
            ) : overviewData?.stockValueChartData &&
              overviewData.stockValueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={overviewData.stockValueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    stroke="#94a3b8"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#94a3b8"
                    tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Stock Value",
                    ]}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="stockValue"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center border border-slate-200 rounded-lg bg-slate-50/50">
                <p className="text-sm text-slate-500">
                  No chart data available
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* On-hand Quantity Chart */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-800">
                On-hand Quantity
              </CardTitle>
              <Select
                value={onHandTimeRange}
                onValueChange={setOnHandTimeRange}
              >
                <SelectTrigger className="w-[140px] h-8 text-sm border-slate-200">
                  <SelectValue placeholder="By Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTH">By Month</SelectItem>
                  <SelectItem value="WEEK">By Week</SelectItem>
                  <SelectItem value="YEAR">By Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[200px] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-roast" />
              </div>
            ) : overviewData?.onHandQuantityChartData &&
              overviewData.onHandQuantityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={overviewData.onHandQuantityChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    stroke="#94a3b8"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="productQuantity"
                    name="Products"
                    stroke="#f97316"
                    fill="#f97316"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="componentQuantity"
                    name="Components"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center border border-slate-200 rounded-lg bg-slate-50/50">
                <p className="text-sm text-slate-500">
                  No chart data available
                </p>
              </div>
            )}
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
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-roast" />
                      </TableCell>
                    </TableRow>
                  ) : paginatedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-slate-500"
                      >
                        No low stock products
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProducts.map((product: LowStockProductItem) => (
                      <TableRow
                        key={product.productVariantId}
                        className="hover:bg-slate-50/50"
                      >
                        <TableCell className="font-medium text-slate-800 text-sm">
                          {product.productName || "N/A"} -{" "}
                          {product.variantName || "N/A"}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {product.sku || "N/A"}
                        </TableCell>
                        <TableCell className="text-amber-600 font-semibold">
                          {product.currentStock}
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
            {totalProductPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setProductPage((p) => Math.max(1, p - 1))
                        }
                        className={
                          productPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    {Array.from(
                      { length: totalProductPages },
                      (_, i) => i + 1,
                    ).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setProductPage(page)}
                          isActive={productPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setProductPage((p) =>
                            Math.min(totalProductPages, p + 1),
                          )
                        }
                        className={
                          productPage === totalProductPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
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
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-roast" />
                      </TableCell>
                    </TableRow>
                  ) : paginatedComponents.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-slate-500"
                      >
                        No low stock components
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedComponents.map((part: LowStockComponentItem) => (
                      <TableRow
                        key={part.partComponentId}
                        className="hover:bg-slate-50/50"
                      >
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
            {totalComponentPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setComponentPage((p) => Math.max(1, p - 1))
                        }
                        className={
                          componentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    {Array.from(
                      { length: totalComponentPages },
                      (_, i) => i + 1,
                    ).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setComponentPage(page)}
                          isActive={componentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setComponentPage((p) =>
                            Math.min(totalComponentPages, p + 1),
                          )
                        }
                        className={
                          componentPage === totalComponentPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
