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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Package, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { branchStockService, type IngredientStockResponse } from "@/services/branch-stock.service";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const ITEMS_PER_PAGE = 10;
const COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function InventoryOverviewPage() {
  const [lowStockIngredients, setLowStockIngredients] = useState<IngredientStockResponse[]>([]);
  const [totalTrackedCount, setTotalTrackedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all to get total tracked
      const allResponse = await branchStockService.getStock();
      if (allResponse.statusCode === 200 && allResponse.data) {
        setTotalTrackedCount(allResponse.data.length);
      }

      // Fetch only low stock
      const lowStockResponse = await branchStockService.getStock(undefined, undefined, true);
      if (lowStockResponse.statusCode === 200 && lowStockResponse.data) {
        setLowStockIngredients(lowStockResponse.data);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error.response?.data?.message || "Failed to fetch inventory data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Paginated data
  const paginatedData = lowStockIngredients.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );
  const totalPages = Math.ceil(lowStockIngredients.length / ITEMS_PER_PAGE);

  // Compute charts data
  const lowestStockChartData = useMemo(() => {
    return [...lowStockIngredients]
      .sort((a, b) => (a.quantityAvailable - a.minStockAlert) - (b.quantityAvailable - b.minStockAlert))
      .slice(0, 5)
      .map(item => ({
        name: `${item.ingredientName}`,
        branch: item.branchName || "Unknown",
        available: item.quantityAvailable,
        threshold: item.minStockAlert,
      }));
  }, [lowStockIngredients]);

  const lowStockByBranchData = useMemo(() => {
    const counts: Record<string, number> = {};
    lowStockIngredients.forEach(item => {
      const bName = item.branchName || "Unknown";
      counts[bName] = (counts[bName] || 0) + 1;
    });
    return Object.keys(counts).map(branch => ({
      name: branch,
      value: counts[branch],
    }));
  }, [lowStockIngredients]);

  return (
    <PageContainer>
      <PageHeader
        title="Inventory Overview"
        subtitle="Monitor stock levels and ingredient shortages across all branches"
      />

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-emerald-100 text-sm mb-1">
                  Total Ingredients Tracked
                </p>
                <p className="text-3xl font-bold">
                  {loading ? "..." : totalTrackedCount}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-rose-500 to-rose-600 text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-rose-100 text-sm mb-1">
                  Low Stock Ingredients
                </p>
                <p className="text-3xl font-bold">
                  {loading ? "..." : lowStockIngredients.length}
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
        {/* Chart 1: Lowest Stock Items */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">
              Critical Low Stock (Top 5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[250px] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-roast" />
              </div>
            ) : lowestStockChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={lowestStockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "#fff" }}
                    cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="available" name="Available" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="threshold" name="Min Threshold" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center border border-slate-200 rounded-lg bg-slate-50/50">
                <p className="text-sm text-slate-500">No critical stock items</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chart 2: Low Stock Distribution by Branch */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">
              Low Stock by Branch
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[250px] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-roast" />
              </div>
            ) : lowStockByBranchData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={lowStockByBranchData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {lowStockByBranchData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center border border-slate-200 rounded-lg bg-slate-50/50">
                <p className="text-sm text-slate-500">All branches are sufficiently stocked</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-semibold text-slate-800">
            Low Stock Ingredients Data
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                  <TableHead className="font-semibold text-slate-600">
                    Branch Name
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Ingredient Name
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Available
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Min Threshold
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600 text-right">
                    Unit
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-roast" />
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-slate-500"
                    >
                      All ingredients are sufficiently stocked
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-slate-50/50"
                    >
                      <TableCell className="font-medium text-slate-800">
                        {item.branchName || "N/A"}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {item.ingredientName}
                      </TableCell>
                      <TableCell className="text-rose-600 font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {item.quantityAvailable}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {item.minStockAlert}
                      </TableCell>
                      <TableCell className="text-slate-600 text-right">
                        {item.unit}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setPage((p) => Math.max(1, p - 1))
                      }
                      className={
                        page === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  {Array.from(
                    { length: totalPages },
                    (_, i) => i + 1,
                  ).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        onClick={() => setPage(p)}
                        isActive={page === p}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setPage((p) =>
                          Math.min(totalPages, p + 1),
                        )
                      }
                      className={
                        page === totalPages
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
    </PageContainer>
  );
}
