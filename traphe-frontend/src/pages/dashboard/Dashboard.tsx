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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ChevronDown,
  Bell,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Wrench,
  AlertTriangle,
  Activity,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { CURRENT_USER } from "@/constants/user";
import { useState, useEffect } from "react";
import { dashboardService } from "@/services/dashboard.service";
import { warrantyService } from "@/services/warranty.service";
import type {
  WarrantyDashboardStats,
  WarrantyTicket,
} from "@/types/warranty.types";
import type { OrderResponse } from "@/services/order.service";
import type { InventoryResponse } from "@/services/inventory.service";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#f97316",
  },
  grossProfit: {
    label: "Gross Profit",
    color: "#14b8a6",
  },
} satisfies ChartConfig;

// Interfaces for dashboard data
interface TopSellingProduct {
  id: string;
  product: string;
  totalOrders: number;
  totalSales: string;
}

interface LowStockItem {
  id: string;
  product: string;
  quantity: number;
}

interface PendingOrder {
  id: string;
  customer: string;
  total: string;
}

interface WarrantyTicketDisplay {
  id: string;
  technician: string;
  status: string;
}

interface AuditLogDisplay {
  text: string;
  time: string;
}

interface ChartDataPoint {
  month: string;
  revenue: number;
  grossProfit: number;
}

export default function DashboardPage() {
  const [showRevenue, setShowRevenue] = useState(true);
  const [showGrossProfit, setShowGrossProfit] = useState(true);
  const [loading, setLoading] = useState(true);

  // State for dashboard data
  const [revenue, setRevenue] = useState(0);
  const [grossProfit, setGrossProfit] = useState(0);
  const [topSellingProducts, setTopSellingProducts] = useState<
    TopSellingProduct[]
  >([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [warrantyTickets, setWarrantyTickets] = useState<
    WarrantyTicketDisplay[]
  >([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogDisplay[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch warranty dashboard stats (includes revenue)
        const warrantyDashboard = await warrantyService.getDashboardStats();
        if (warrantyDashboard.data) {
          const stats = warrantyDashboard.data;
          setRevenue(stats.totalRevenue || 0);
          setGrossProfit(stats.totalServiceRevenue || 0);
        }

        // Fetch inventory for low stock items
        const inventoryResponse = await dashboardService.getLowStockItems();
        if (inventoryResponse.data) {
          const lowStock = inventoryResponse.data
            .filter(
              (item: InventoryResponse) =>
                item.quantityAvailable <= item.minThreshold,
            )
            .slice(0, 5)
            .map((item: InventoryResponse) => ({
              id: item.id,
              product:
                `${item.productVariant?.productName || ""} ${item.productVariant?.variantName || ""}`.trim(),
              quantity: item.quantityAvailable,
            }));
          setLowStockItems(lowStock);
        }

        // Fetch pending orders
        const ordersResponse = await dashboardService.getRecentOrders();
        if (ordersResponse.data?.content) {
          // Filter pending orders
          const pending = ordersResponse.data.content
            .filter((order: OrderResponse) => order.status === "PENDING")
            .slice(0, 5)
            .map((order: OrderResponse) => ({
              id: order.orderNumber,
              customer: order.customer?.fullName || order.guestName || "Guest",
              total: `$ ${order.finalAmount?.toLocaleString() || 0}`,
            }));
          setPendingOrders(pending);

          // Calculate top selling products from orders
          const productSales: Record<
            string,
            { orders: number; sales: number; name: string }
          > = {};
          ordersResponse.data.content.forEach((order: OrderResponse) => {
            order.items?.forEach((item) => {
              const key = item.productVariantId;
              if (!productSales[key]) {
                productSales[key] = {
                  orders: 0,
                  sales: 0,
                  name: item.productName || item.variantName || "Unknown",
                };
              }
              productSales[key].orders += item.quantity;
              productSales[key].sales += item.subtotal;
            });
          });

          const topProducts = Object.entries(productSales)
            .sort((a, b) => b[1].sales - a[1].sales)
            .slice(0, 5)
            .map(([id, data], index) => ({
              id: `P${String(index + 1).padStart(4, "0")}`,
              product: data.name,
              totalOrders: data.orders,
              totalSales: `$ ${data.sales.toLocaleString()}`,
            }));
          setTopSellingProducts(topProducts);
        }

        // Fetch warranty tickets
        const ticketsResponse = await warrantyService.getAllTickets();
        if (ticketsResponse.data) {
          const tickets = (ticketsResponse.data as WarrantyTicket[])
            .slice(0, 5)
            .map((ticket: WarrantyTicket) => ({
              id: ticket.ticketNumber,
              technician: ticket.technicianName || "Unassigned",
              status: ticket.status?.replace(/_/g, " ") || "Unknown",
            }));
          setWarrantyTickets(tickets);
        }

        // Generate chart data from monthly aggregation (simplified)
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        const mockChartData = months.map((month) => ({
          month,
          revenue: Math.floor(Math.random() * 50) + 10,
          grossProfit: Math.floor(Math.random() * 30) + 5,
        }));
        setChartData(mockChartData);

        // Set audit logs (placeholder - would need actual audit log endpoint)
        setAuditLogs([
          { text: "System initialized", time: new Date().toLocaleString() },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-slate-200 animate-pulse"></div>
            <Loader2 className="w-8 h-8 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-slate-100">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-slate-600 font-medium">
              {CURRENT_USER.role} • {CURRENT_USER.name}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              3
            </span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </Button>
        </div>
      </div>

      {/* Key Metrics + Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mb-6">
        {/* Key Metrics Card */}
        <Card className="lg:col-span-4 xl:col-span-3 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800">
              <BarChart3 className="w-5 h-5 text-primary" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {/* Revenue Card */}
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium opacity-90">
                    Revenue
                  </span>
                </div>
                <Checkbox
                  checked={showRevenue}
                  onCheckedChange={(checked) =>
                    setShowRevenue(checked as boolean)
                  }
                  className="w-5 h-5 border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-orange-500"
                />
              </div>
              <div className="text-3xl font-bold mt-3">
                $ {revenue.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm opacity-90">
                <TrendingUp className="w-4 h-4" />
                <span>From warranty services</span>
              </div>
            </div>

            {/* Gross Profit Card */}
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium opacity-90">
                    Gross Profit
                  </span>
                </div>
                <Checkbox
                  checked={showGrossProfit}
                  onCheckedChange={(checked) =>
                    setShowGrossProfit(checked as boolean)
                  }
                  className="w-5 h-5 border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-teal-500"
                />
              </div>
              <div className="text-3xl font-bold mt-3">
                $ {grossProfit.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm opacity-90">
                <Activity className="w-4 h-4" />
                <span>Service revenue</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Card */}
        <Card className="lg:col-span-8 xl:col-span-9 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-slate-800">
              Revenue Trends
            </CardTitle>
            <Select defaultValue="month">
              <SelectTrigger className="w-32 h-9 text-sm border-slate-200 focus:ring-primary">
                <SelectValue placeholder="By Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">By Month</SelectItem>
                <SelectItem value="week">By Week</SelectItem>
                <SelectItem value="year">By Year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="pb-4">
            <ChartContainer
              config={chartConfig}
              className="h-48 md:h-56 w-full"
            >
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="month"
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
                  domain={[0, "auto"]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                {showRevenue && (
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ fill: "#f97316", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#f97316" }}
                  />
                )}
                {showGrossProfit && (
                  <Line
                    type="monotone"
                    dataKey="grossProfit"
                    stroke="#14b8a6"
                    strokeWidth={3}
                    dot={{ fill: "#14b8a6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#14b8a6" }}
                  />
                )}
              </LineChart>
            </ChartContainer>
            <div className="flex items-center justify-center gap-6 text-sm mt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-slate-700 font-medium">Revenue</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 rounded-full">
                <div className="w-3 h-3 rounded-full bg-teal-500" />
                <span className="text-slate-700 font-medium">Gross Profit</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Categories + Top Selling Products Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mb-6">
        {/* Top Selling Categories */}
        <Card className="lg:col-span-5 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800">
              <Package className="w-5 h-5 text-amber-500" />
              Top Categories
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </Button>
          </CardHeader>
          <CardContent className="pb-4">
            <TooltipProvider>
              <div className="flex items-center justify-center h-52 md:h-56 relative">
                {/* Laptop - Yellow circle (largest) */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="absolute w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl z-10"
                      style={{ left: "5%", top: "20%" }}
                    >
                      <div className="text-center text-white">
                        <div className="text-xs font-medium opacity-90">
                          Laptop
                        </div>
                        <div className="text-xl md:text-2xl font-bold">
                          4,567
                        </div>
                        <div className="text-[10px] opacity-75">Per Day</div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-800 text-white">
                    <p>Laptop: 4,567 sales per day</p>
                  </TooltipContent>
                </Tooltip>

                {/* Screen - Teal circle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="absolute w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl z-20"
                      style={{ left: "45%", top: "10%" }}
                    >
                      <div className="text-center text-white">
                        <div className="text-[10px] md:text-xs font-medium opacity-90">
                          Screen
                        </div>
                        <div className="text-base md:text-lg font-bold">
                          1,845
                        </div>
                        <div className="text-[9px] md:text-[10px] opacity-75">
                          Per Day
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-800 text-white">
                    <p>Screen: 1,845 sales per day</p>
                  </TooltipContent>
                </Tooltip>

                {/* Mouse - Orange circle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="absolute w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl z-30"
                      style={{ left: "48%", top: "38%" }}
                    >
                      <div className="text-center text-white">
                        <div className="text-[10px] md:text-xs font-medium opacity-90">
                          Mouse
                        </div>
                        <div className="text-base md:text-lg font-bold">
                          3,167
                        </div>
                        <div className="text-[9px] md:text-[10px] opacity-75">
                          Per Day
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-800 text-white">
                    <p>Mouse: 3,167 sales per day</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="lg:col-span-7 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Top Selling Products
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 px-4 md:px-6 pb-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      ID
                    </TableHead>
                    <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Product
                    </TableHead>
                    <TableHead className="py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Orders
                    </TableHead>
                    <TableHead className="py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Sales
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSellingProducts.map((product, index) => (
                    <TableRow
                      key={product.id}
                      className="border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs bg-slate-50"
                        >
                          {product.id}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${index === 0 ? "bg-amber-500" : index === 1 ? "bg-slate-400" : index === 2 ? "bg-orange-400" : "bg-slate-300"}`}
                          ></div>
                          <span className="font-medium text-slate-700 text-sm">
                            {product.product}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span className="font-semibold text-slate-800">
                          {product.totalOrders.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span className="font-semibold text-green-600">
                          {product.totalSales}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {topSellingProducts.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-8 text-center text-slate-400"
                      >
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No products data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock, Pending Orders, Warranty Tickets Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        {/* Low Stock Alert */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Low Stock Alert
              {lowStockItems.length > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs">
                  {lowStockItems.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-4 md:px-6 pb-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      ID
                    </TableHead>
                    <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Product
                    </TableHead>
                    <TableHead className="py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Qty
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map((item, idx) => (
                    <TableRow
                      key={idx}
                      className="border-slate-50 hover:bg-red-50/50 transition-colors"
                    >
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs bg-slate-50"
                        >
                          {item.id.slice(0, 8)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="font-medium text-slate-700 text-sm line-clamp-1">
                          {item.product}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <Badge
                          variant={
                            item.quantity <= 5 ? "destructive" : "secondary"
                          }
                          className="font-semibold"
                        >
                          {item.quantity.toLocaleString()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {lowStockItems.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="py-8 text-center text-slate-400"
                      >
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        All items are well stocked
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
              Pending Orders
              {pendingOrders.length > 0 && (
                <Badge className="ml-auto text-xs bg-blue-500">
                  {pendingOrders.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-4 md:px-6 pb-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      ID
                    </TableHead>
                    <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Customer
                    </TableHead>
                    <TableHead className="py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-slate-50 hover:bg-blue-50/50 transition-colors"
                    >
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs bg-slate-50"
                        >
                          {order.id}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="font-medium text-slate-700 text-sm">
                          {order.customer}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span className="font-semibold text-blue-600">
                          {order.total}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingOrders.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="py-8 text-center text-slate-400"
                      >
                        <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No pending orders
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Warranty Tickets */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800">
              <Wrench className="w-5 h-5 text-purple-500" />
              Warranty Tickets
              {warrantyTickets.length > 0 && (
                <Badge className="ml-auto text-xs bg-purple-500">
                  {warrantyTickets.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-4 md:px-6 pb-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      ID
                    </TableHead>
                    <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Technician
                    </TableHead>
                    <TableHead className="py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warrantyTickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="border-slate-50 hover:bg-purple-50/50 transition-colors"
                    >
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs bg-slate-50"
                        >
                          {ticket.id}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="font-medium text-slate-700 text-sm">
                          {ticket.technician}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            ticket.status.toLowerCase().includes("completed")
                              ? "bg-green-100 text-green-700"
                              : ticket.status
                                    .toLowerCase()
                                    .includes("processing")
                                ? "bg-blue-100 text-blue-700"
                                : ticket.status
                                      .toLowerCase()
                                      .includes("waiting")
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {ticket.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {warrantyTickets.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="py-8 text-center text-slate-400"
                      >
                        <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No warranty tickets
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Warnings and Audit Logs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* System Warnings */}
        <Card className="lg:col-span-5 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              System Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <span className="text-red-600 font-medium text-sm">
                    Audit Log conflicts detected
                  </span>
                  <p className="text-xs text-red-400 mt-0.5">
                    Requires immediate attention
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Investigate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card className="lg:col-span-7 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800">
              <Activity className="w-5 h-5 text-indigo-500" />
              Audit Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auditLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-slate-50/50 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 font-medium">
                      {log.text}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{log.time}</p>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm text-slate-400">
                    No audit logs available
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                className="text-slate-500 gap-1 h-9"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                <Button variant="default" size="sm" className="w-9 h-9 p-0">
                  1
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-9 h-9 p-0 text-slate-500"
                >
                  2
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-9 h-9 p-0 text-slate-500"
                >
                  3
                </Button>
              </div>
              <Button variant="outline" size="sm" className="gap-1 h-9">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
