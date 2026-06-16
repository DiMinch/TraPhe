import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  AlertTriangle,
  Activity,
  BarChart3,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { format, subDays } from "date-fns";
import { reportService } from "@/services/report.service";
import { orderService, type OrderResponse } from "@/services/order.service";
import { customerService } from "@/services/customer.service";
import { auditLogService } from "@/services/audit-log.service";
import { authService } from "@/services/auth.service";
import { branchStockService, type IngredientStockResponse } from "@/services/branch-stock.service";
import axiosClient from "@/lib/axios-client";
import { UserRole } from "@/enums/roles.enum";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#A0622A",
  },
  grossProfit: {
    label: "Gross Profit",
    color: "#2C1A0E",
  },
  orders: {
    label: "Orders",
    color: "#5C3317",
  },
} satisfies ChartConfig;

// Interfaces
interface DashboardStats {
  totalRevenue: number;
  revenueGrowth: number;
  grossProfit: number;
  profitMargin: number;
  totalOrders: number;
  ordersGrowth: number;
  totalCustomers: number;
  customersGrowth: number;
}

interface TopProduct {
  rank: number;
  productName: string;
  variantName: string;
  sku: string;
  quantitySold: number;
  totalRevenue: number;
}

interface LowStockItem {
  id: string;
  ingredientName: string;
  branchName?: string;
  unit: string;
  quantityAvailable: number;
  minThreshold: number;
  isOutOfStock: boolean;
}

interface PendingOrder {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  createdAt: string;
}

interface AuditLogDisplay {
  id: string;
  action: string;
  module: string;
  actorName: string;
  createdAt: string;
}

interface ChartDataPoint {
  period: string;
  revenue: number;
  grossProfit: number;
  orders: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [showRevenue, setShowRevenue] = useState(true);
  const [showGrossProfit, setShowGrossProfit] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">(
    "month",
  );

  // Track if initial load has happened
  const hasLoadedRef = useRef(false);

  // Dashboard data state
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    revenueGrowth: 0,
    grossProfit: 0,
    profitMargin: 0,
    totalOrders: 0,
    ordersGrowth: 0,
    totalCustomers: 0,
    customersGrowth: 0,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogDisplay[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  // Get current user
  const currentUser = authService.getCurrentUser();
  const isBranchManager = currentUser?.roles?.includes(UserRole.BRANCH_MANAGER) && !currentUser?.roles?.includes(UserRole.ADMIN);
  const [branchName, setBranchName] = useState<string>(currentUser?.branchName || "");

  useEffect(() => {
    const fetchBranchName = async () => {
      if (isBranchManager && currentUser?.branchId && !currentUser.branchName) {
        try {
          const res = await axiosClient.get(`/branches`);
          const all = Array.isArray(res.data) ? res.data : res.data?.content || [];
          const myBranch = all.find((b: any) => b.id === currentUser.branchId);
          if (myBranch) {
            setBranchName(myBranch.name);
          }
        } catch { /* ignore */ }
      }
    };
    fetchBranchName();
  }, [isBranchManager, currentUser?.branchId, currentUser?.branchName]);

  // Calculate date range based on selection
  const getDateRange = (range: "week" | "month" | "year") => {
    const endDate = new Date();
    let startDate: Date;
    let groupBy: "DAY" | "WEEK" | "MONTH" = "DAY";

    switch (range) {
      case "week":
        startDate = subDays(endDate, 7);
        groupBy = "DAY";
        break;
      case "month":
        startDate = subDays(endDate, 30);
        groupBy = "DAY";
        break;
      case "year":
        startDate = subDays(endDate, 365);
        groupBy = "MONTH";
        break;
      default:
        startDate = subDays(endDate, 30);
        groupBy = "DAY";
    }

    return {
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      groupBy,
    };
  };

  // Fetch all dashboard data
  const fetchDashboardData = async (
    range: "week" | "month" | "year" = timeRange,
  ) => {
    const dateRange = getDateRange(range);

    try {
      // Fetch all data in parallel
      const [
        revenueResponse,
        profitResponse,
        topProductsResponse,
        inventoryResponse,
        ordersResponse,
        customersResponse,
        auditLogsResponse,
      ] = await Promise.allSettled([
        reportService.getRevenueReport({
          ...dateRange,
          branchId: isBranchManager && currentUser?.branchId ? currentUser.branchId : undefined,
        }),
        reportService.getProfitReport({
          ...dateRange,
          branchId: isBranchManager && currentUser?.branchId ? currentUser.branchId : undefined,
        }),
        reportService.getTopProductsReport({
          ...dateRange,
          limit: 5,
          sortBy: "REVENUE",
          branchId: isBranchManager && currentUser?.branchId ? currentUser.branchId : undefined,
        }),
        branchStockService.getStock(
          isBranchManager && currentUser?.branchId ? currentUser.branchId : undefined,
          "",
          false
        ), // Get all inventory to find low stock ingredients
        orderService.getAllOrders({
          page: 0,
          size: 100,
          branchId: isBranchManager && currentUser?.branchId ? currentUser.branchId : undefined,
        }),
        customerService.getCustomerCount(),
        auditLogService.getAllAuditLogs({ size: 5 }),
      ]);

      // Process orders FIRST (we'll use this data for revenue calculation if needed)
      let calculatedRevenue = 0;
      let calculatedProfit = 0;
      let ordersInRange: OrderResponse[] = [];

      if (ordersResponse.status === "fulfilled" && ordersResponse.value.data) {
        const ordersData = ordersResponse.value.data.content || [];

        // Filter orders within date range
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999);

        ordersInRange = ordersData.filter((order: OrderResponse) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= startDate && orderDate <= endDate;
        });

        // Calculate revenue from completed/confirmed orders
        calculatedRevenue = ordersInRange
          .filter(
            (o: OrderResponse) =>
              o.status === "COMPLETED" || o.status === "CONFIRMED",
          )
          .reduce(
            (sum: number, o: OrderResponse) => sum + (o.finalAmount || 0),
            0,
          );

        // Estimate profit as ~30% of revenue (you can adjust this)
        calculatedProfit = calculatedRevenue * 0.3;

        // Calculate order stats by status
        const ordersByStatus = {
          pending: ordersData.filter(
            (o: OrderResponse) => o.status === "PENDING",
          ).length,
          confirmed: ordersData.filter(
            (o: OrderResponse) => o.status === "CONFIRMED",
          ).length,
          completed: ordersData.filter(
            (o: OrderResponse) => o.status === "COMPLETED",
          ).length,
          cancelled: ordersData.filter(
            (o: OrderResponse) => o.status === "CANCELLED",
          ).length,
        };
        setOrderStats(ordersByStatus);

        // Get pending orders for display
        const pending = ordersData
          .filter((order: OrderResponse) => order.status === "PENDING")
          .slice(0, 5)
          .map((order: OrderResponse) => ({
            id: order.orderId,
            orderNumber: order.orderNumber,
            customer: order.customerName || "Guest",
            total: order.finalAmount || 0,
            createdAt: order.createdAt,
          }));
        setPendingOrders(pending);

        setStats((prev) => ({
          ...prev,
          totalOrders: ordersData.length,
        }));

        // Calculate top products from order items
        const productSales = new Map<
          string,
          {
            productName: string;
            variantName: string;
            sku: string;
            quantitySold: number;
            totalRevenue: number;
          }
        >();
        ordersData.forEach((order: OrderResponse) => {
          if (order.items && order.items.length > 0) {
            order.items.forEach((item) => {
              const key = item.id || item.menuItemName;
              const existing = productSales.get(key) || {
                productName: item.menuItemName,
                variantName: item.sizeName || "",
                sku: item.sizeName || "Standard",
                quantitySold: 0,
                totalRevenue: 0,
              };
              productSales.set(key, {
                ...existing,
                quantitySold: existing.quantitySold + item.quantity,
                totalRevenue: existing.totalRevenue + item.subtotal,
              });
            });
          }
        });

        // Convert to top products array and sort by revenue
        const calculatedTopProducts = Array.from(productSales.values())
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 5)
          .map((product, index) => ({
            rank: index + 1,
            productName: product.productName,
            variantName: product.variantName,
            sku: product.sku,
            quantitySold: product.quantitySold,
            totalRevenue: product.totalRevenue,
          }));

        // Set top products from calculated data if API returns empty
        if (calculatedTopProducts.length > 0) {
          setTopProducts((prev) =>
            prev.length === 0 ? calculatedTopProducts : prev,
          );
        }

        // Build chart data from orders grouped by date
        const ordersByDate = new Map<
          string,
          { revenue: number; orders: number }
        >();
        ordersInRange.forEach((order: OrderResponse) => {
          const dateKey = format(new Date(order.createdAt), "yyyy-MM-dd");
          const existing = ordersByDate.get(dateKey) || {
            revenue: 0,
            orders: 0,
          };
          ordersByDate.set(dateKey, {
            revenue: existing.revenue + (order.finalAmount || 0),
            orders: existing.orders + 1,
          });
        });

        // Convert to chart data array
        const chartPoints: ChartDataPoint[] = Array.from(ordersByDate.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, data]) => ({
            period: format(
              new Date(date),
              timeRange === "year" ? "MMM" : "dd/MM",
            ),
            revenue: data.revenue,
            grossProfit: data.revenue * 0.3,
            orders: data.orders,
          }));

        if (chartPoints.length > 0) {
          setChartData(chartPoints);
        }
      }

      // Process revenue data from API (use calculated if API returns 0)
      if (
        revenueResponse.status === "fulfilled" &&
        revenueResponse.value.data
      ) {
        const revenueData = revenueResponse.value.data;
        const apiRevenue = revenueData.totalRevenue || 0;

        setStats((prev) => ({
          ...prev,
          totalRevenue: apiRevenue > 0 ? apiRevenue : calculatedRevenue,
          revenueGrowth: revenueData.comparison?.percentageChange || 0,
        }));

        // Build chart data from breakdown if API has data
        if (
          revenueData.breakdown &&
          revenueData.breakdown.length > 0 &&
          apiRevenue > 0
        ) {
          const chartPoints: ChartDataPoint[] = revenueData.breakdown.map(
            (item) => ({
              period: format(
                new Date(item.period),
                timeRange === "year" ? "MMM" : "dd/MM",
              ),
              revenue: item.revenue,
              grossProfit: 0,
              orders: item.orderCount,
            }),
          );
          setChartData(chartPoints);
        }
      } else {
        // Fallback to calculated revenue
        setStats((prev) => ({
          ...prev,
          totalRevenue: calculatedRevenue,
        }));
      }

      // Process profit data (use calculated if API returns 0)
      if (profitResponse.status === "fulfilled" && profitResponse.value.data) {
        const profitData = profitResponse.value.data;
        const apiProfit = profitData.grossProfit ?? 0;
        const totalRev = profitData.totalRevenue || calculatedRevenue || 1;
        const marginRatio = apiProfit !== 0 ? (apiProfit / totalRev) : (calculatedRevenue > 0 ? calculatedProfit / calculatedRevenue : 0.3);

        setStats((prev) => ({
          ...prev,
          grossProfit: apiProfit !== 0 ? apiProfit : calculatedProfit,
          profitMargin:
            profitData.profitMargin !== 0 ? profitData.profitMargin : (calculatedRevenue > 0 ? Math.round((calculatedProfit / calculatedRevenue) * 100) : 30),
        }));

        // Update chart data with gross profit proportional to daily revenue
        setChartData((prev) =>
          prev.map((point) => ({
            ...point,
            grossProfit: Math.round(point.revenue * marginRatio),
          })),
        );
      } else {
        const marginRatio = calculatedRevenue > 0 ? (calculatedProfit / calculatedRevenue) : 0.3;
        setStats((prev) => ({
          ...prev,
          grossProfit: calculatedProfit,
          profitMargin: calculatedRevenue > 0 ? Math.round((calculatedProfit / calculatedRevenue) * 100) : 30,
        }));

        // Update chart data with gross profit proportional to daily revenue
        setChartData((prev) =>
          prev.map((point) => ({
            ...point,
            grossProfit: Math.round(point.revenue * marginRatio),
          })),
        );
      }

      // Process top products (use calculated from orders if API returns empty)
      if (
        topProductsResponse.status === "fulfilled" &&
        topProductsResponse.value.data
      ) {
        const topProductsData =
          topProductsResponse.value.data.topProducts || [];
        if (topProductsData.length > 0) {
          setTopProducts(topProductsData);
        }
        // If API returns empty, the calculated products from orders will be used (set earlier)
      }

      // Process inventory (low stock ingredients first)
      if (
        inventoryResponse.status === "fulfilled" &&
        inventoryResponse.value.data
      ) {
        const inventoryData = inventoryResponse.value.data as any;
        const allItems = Array.isArray(inventoryData) ? inventoryData : (inventoryData?.content || []);

        // Get actual low stock items only
        const lowStock = allItems
          .filter((item: IngredientStockResponse) => item.isLowStock || item.quantityAvailable <= 0)
          .slice(0, 5)
          .map((item: IngredientStockResponse) => ({
            id: item.id,
            ingredientName: item.ingredientName,
            branchName: item.branchName,
            unit: item.unit,
            quantityAvailable: item.quantityAvailable,
            minThreshold: item.minStockAlert,
            isOutOfStock: item.quantityAvailable <= 0,
          }));

        setLowStockItems(lowStock);
      }

      // Process customers
      if (
        customersResponse.status === "fulfilled" &&
        customersResponse.value.data !== undefined
      ) {
        const count = typeof customersResponse.value.data === "number"
          ? customersResponse.value.data
          : (customersResponse.value.data as any)?.data || 0;
        setStats((prev) => ({
          ...prev,
          totalCustomers: count,
        }));
      }


      // Process audit logs
      if (
        auditLogsResponse.status === "fulfilled" &&
        auditLogsResponse.value.data
      ) {
        const logsData = Array.isArray(auditLogsResponse.value.data)
          ? auditLogsResponse.value.data
          : (auditLogsResponse.value.data as { content?: AuditLogDisplay[] })
              ?.content || [];
        const logs = logsData.slice(0, 5).map((log) => ({
          id: log.id || String(Math.random()),
          action: log.action,
          module: log.module,
          actorName: log.actorName || "System",
          createdAt: log.createdAt,
        }));
        setAuditLogs(logs);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // Initial load - only once
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadData = async () => {
      setLoading(true);
      await fetchDashboardData(timeRange);
      setLoading(false);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle time range change
  const handleTimeRangeChange = async (newRange: "week" | "month" | "year") => {
    setTimeRange(newRange);
    setRefreshing(true);
    await fetchDashboardData(newRange);
    setRefreshing(false);
  };

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData(timeRange);
    setRefreshing(false);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M đ`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K đ`;
    }
    return `${value.toLocaleString()}đ`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-admin-bg text-on-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-mist animate-pulse"></div>
            <Loader2 className="w-8 h-8 animate-spin text-roast absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-dust font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-admin-bg text-on-background font-ui-body text-ui-body">
      <div className="px-space-8 py-space-6 max-w-[1440px] mx-auto">
        <div className="mb-space-6">
          <h2 className="font-ui-heading text-ui-heading text-ink">
            Dashboard Overview
          </h2>
          <p className="text-sm text-dust mt-1">
            Welcome back, {currentUser?.fullName || "User"}
            {isBranchManager && branchName && ` (${branchName})`}.
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-space-4 mb-space-6">
          <div className="flex items-center gap-space-3">
            <Button
              variant="outline"
              className="border-admin-border text-sm text-dust hover:text-roast hover:border-roast bg-admin-surface"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Activity className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-40 h-9 text-sm bg-admin-surface border-admin-border text-ink">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

      {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-6 mb-space-8">
        {/* Revenue Card */}
        <Card className="bg-admin-surface border border-admin-border rounded-lg shadow-sm">
          <CardContent className="p-space-6 flex flex-row sm:flex-col xl:flex-row items-center sm:items-start xl:items-center justify-between gap-space-4">
            <div className="w-10 h-10 rounded-full bg-caramel/10 flex items-center justify-center text-caramel flex-shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-dust text-sm font-medium">Today Revenue</p>
              <p className="font-pos-total text-pos-total text-ink">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <Badge
              className={`border-0 ${stats.revenueGrowth >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
            >
              {stats.revenueGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {Math.abs(stats.revenueGrowth).toFixed(1)}%
            </Badge>
          </CardContent>
        </Card>

        {/* Gross Profit Card */}
        <Card className="bg-admin-surface border border-admin-border rounded-lg shadow-sm">
          <CardContent className="p-space-6 flex flex-row sm:flex-col xl:flex-row items-center sm:items-start xl:items-center justify-between gap-space-4">
            <div className="w-10 h-10 rounded-full bg-roast/10 flex items-center justify-center text-roast flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-dust text-sm font-medium">Gross Profit</p>
              <p className="font-pos-total text-pos-total text-ink">
                {formatCurrency(stats.grossProfit)}
              </p>
            </div>
            <Badge className="bg-cream text-roast border-0">
              {stats.profitMargin.toFixed(1)}% margin
            </Badge>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card className="bg-admin-surface border border-admin-border rounded-lg shadow-sm">
          <CardContent className="p-space-6 flex flex-row sm:flex-col xl:flex-row items-center sm:items-start xl:items-center justify-between gap-space-4">
            <div className="w-10 h-10 rounded-full bg-roast/10 flex items-center justify-center text-roast flex-shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-dust text-sm font-medium">Active Orders</p>
              <p className="font-pos-total text-pos-total text-ink">
                {stats.totalOrders.toLocaleString()}
              </p>
            </div>
            <Badge className="bg-cream text-roast border-0">
              {orderStats.pending} pending
            </Badge>
          </CardContent>
        </Card>

        {/* Customers Card */}
        <Card className="bg-admin-surface border border-admin-border rounded-lg shadow-sm">
          <CardContent className="p-space-6 flex flex-row sm:flex-col xl:flex-row items-center sm:items-start xl:items-center justify-between gap-space-4">
            <div className="w-10 h-10 rounded-full bg-caramel/10 flex items-center justify-center text-caramel flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-dust text-sm font-medium">Total Customers</p>
              <p className="font-pos-total text-pos-total text-ink">
                {stats.totalCustomers.toLocaleString()}
              </p>
            </div>
            <Badge className="bg-cream text-roast border-0">Active</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Order Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-6 mb-space-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-8 bg-admin-surface border border-admin-border rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-ink flex items-center gap-2">
              <div className="p-2 bg-caramel/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-caramel" />
              </div>
              Weekly Revenue
            </CardTitle>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-dust cursor-pointer hover:text-ink transition-colors">
                <Checkbox
                  checked={showRevenue}
                  onCheckedChange={(c) => setShowRevenue(c as boolean)}
                  className="data-[state=checked]:bg-caramel data-[state=checked]:border-caramel"
                />
                Revenue
              </label>
              <label className="flex items-center gap-2 text-sm text-dust cursor-pointer hover:text-ink transition-colors">
                <Checkbox
                  checked={showGrossProfit}
                  onCheckedChange={(c) => setShowGrossProfit(c as boolean)}
                  className="data-[state=checked]:bg-roast data-[state=checked]:border-roast"
                />
                Profit
              </label>
            </div>
          </CardHeader>
          <CardContent className="pb-space-4">
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E2DDD7"
                  />
                  <XAxis
                    dataKey="period"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                    stroke="#8C7B6E"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                    tickFormatter={(v) => {
                      if (v >= 1000000) {
                        const div = v / 1000000;
                        return `${div % 1 === 0 ? div.toFixed(0) : div.toFixed(1)}Mđ`;
                      }
                      if (v >= 1000) {
                        const div = v / 1000;
                        return `${div % 1 === 0 ? div.toFixed(0) : div.toFixed(1)}Kđ`;
                      }
                      return `${v}đ`;
                    }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {showRevenue && (
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#A0622A"
                      strokeWidth={3}
                      dot={{ fill: "#A0622A", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {showGrossProfit && (
                    <Line
                      type="monotone"
                      dataKey="grossProfit"
                      stroke="#5C3317"
                      strokeWidth={3}
                      dot={{ fill: "#5C3317", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-dust">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-8 h-8 text-dust" />
                  </div>
                  <p className="font-medium">
                    No data available for the selected period
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Status Breakdown */}
        <Card className="lg:col-span-4 bg-admin-surface border border-admin-border rounded-lg shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-ink flex items-center gap-2">
              <div className="p-2 bg-roast/10 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-roast" />
              </div>
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-space-3">
            <div className="flex items-center justify-between p-space-4 bg-surface-container-low rounded-lg border border-admin-border">
              <div className="flex items-center gap-space-3">
                <div className="p-2 bg-cream rounded-lg">
                  <Clock className="w-5 h-5 text-roast" />
                </div>
                <span className="text-sm font-semibold text-ink">Pending</span>
              </div>
              <Badge className="bg-cream text-roast border-0 font-bold">
                {orderStats.pending}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-space-4 bg-surface-container-low rounded-lg border border-admin-border">
              <div className="flex items-center gap-space-3">
                <div className="p-2 bg-cream rounded-lg">
                  <Package className="w-5 h-5 text-roast" />
                </div>
                <span className="text-sm font-semibold text-ink">
                  Confirmed
                </span>
              </div>
              <Badge className="bg-cream text-roast border-0 font-bold">
                {orderStats.confirmed}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-space-4 bg-surface-container-low rounded-lg border border-admin-border">
              <div className="flex items-center gap-space-3">
                <div className="p-2 bg-cream rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-roast" />
                </div>
                <span className="text-sm font-semibold text-ink">
                  Completed
                </span>
              </div>
              <Badge className="bg-cream text-roast border-0 font-bold">
                {orderStats.completed}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-space-4 bg-surface-container-low rounded-lg border border-admin-border">
              <div className="flex items-center gap-space-3">
                <div className="p-2 bg-cream rounded-lg">
                  <XCircle className="w-5 h-5 text-roast" />
                </div>
                <span className="text-sm font-semibold text-ink">
                  Cancelled
                </span>
              </div>
              <Badge className="bg-cream text-roast border-0 font-bold">
                {orderStats.cancelled}
              </Badge>
            </div>
            <Button
              variant="outline"
              className="w-full mt-3 rounded-lg border-admin-border hover:bg-surface-container-low text-dust hover:text-roast"
              onClick={() => navigate("/admin/orders")}
            >
              <Eye className="w-4 h-4 mr-2" />
              View All Orders
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Products + Low Stock Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-6 mb-space-8">
        {/* Top Products */}
        <Card className="bg-admin-surface border border-admin-border rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold text-ink flex items-center gap-2">
              <div className="p-2 bg-caramel/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-caramel" />
              </div>
              Top Selling Products
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-caramel hover:text-roast hover:bg-surface-container-low rounded-lg font-medium"
              onClick={() => navigate("/reports/top-products")}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="px-space-6 pb-space-6 pt-0">
            <div className="rounded-lg border border-admin-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-container-low hover:bg-surface-container-low border-b border-admin-border">
                    <TableHead className="py-4 text-xs font-semibold text-dust w-12">
                      #
                    </TableHead>
                    <TableHead className="py-4 text-xs font-semibold text-dust">
                      Product
                    </TableHead>
                    <TableHead className="py-4 text-right text-xs font-semibold text-dust">
                      Sold
                    </TableHead>
                    <TableHead className="py-4 text-right text-xs font-semibold text-dust">
                      Revenue
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow
                      key={`${product.productName}-${product.sku || ""}-${index}`}
                      className="border-admin-border/60 hover:bg-surface-container-low transition-colors"
                    >
                      <TableCell className="py-4">
                        <Badge
                          variant={product.rank === 1 ? "default" : "outline"}
                          className={`font-bold ${product.rank === 1 ? "bg-roast text-white border-0" : product.rank === 2 ? "bg-cream text-roast border-0" : product.rank === 3 ? "bg-parchment text-roast border-0" : ""}`}
                        >
                          {product.rank}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div>
                          <p className="font-semibold text-ink text-sm line-clamp-1">
                            {product.productName}
                          </p>
                          <p className="text-xs text-dust">
                            {product.variantName || product.sku}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-right font-bold text-ink">
                        {product.quantitySold.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-4 text-right font-bold text-roast">
                        {formatCurrency(product.totalRevenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {topProducts.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-12 text-center text-dust"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center mx-auto mb-3">
                          <Package className="w-7 h-7 text-dust" />
                        </div>
                        <p className="font-medium">No sales data available</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="bg-admin-surface border border-admin-border rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold text-ink flex items-center gap-2">
              <div className="p-2 bg-error-container rounded-lg">
                <AlertTriangle className="w-5 h-5 text-error" />
              </div>
              Low Stock Alert
              {lowStockItems.length > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 bg-error text-white border-0"
                >
                  {lowStockItems.length}
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-caramel hover:text-roast hover:bg-surface-container-low rounded-lg font-medium"
              onClick={() => navigate("/admin/stock/all")}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="px-space-6 pb-space-6 pt-0">
            <div className="rounded-lg border border-admin-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-container-low hover:bg-surface-container-low border-b border-admin-border">
                    <TableHead className="py-4 text-xs font-semibold text-dust">
                      Ingredient
                    </TableHead>
                    <TableHead className="py-4 text-xs font-semibold text-dust">
                      Unit
                    </TableHead>
                    <TableHead className="py-4 text-right text-xs font-semibold text-dust">
                      Stock
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-admin-border/60 hover:bg-error-container/40 transition-colors"
                    >
                      <TableCell className="py-4">
                        <p className="font-semibold text-ink text-sm line-clamp-1">
                          {item.ingredientName}
                        </p>
                        {item.branchName && (
                          <p className="text-xs text-dust">
                            {item.branchName}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs bg-surface-container-low"
                        >
                          {item.unit}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <Badge
                          variant={
                            item.isOutOfStock ? "destructive" : "secondary"
                          }
                          className={`font-bold ${item.isOutOfStock ? "bg-error text-white" : "bg-cream text-roast"}`}
                        >
                          {item.quantityAvailable} / {item.minThreshold}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {lowStockItems.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="py-12 text-center text-dust"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center mx-auto mb-3">
                          <CheckCircle2 className="w-7 h-7 text-roast" />
                        </div>
                        <p className="font-medium text-roast">
                          All items are well stocked
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Orders + Audit Logs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-6">
        {/* Pending Orders */}
        <Card className="bg-admin-surface border border-admin-border rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold text-ink flex items-center gap-2">
              <div className="p-2 bg-cream rounded-lg">
                <Clock className="w-5 h-5 text-roast" />
              </div>
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="px-space-6 pb-space-6 pt-0">
            <div className="space-y-space-3">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-space-4 bg-surface-container-low rounded-lg border border-admin-border hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/sales/orders`)}
                >
                  <div>
                    <p className="font-semibold text-ink text-sm">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-dust">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-roast">
                      {formatCurrency(order.total)}
                    </p>
                    <p className="text-xs text-dust">
                      {order.createdAt
                        ? format(new Date(order.createdAt), "dd/MM HH:mm")
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
              {pendingOrders.length === 0 && (
                <div className="py-10 text-center text-dust">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-7 h-7 text-roast" />
                  </div>
                  <p className="font-medium text-roast">
                    No pending orders
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card className="bg-admin-surface border border-admin-border rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold text-ink flex items-center gap-2">
              <div className="p-2 bg-cream rounded-lg">
                <Activity className="w-5 h-5 text-roast" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="px-space-6 pb-space-6 pt-0">
            <div className="space-y-space-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-space-4 bg-surface-container-low rounded-lg border border-admin-border"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-roast mt-2 shrink-0 shadow-sm"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink font-medium">
                      <span className="text-roast font-semibold">
                        {log.actorName}
                      </span>{" "}
                      {log.action.toLowerCase()} in{" "}
                      <span className="text-dust">{log.module}</span>
                    </p>
                    <p className="text-xs text-dust mt-1">
                      {log.createdAt
                        ? format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="py-10 text-center text-dust">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-7 h-7 text-dust" />
                  </div>
                  <p className="font-medium">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
