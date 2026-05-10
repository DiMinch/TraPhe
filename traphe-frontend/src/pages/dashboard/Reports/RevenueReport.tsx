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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Download,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  RefreshCw,
  FileDown,
  Loader2,
} from "lucide-react";
import {
  reportService,
  type RevenueReportResponse,
} from "@/services/report.service";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageLayout";

export default function RevenueReport() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [report, setReport] = useState<RevenueReportResponse | null>(null);
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [groupBy, setGroupBy] = useState<"DAY" | "WEEK" | "MONTH">("DAY");

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await reportService.getRevenueReport({
        startDate,
        endDate,
        groupBy,
      });
      setReport(response.data);
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
      await reportService.exportAndDownloadRevenue(format, startDate, endDate);
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

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Revenue Report</h1>
        <p className="text-gray-600 mt-1">
          Track revenue performance with detailed breakdowns
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={async () => {
            try {
              console.log("Testing API with params:", {
                startDate,
                endDate,
                groupBy,
              });
              const response = await reportService.getRevenueReport({
                startDate,
                endDate,
                groupBy,
              });
              console.log("API Response:", response);
              toast.success(
                "API Connected! Check console for response structure",
              );
            } catch (error) {
              console.error("API Error:", error);
              toast.error("API Error - Check console for details");
            }
          }}
        >
          Test API Connection
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="flex items-end gap-2">
              <Button onClick={fetchReport} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : report ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${report.totalRevenue.toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <TrendingUp
                    className={`h-3 w-3 mr-1 ${report.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
                  />
                  <span
                    className={
                      report.revenueGrowth >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {report.revenueGrowth >= 0 ? "+" : ""}
                    {report.revenueGrowth.toFixed(2)}%
                  </span>
                  <span className="ml-1">from previous period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {report.totalOrders.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Orders processed in period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Order Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${report.averageOrderValue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per order average
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Revenue Trend</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("CSV")}
                  disabled={exporting}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("PDF")}
                  disabled={exporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={report.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    name="Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Online Revenue</span>
                  <span className="text-sm font-bold">
                    ${report.breakdown.onlineRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Offline Revenue</span>
                  <span className="text-sm font-bold">
                    ${report.breakdown.offlineRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                    <span>Payment Methods:</span>
                  </div>
                  <div className="space-y-2 pl-4">
                    <div className="flex justify-between items-center text-sm">
                      <span>Cash</span>
                      <Badge variant="secondary">
                        ${report.breakdown.cashPayments.toLocaleString()}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Transfer</span>
                      <Badge variant="secondary">
                        ${report.breakdown.transferPayments.toLocaleString()}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>COD</span>
                      <Badge variant="secondary">
                        ${report.breakdown.codPayments.toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Period Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Current Period</span>
                  <span className="text-sm font-bold">
                    ${report.totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Previous Period</span>
                  <span className="text-sm font-bold">
                    ${report.comparison.previousPeriod.toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Growth Amount</span>
                    <span
                      className={`text-sm font-bold ${report.comparison.growthAmount >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {report.comparison.growthAmount >= 0 ? "+" : ""}$
                      {Math.abs(
                        report.comparison.growthAmount,
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium">Growth Rate</span>
                    <Badge
                      variant={
                        report.comparison.growthPercentage >= 0
                          ? "default"
                          : "destructive"
                      }
                    >
                      {report.comparison.growthPercentage >= 0 ? "+" : ""}
                      {report.comparison.growthPercentage.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No data available for the selected period
        </div>
      )}
    </PageContainer>
  );
}
