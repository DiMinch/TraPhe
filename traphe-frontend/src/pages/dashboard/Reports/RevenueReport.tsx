import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  RefreshCw,
  FileDown,
  Loader2,
  Calendar,
  CreditCard,
} from "lucide-react";
import {
  reportService,
  type RevenueReportResponse,
} from "@/services/report.service";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageLayout";
import { authService } from "@/services/auth.service";
import { UserRole } from "@/enums/roles.enum";
import axiosClient from "@/lib/axios-client";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const formatCurrency = (value: number) => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(2)}B đ`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M đ`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K đ`;
  }
  return `${value.toLocaleString()}đ`;
};

const formatFullCurrency = (value: number) => {
  return value.toLocaleString();
};

export default function RevenueReport() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [report, setReport] = useState<RevenueReportResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "comparison">("overview");
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [groupBy, setGroupBy] = useState<"DAY" | "WEEK" | "MONTH">("DAY");

  // Branch scoping for BRANCH_MANAGER
  const currentUser = authService.getCurrentUser();
  const isBranchManager = currentUser?.roles?.includes(UserRole.BRANCH_MANAGER) && !currentUser?.roles?.includes(UserRole.ADMIN);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    isBranchManager && currentUser?.branchId ? currentUser.branchId : ""
  );

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        if (isBranchManager && currentUser?.branchId) {
          setBranches([{ id: currentUser.branchId, name: "Chi nhánh của tôi" }]);
          setSelectedBranchId(currentUser.branchId);
          return;
        }
        const branchRes = await axiosClient.get("/branches");
        const allBranches = Array.isArray(branchRes.data) ? branchRes.data : branchRes.data?.content || [];
        setBranches(allBranches);
      } catch { /* ignore */ }
    };
    fetchBranches();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await reportService.getRevenueReport({
        startDate,
        endDate,
        groupBy,
        branchId: selectedBranchId && selectedBranchId !== "all" ? selectedBranchId : undefined,
      });
      // axios interceptor returns response.data, so use response directly or response.data if wrapped
      const reportData = (response as any).data ?? response;
      setReport(reportData as RevenueReportResponse);
    } catch (error) {
      console.error("Revenue report error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Please try again";
      toast.error("Failed to load revenue report", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = async (format: "CSV" | "PDF") => {
    try {
      setExporting(true);
      await reportService.exportAndDownloadRevenue(
        format,
        startDate,
        endDate,
        selectedBranchId && selectedBranchId !== "all" ? selectedBranchId : undefined
      );
      toast.success(`Report exported as ${format}`);
    } catch (error) {
      toast.error("Export failed", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setExporting(false);
    }
  };

  // Calculate derived metrics
  const avgOrderValue = report?.totalOrders
    ? report.totalRevenue / report.totalOrders
    : 0;

  const growthPercentage = report?.comparison?.percentageChange || 0;
  const isPositiveGrowth = growthPercentage >= 0;

  // Prepare chart data
  const lineChartData =
    report?.breakdown?.map((item) => ({
      period: item.period,
      revenue: item.revenue,
      orderCount: item.orderCount,
    })) || [];

  const pieChartData =
    report?.byOrderType?.map((item) => ({
      name: item.orderType.replace(/_/g, " "),
      value: item.revenue,
      orders: item.orderCount,
    })) || [];

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Report</h1>
          <p className="text-gray-600 mt-1">
            Track revenue performance with detailed breakdowns
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("CSV")}
            disabled={exporting}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("PDF")}
            disabled={exporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {branches.length > 0 && (
              <div className="space-y-2">
                <Label>Chi nhánh</Label>
                <Select value={selectedBranchId} onValueChange={setSelectedBranchId} disabled={isBranchManager}>
                  <SelectTrigger><SelectValue placeholder="Tất cả chi nhánh" /></SelectTrigger>
                  <SelectContent>
                    {!isBranchManager && <SelectItem value="all">Tất cả chi nhánh</SelectItem>}
                    {branches.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupBy">Group By</Label>
              <Select
                value={groupBy}
                onValueChange={(value) => setGroupBy(value as typeof groupBy)}
              >
                <SelectTrigger id="groupBy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAY">Daily</SelectItem>
                  <SelectItem value="WEEK">Weekly</SelectItem>
                  <SelectItem value="MONTH">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={fetchReport}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      {!isBranchManager && (
        <div className="flex space-x-1 border-b mb-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2.5 px-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === "overview"
                ? "border-roast text-roast"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Tổng quan doanh thu
          </button>
          <button
            onClick={() => setActiveTab("comparison")}
            className={`py-2.5 px-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === "comparison"
                ? "border-roast text-roast"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            So sánh chi nhánh
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-roast" />
        </div>
      ) : report ? (
        <>
          {activeTab === "comparison" && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>So sánh doanh thu giữa các chi nhánh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={report.byBranch || []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="branchName" />
                      <YAxis tickFormatter={formatCurrency} />
                      <Tooltip
                        formatter={(value: any) => [formatFullCurrency(value) + "đ", "Doanh thu"]}
                      />
                      <Legend />
                      <Bar dataKey="revenue" name="Doanh thu" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                        {(report.byBranch || []).map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "overview" && (
            <>
              {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Revenue */}
            <Card className="bg-linear-to-br from-roast to-espresso text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-cream/90">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-5 w-5 text-cream/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(report.totalRevenue || 0)}
                </div>
                <div className="flex items-center text-xs text-cream/80 mt-2">
                  {isPositiveGrowth ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  <span
                    className={
                      isPositiveGrowth ? "text-green-300" : "text-red-300"
                    }
                  >
                    {isPositiveGrowth ? "+" : ""}
                    {growthPercentage.toFixed(1)}%
                  </span>
                  <span className="ml-1">vs previous period</span>
                </div>
              </CardContent>
            </Card>

            {/* Total Orders */}
            <Card className="bg-linear-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-100">
                  Total Orders
                </CardTitle>
                <ShoppingCart className="h-5 w-5 text-green-200" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(report.totalOrders || 0).toLocaleString()}
                </div>
                <p className="text-xs text-green-200 mt-2">Orders in period</p>
              </CardContent>
            </Card>

            {/* Average Order Value */}
            <Card className="bg-linear-to-br from-amber-500 to-amber-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-100">
                  Avg Order Value
                </CardTitle>
                <CreditCard className="h-5 w-5 text-amber-200" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(avgOrderValue)}
                </div>
                <p className="text-xs text-amber-200 mt-2">Per order</p>
              </CardContent>
            </Card>

            {/* Growth */}
            <Card
              className={`bg-linear-to-br ${isPositiveGrowth ? "from-emerald-500 to-emerald-600" : "from-red-500 to-red-600"} text-white`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">
                  Growth
                </CardTitle>
                {isPositiveGrowth ? (
                  <TrendingUp className="h-5 w-5 opacity-80" />
                ) : (
                  <TrendingDown className="h-5 w-5 opacity-80" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(Math.abs(report.comparison?.difference || 0))}
                </div>
                <p className="text-xs opacity-80 mt-2">
                  {isPositiveGrowth ? "Increase" : "Decrease"} vs previous
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Revenue Trend Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-roast" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => Math.round(value).toString()}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "revenue" ? `${formatFullCurrency(value)}đ` : `${value} đơn hàng`,
                        name === "revenue" ? "Revenue" : "Orders",
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend
                      formatter={(value) =>
                        value === "revenue" ? "Revenue" : "Orders"
                      }
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      dot={{ fill: "#4f46e5", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orderCount"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart - Revenue by Order Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  By Order Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="space-y-2 mt-4">
                  {pieChartData.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.orders} orders</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart - Daily Revenue */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-600" />
                Revenue Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    formatter={(value: number) => formatFullCurrency(value)}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue by Order Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {report.byOrderType?.map((item, index) => (
              <Card
                key={item.orderType}
                className="border-l-4"
                style={{ borderLeftColor: COLORS[index % COLORS.length] }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {item.orderType.replace(/_/g, " ")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(item.revenue || 0)}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary">{item.orderCount} orders</Badge>
                    <span className="text-sm text-gray-500">
                      {report.totalRevenue
                        ? ((item.revenue / report.totalRevenue) * 100).toFixed(
                            1,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Data Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-roast" />
                Revenue Details by Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">#</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold text-right">
                        Revenue
                      </TableHead>
                      <TableHead className="font-semibold text-right">
                        Orders
                      </TableHead>
                      <TableHead className="font-semibold text-right">
                        Avg/Order
                      </TableHead>
                      <TableHead className="font-semibold text-right">
                        Share
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.breakdown?.map((item, index) => {
                      const avgPerOrder =
                        item.orderCount > 0
                          ? item.revenue / item.orderCount
                          : 0;
                      const percentage = report.totalRevenue
                        ? (item.revenue / report.totalRevenue) * 100
                        : 0;
                      return (
                        <TableRow
                          key={item.period}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {new Date(item.period).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric",
                                },
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-roast">
                            {formatFullCurrency(item.revenue)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{item.orderCount}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-gray-600">
                            {formatCurrency(avgPerOrder)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-roast h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(percentage, 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-12 text-right">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Table Summary */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Total Revenue:</span>
                    <p className="font-bold text-roast">
                      {formatFullCurrency(report.totalRevenue || 0)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Orders:</span>
                    <p className="font-bold">{report.totalOrders || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Days:</span>
                    <p className="font-bold">{report.breakdown?.length || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Avg/Day:</span>
                    <p className="font-bold text-green-600">
                      {formatCurrency(
                        report.breakdown?.length
                          ? report.totalRevenue / report.breakdown.length
                          : 0,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Card */}
          {report.comparison && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Period Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Current Period</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(report.totalRevenue || 0)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">
                      Previous Period
                    </p>
                    <p className="text-2xl font-bold text-gray-600">
                      {formatCurrency(report.comparison.previousRevenue || 0)}
                    </p>
                  </div>
                  <div
                    className={`text-center p-4 rounded-lg ${isPositiveGrowth ? "bg-green-50" : "bg-red-50"}`}
                  >
                    <p className="text-sm text-gray-500 mb-1">Difference</p>
                    <p
                      className={`text-2xl font-bold ${isPositiveGrowth ? "text-green-600" : "text-red-600"}`}
                    >
                      {isPositiveGrowth ? "+" : ""}
                      {formatCurrency(report.comparison.difference || 0)}
                    </p>
                    <Badge
                      variant={isPositiveGrowth ? "default" : "destructive"}
                      className="mt-2"
                    >
                      {isPositiveGrowth ? "+" : ""}
                      {growthPercentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
            </>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <ShoppingCart className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              No data available for the selected period
            </p>
            <Button onClick={fetchReport} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
