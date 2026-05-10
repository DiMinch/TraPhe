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
  Wrench,
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
import { warrantyService } from "@/services/warranty.service";
import { customerService } from "@/services/customer.service";
import { auditLogService } from "@/services/audit-log.service";
import { authService } from "@/services/auth.service";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";
import type { WarrantyTicket } from "@/types/warranty.types";
import type { Customer } from "@/types/customer.types";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#6366f1",
  },
  grossProfit: {
    label: "Gross Profit",
    color: "#10b981",
  },
  orders: {
    label: "Orders",
    color: "#f59e0b",
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
  productName: string;
  variantName: string;
  sku: string;
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

interface WarrantyTicketDisplay {
  id: string;
  ticketNumber: string;
  customerName: string;
  status: string;
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
  const [warrantyTickets, setWarrantyTickets] = useState<
    WarrantyTicketDisplay[]
  >([]);
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
        warrantyResponse,
        auditLogsResponse,
      ] = await Promise.allSettled([
        reportService.getRevenueReport(dateRange),
        reportService.getProfitReport(dateRange),
        reportService.getTopProductsReport({
          ...dateRange,
          limit: 5,
          sortBy: "REVENUE",
        }),
        reportService.getInventoryReport({}), // Get all inventory, not just low stock
        orderService.getAllOrders({ page: 0, size: 100 }),
        customerService.getCustomers(),
        warrantyService.getAllTickets(),
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
            id: order.id,
            orderNumber: order.orderNumber,
            customer: order.customer?.fullName || order.guestName || "Guest",
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
              const key = item.productVariantId || item.sku;
              const existing = productSales.get(key) || {
                productName: item.productName,
                variantName: item.variantName || "",
                sku: item.sku,
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
        const apiProfit = profitData.grossProfit || 0;

        setStats((prev) => ({
          ...prev,
          grossProfit: apiProfit > 0 ? apiProfit : calculatedProfit,
          profitMargin:
            profitData.profitMargin || (calculatedRevenue > 0 ? 30 : 0),
        }));

        // Update chart data with gross profit
        if (apiProfit > 0) {
          setChartData((prev) =>
            prev.map((point) => ({
              ...point,
              grossProfit:
                prev.length > 0 ? Math.round(apiProfit / prev.length) : 0,
            })),
          );
        }
      } else {
        setStats((prev) => ({
          ...prev,
          grossProfit: calculatedProfit,
          profitMargin: calculatedRevenue > 0 ? 30 : 0,
        }));
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

      // Process inventory (low stock items first, then all items if none are low)
      if (
        inventoryResponse.status === "fulfilled" &&
        inventoryResponse.value.data
      ) {
        const inventoryData = inventoryResponse.value.data;
        const allItems = inventoryData.items || [];

        // First try to get low stock items
        let lowStock = allItems
          .filter((item) => item.isLowStock || item.isOutOfStock)
          .slice(0, 5)
          .map((item) => ({
            id: item.productVariantId,
            productName: item.productName,
            variantName: item.variantName,
            sku: item.sku,
            quantityAvailable: item.quantityAvailable,
            minThreshold: item.minThreshold,
            isOutOfStock: item.isOutOfStock,
          }));

        // If no low stock items, show items with lowest stock
        if (lowStock.length === 0 && allItems.length > 0) {
          lowStock = allItems
            .sort((a, b) => a.quantityAvailable - b.quantityAvailable)
            .slice(0, 5)
            .map((item) => ({
              id: item.productVariantId,
              productName: item.productName,
              variantName: item.variantName,
              sku: item.sku,
              quantityAvailable: item.quantityAvailable,
              minThreshold: item.minThreshold,
              isOutOfStock: item.quantityAvailable === 0,
            }));
        }

        setLowStockItems(lowStock);
      }

      // Process customers
      if (
        customersResponse.status === "fulfilled" &&
        customersResponse.value.data
      ) {
        const customersData = Array.isArray(customersResponse.value.data)
          ? customersResponse.value.data
          : (customersResponse.value.data as { content?: Customer[] })
              ?.content || [];
        setStats((prev) => ({
          ...prev,
          totalCustomers: customersData.length,
        }));
      }

      // Process warranty tickets
      if (
        warrantyResponse.status === "fulfilled" &&
        warrantyResponse.value.data
      ) {
        const ticketsData = Array.isArray(warrantyResponse.value.data)
          ? warrantyResponse.value.data
          : [];
        const tickets = ticketsData
          .slice(0, 5)
          .map((ticket: WarrantyTicket) => ({
            id: ticket.id,
            ticketNumber: ticket.ticketNumber,
            customerName: ticket.customerName || "Unknown",
            status: ticket.status?.replace(/_/g, " ") || "Unknown",
            createdAt: ticket.createdAt,
          }));
        setWarrantyTickets(tickets);
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
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-slate-200 animate-pulse"></div>
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${currentUser?.fullName || "User"}! Here's your business overview.`}
        onRefresh={handleRefresh}
        isLoading={refreshing}
      />

      {/* Time Range Selector */}
      <div className="flex justify-end mb-6">
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-36 h-9 text-sm bg-white border-slate-200">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-8">
        {/* Revenue Card */}
        <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <DollarSign className="w-6 h-6" />
              </div>
              <Badge
                className={`${stats.revenueGrowth >= 0 ? "bg-emerald-400/30 text-emerald-100" : "bg-red-400/30 text-red-100"} border-0 backdrop-blur-sm`}
              >
                {stats.revenueGrowth >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {Math.abs(stats.revenueGrowth).toFixed(1)}%
              </Badge>
            </div>
            <p className="text-indigo-100 text-sm font-medium mb-1">
              Total Revenue
            </p>
            <p className="text-3xl font-bold tracking-tight">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </CardContent>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        </Card>

        {/* Gross Profit Card */}
        <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                {stats.profitMargin.toFixed(1)}% margin
              </Badge>
            </div>
            <p className="text-emerald-100 text-sm font-medium mb-1">
              Gross Profit
            </p>
            <p className="text-3xl font-bold tracking-tight">
              {formatCurrency(stats.grossProfit)}
            </p>
          </CardContent>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        </Card>

        {/* Orders Card */}
        <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 text-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                {orderStats.pending} pending
              </Badge>
            </div>
            <p className="text-amber-100 text-sm font-medium mb-1">
              Total Orders
            </p>
            <p className="text-3xl font-bold tracking-tight">
              {stats.totalOrders.toLocaleString()}
            </p>
          </CardContent>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        </Card>

        {/* Customers Card */}
        <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-500 via-purple-600 to-violet-600 text-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users className="w-6 h-6" />
              </div>
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                Active
              </Badge>
            </div>
            <p className="text-purple-100 text-sm font-medium mb-1">
              Total Customers
            </p>
            <p className="text-3xl font-bold tracking-tight">
              {stats.totalCustomers.toLocaleString()}
            </p>
          </CardContent>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        </Card>
      </div>

      {/* Chart + Order Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 mb-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-8 shadow-xl border-0 bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              Revenue Trends
            </CardTitle>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-800 transition-colors">
                <Checkbox
                  checked={showRevenue}
                  onCheckedChange={(c) => setShowRevenue(c as boolean)}
                  className="data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                />
                Revenue
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-800 transition-colors">
                <Checkbox
                  checked={showGrossProfit}
                  onCheckedChange={(c) => setShowGrossProfit(c as boolean)}
                  className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
                Profit
              </label>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="period"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                    stroke="#94a3b8"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                    stroke="#94a3b8"
                    tickFormatter={(v) =>
                      `${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}đ`
                    }
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {showRevenue && (
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {showGrossProfit && (
                    <Line
                      type="monotone"
                      dataKey="grossProfit"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-8 h-8 opacity-50" />
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
        <Card className="lg:col-span-4 shadow-xl border-0 bg-white rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-amber-600" />
              </div>
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl border border-amber-200/50 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-200/50 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  Pending
                </span>
              </div>
              <Badge className="bg-amber-500 text-white hover:bg-amber-500 border-0 px-3 py-1 font-bold">
                {orderStats.pending}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-200/50 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  Confirmed
                </span>
              </div>
              <Badge className="bg-blue-500 text-white hover:bg-blue-500 border-0 px-3 py-1 font-bold">
                {orderStats.confirmed}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200/50 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-200/50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  Completed
                </span>
              </div>
              <Badge className="bg-emerald-500 text-white hover:bg-emerald-500 border-0 px-3 py-1 font-bold">
                {orderStats.completed}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100/50 rounded-xl border border-red-200/50 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-200/50 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  Cancelled
                </span>
              </div>
              <Badge className="bg-red-500 text-white hover:bg-red-500 border-0 px-3 py-1 font-bold">
                {orderStats.cancelled}
              </Badge>
            </div>
            <Button
              variant="outline"
              className="w-full mt-3 rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium"
              onClick={() => navigate("/sales/orders")}
            >
              <Eye className="w-4 h-4 mr-2" />
              View All Orders
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Products + Low Stock Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 mb-8">
        {/* Top Products */}
        <Card className="shadow-xl border-0 bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              Top Selling Products
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg font-medium"
              onClick={() => navigate("/reports/top-products")}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0 px-6 pb-5">
            <div className="rounded-xl border border-slate-200/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/50 hover:bg-slate-50 border-b border-slate-200">
                    <TableHead className="py-3 text-xs font-semibold text-slate-600 w-12">
                      #
                    </TableHead>
                    <TableHead className="py-3 text-xs font-semibold text-slate-600">
                      Product
                    </TableHead>
                    <TableHead className="py-3 text-right text-xs font-semibold text-slate-600">
                      Sold
                    </TableHead>
                    <TableHead className="py-3 text-right text-xs font-semibold text-slate-600">
                      Revenue
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product) => (
                    <TableRow
                      key={product.sku}
                      className="border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell className="py-3">
                        <Badge
                          variant={product.rank === 1 ? "default" : "outline"}
                          className={`font-bold ${product.rank === 1 ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-500 shadow-sm" : product.rank === 2 ? "bg-slate-200 text-slate-700 border-0" : product.rank === 3 ? "bg-amber-100 text-amber-700 border-0" : ""}`}
                        >
                          {product.rank}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <div>
                          <p className="font-semibold text-slate-700 text-sm line-clamp-1">
                            {product.productName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {product.variantName || product.sku}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-right font-bold text-slate-700">
                        {product.quantitySold.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-3 text-right font-bold text-emerald-600">
                        {formatCurrency(product.totalRevenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {topProducts.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-12 text-center text-slate-400"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                          <Package className="w-7 h-7 opacity-50" />
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
        <Card className="shadow-xl border-0 bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              Low Stock Alert
              {lowStockItems.length > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 bg-red-500 shadow-sm"
                >
                  {lowStockItems.length}
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg font-medium"
              onClick={() => navigate("/inventory/all")}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0 px-6 pb-5">
            <div className="rounded-xl border border-slate-200/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/50 hover:bg-slate-50 border-b border-slate-200">
                    <TableHead className="py-3 text-xs font-semibold text-slate-600">
                      Product
                    </TableHead>
                    <TableHead className="py-3 text-xs font-semibold text-slate-600">
                      SKU
                    </TableHead>
                    <TableHead className="py-3 text-right text-xs font-semibold text-slate-600">
                      Stock
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-slate-100 hover:bg-red-50/50 transition-colors"
                    >
                      <TableCell className="py-3">
                        <div>
                          <p className="font-semibold text-slate-700 text-sm line-clamp-1">
                            {item.productName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {item.variantName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs bg-slate-50"
                        >
                          {item.sku}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <Badge
                          variant={
                            item.isOutOfStock ? "destructive" : "secondary"
                          }
                          className={`font-bold ${item.isOutOfStock ? "bg-red-500" : "bg-amber-100 text-amber-700"}`}
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
                        className="py-12 text-center text-slate-400"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                          <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                        </div>
                        <p className="font-medium text-emerald-600">
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

      {/* Pending Orders + Warranty Tickets + Audit Logs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {/* Pending Orders */}
        <Card className="shadow-xl border-0 bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-5 pb-5">
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/50 hover:shadow-md hover:border-slate-300/50 transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/sales/orders`)}
                >
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-slate-500">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-600">
                      {formatCurrency(order.total)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {order.createdAt
                        ? format(new Date(order.createdAt), "dd/MM HH:mm")
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
              {pendingOrders.length === 0 && (
                <div className="py-10 text-center text-slate-400">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                  </div>
                  <p className="font-medium text-emerald-600">
                    No pending orders
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Warranty Tickets */}
        <Card className="shadow-xl border-0 bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Wrench className="w-5 h-5 text-purple-600" />
              </div>
              Recent Warranty Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-5 pb-5">
            <div className="space-y-3">
              {warrantyTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/50 hover:shadow-md hover:border-slate-300/50 transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/warranty/tickets`)}
                >
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">
                      {ticket.ticketNumber}
                    </p>
                    <p className="text-xs text-slate-500">
                      {ticket.customerName}
                    </p>
                  </div>
                  <Badge
                    className={`text-xs font-medium ${
                      ticket.status.toLowerCase().includes("completed")
                        ? "bg-emerald-100 text-emerald-700"
                        : ticket.status.toLowerCase().includes("progress")
                          ? "bg-blue-100 text-blue-700"
                          : ticket.status.toLowerCase().includes("pending")
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                    } border-0`}
                  >
                    {ticket.status}
                  </Badge>
                </div>
              ))}
              {warrantyTickets.length === 0 && (
                <div className="py-10 text-center text-slate-400">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Wrench className="w-7 h-7 opacity-50" />
                  </div>
                  <p className="font-medium">No warranty tickets</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card className="shadow-xl border-0 bg-white rounded-2xl md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Activity className="w-5 h-5 text-indigo-600" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-5 pb-5">
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/50"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-2 shrink-0 shadow-sm"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 font-medium">
                      <span className="text-indigo-600 font-semibold">
                        {log.actorName}
                      </span>{" "}
                      {log.action.toLowerCase()} in{" "}
                      <span className="text-slate-500">{log.module}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {log.createdAt
                        ? format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="py-10 text-center text-slate-400">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-7 h-7 opacity-50" />
                  </div>
                  <p className="font-medium">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
