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
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChevronDown, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { CURRENT_USER } from "@/constants/user";
import { useState } from "react";
import {
  dashboardTopSellingProducts,
  dashboardLowStockAlert,
  dashboardPendingOrders,
  dashboardWarrantyTickets,
  dashboardAuditLogs,
  dashboardChartData,
} from "@/data/mockData";

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

export default function DashboardPage() {
  const [showRevenue, setShowRevenue] = useState(true);
  const [showGrossProfit, setShowGrossProfit] = useState(true);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            Welcome {CURRENT_USER.role} {CURRENT_USER.name}
          </span>
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="sm">
            CN
          </Button>
        </div>
      </div>

      {/* Key Metrics + Chart Row */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        {/* Key Metrics Card */}
        <Card className="col-span-12 md:col-span-5 lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {/* Revenue Card */}
            <div className="border-2 border-orange-400 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Revenue
                </span>
                <Checkbox
                  checked={showRevenue}
                  onCheckedChange={(checked) =>
                    setShowRevenue(checked as boolean)
                  }
                  className="w-5 h-5 border-orange-400 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
              </div>
              <div className="text-2xl font-bold mt-1">$ 510.0</div>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="text-green-500">↑</span>
                25% (vs last 3 months)
              </p>
            </div>

            {/* Gross Profit Card */}
            <div className="border-2 border-teal-400 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Gross Profit
                </span>
                <Checkbox
                  checked={showGrossProfit}
                  onCheckedChange={(checked) =>
                    setShowGrossProfit(checked as boolean)
                  }
                  className="w-5 h-5 border-teal-400 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                />
              </div>
              <div className="text-2xl font-bold mt-1">$ 260.0</div>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="text-green-500">↑</span>
                25% (vs last 3 months)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Chart Card */}
        <Card className="col-span-12 md:col-span-7 lg:col-span-9 relative">
          {/* Green Avatar */}

          <CardHeader className="flex flex-row items-center justify-end pb-2">
            <Select defaultValue="month">
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue placeholder="By Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">By Month</SelectItem>
                <SelectItem value="week">By Week</SelectItem>
                <SelectItem value="year">By Year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="pb-3">
            <ChartContainer config={chartConfig} className="h-44 w-full">
              <LineChart
                data={dashboardChartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  domain={[-60, 60]}
                  ticks={[-60, -20, 20, 60]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                {showRevenue && (
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    dot={false}
                  />
                )}
                {showGrossProfit && (
                  <Line
                    type="monotone"
                    dataKey="grossProfit"
                    stroke="var(--color-grossProfit)"
                    strokeWidth={2}
                    dot={false}
                  />
                )}
              </LineChart>
            </ChartContainer>
            <div className="flex items-center justify-center gap-6 text-xs mt-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span>Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-500" />
                <span>Gross Profit</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Categories + Top Selling Products Row */}
      <div className="grid grid-cols-12 gap-4 mb-4 relative">
        {/* Green Avatar positioned between sections */}

        {/* Top Selling Categories */}
        <Card className="col-span-12 lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">
              Top Selling Categories
            </CardTitle>
            <div className="flex items-center gap-2">
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <TooltipProvider>
              <div className="flex items-center justify-center h-48 relative">
                {/* Laptop - Yellow circle (largest) */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="absolute w-36 h-36 rounded-full bg-yellow-400 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity z-10"
                      style={{ left: "10%", top: "25%" }}
                    >
                      <div className="text-center text-white">
                        <div className="text-xs">Laptop</div>
                        <div className="text-xl font-bold">4,567</div>
                        <div className="text-xs">Per Day</div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Laptop: 4,567 sales per day</p>
                  </TooltipContent>
                </Tooltip>

                {/* Screen - Teal circle (smaller) */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="absolute w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity z-20"
                      style={{ left: "45%", top: "15%" }}
                    >
                      <div className="text-center text-white">
                        <div className="text-xs">Screen</div>
                        <div className="text-lg font-bold">1,845</div>
                        <div className="text-xs">Per Day</div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Screen: 1,845 sales per day</p>
                  </TooltipContent>
                </Tooltip>

                {/* Mouse - Orange circle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="absolute w-28 h-28 rounded-full bg-orange-500 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity z-30"
                      style={{ left: "50%", top: "40%" }}
                    >
                      <div className="text-center text-white">
                        <div className="text-xs">Mouse</div>
                        <div className="text-lg font-bold">3,167</div>
                        <div className="text-xs">Per Day</div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mouse: 3,167 sales per day</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="col-span-12 lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">
              Top Selling Products
            </CardTitle>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent className="p-0 px-4 pb-2">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="py-2 text-gray-500">ID</TableHead>
                  <TableHead className="py-2 text-gray-500">Product</TableHead>
                  <TableHead className="py-2 text-right text-gray-500">
                    Total Orders
                  </TableHead>
                  <TableHead className="py-2 text-right text-gray-500">
                    Total Sales
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardTopSellingProducts.map((product) => (
                  <TableRow key={product.id} className="text-sm">
                    <TableCell className="py-2 text-gray-500">
                      {product.id}
                    </TableCell>

                    <TableCell className="py-2 text-gray-500">
                      {product.product}
                    </TableCell>
                    <TableCell className="py-2 text-right">
                      {product.totalOrders.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-2 text-right">
                      {product.totalSales}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock, Pending Orders, Warranty Tickets Row */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        {/* Low Stock Alert */}
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-4 pb-2">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="py-2 text-gray-500">ID</TableHead>
                  <TableHead className="py-2 text-gray-500">Product</TableHead>
                  <TableHead className="py-2 text-right text-gray-500">
                    Quantity Available
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardLowStockAlert.map((item, idx) => (
                  <TableRow key={idx} className="text-sm">
                    <TableCell className="py-2">
                      <div className="text-gray-500">{item.id}</div>
                    </TableCell>
                    <TableCell className="py-2">{item.product}</TableCell>
                    <TableCell className="py-2 text-right">
                      {item.quantity.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-4 pb-2">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="py-2 text-gray-500">ID</TableHead>
                  <TableHead className="py-2 text-gray-500">Customer</TableHead>
                  <TableHead className="py-2 text-right text-gray-500">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardPendingOrders.map((order) => (
                  <TableRow key={order.id} className="text-sm">
                    <TableCell className="py-2 text-gray-500">
                      {order.id}
                    </TableCell>
                    <TableCell className="py-2">{order.customer}</TableCell>
                    <TableCell className="py-2 text-right">
                      {order.total}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Warranty Tickets */}
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Warranty Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-4 pb-2">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="py-2 text-gray-500">ID</TableHead>
                  <TableHead className="py-2 text-gray-500">
                    Technician
                  </TableHead>
                  <TableHead className="py-2 text-right text-gray-500">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardWarrantyTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="text-sm">
                    <TableCell className="py-2 text-gray-500">
                      {ticket.id}
                    </TableCell>
                    <TableCell className="py-2">{ticket.technician}</TableCell>
                    <TableCell className="py-2 text-right text-sm">
                      {ticket.status}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* System Warnings and Audit Logs Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* System Warnings */}
        <Card className="col-span-12 lg:col-span-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              System Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2">
              <span className="text-red-500 text-sm">Audit Log conflicts</span>
              <Button variant="outline" size="sm" className="text-xs h-8">
                Find out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card className="col-span-12 lg:col-span-7">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Audit Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardAuditLogs.map((log, idx) => (
                <div key={idx} className="border-l-2 border-gray-200 pl-3 py-1">
                  <p className="text-sm text-gray-500">{log.text}</p>
                  <p className="text-xs text-gray-400">{log.time}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
              <Button variant="ghost" size="sm" className="text-gray-400 gap-1">
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                1
              </Button>
              <Button variant="ghost" size="sm" className="gap-1">
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
