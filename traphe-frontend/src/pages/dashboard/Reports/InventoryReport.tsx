import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Package,
  AlertTriangle,
  RefreshCw,
  FileDown,
  Loader2,
  TrendingDown,
  Calendar,
  LineChart,
} from "lucide-react";
import {
  reportService,
  type InventoryReportResponse,
  type StockForecastResponse,
} from "@/services/report.service";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageLayout";
import { authService } from "@/services/auth.service";
import { UserRole } from "@/enums/roles.enum";
import axiosClient from "@/lib/axios-client";
import { Label } from "@/components/ui/label";

export default function InventoryReportPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [report, setReport] = useState<InventoryReportResponse | null>(null);
  const [forecast, setForecast] = useState<StockForecastResponse[]>([]);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [fastMovingOnly, setFastMovingOnly] = useState(false);

  // Branch scoping for BRANCH_MANAGER
  const currentUser = authService.getCurrentUser();
  const isBranchManager = currentUser?.roles?.includes(UserRole.BRANCH_MANAGER) && !currentUser?.roles?.includes(UserRole.ADMIN);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

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
      const response = await reportService.getInventoryReport({
        lowStockOnly: lowStockOnly || undefined,
        fastMovingOnly: fastMovingOnly || undefined,
        branchId: selectedBranchId && selectedBranchId !== "all" ? selectedBranchId : undefined,
      });
      // axios interceptor returns response.data, so use response directly or response.data if wrapped
      const reportData = (response as any).data ?? response;
      setReport(reportData as InventoryReportResponse);

      const forecastResponse = await reportService.getStockForecast({
        branchId: selectedBranchId && selectedBranchId !== "all" ? selectedBranchId : undefined,
      });
      const forecastData = (forecastResponse as any).data ?? forecastResponse;
      setForecast(forecastData as StockForecastResponse[]);
    } catch (error) {
      console.error("Inventory report error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Please try again";
      toast.error("Failed to load inventory report", {
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
      await reportService.exportAndDownloadInventory(
        format,
        lowStockOnly || undefined,
        fastMovingOnly || undefined,
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

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Report</h1>
          <p className="text-gray-600 mt-1">
            Monitor stock levels and receive low stock alerts
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <label className="text-sm font-medium">Low Stock Only</label>
              <Select
                value={lowStockOnly.toString()}
                onValueChange={(value) => setLowStockOnly(value === "true")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">All Items</SelectItem>
                  <SelectItem value="true">Low Stock Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fast Moving Only</label>
              <Select
                value={fastMovingOnly.toString()}
                onValueChange={(value) => setFastMovingOnly(value === "true")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">All Items</SelectItem>
                  <SelectItem value="true">Fast Moving Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={fetchReport}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-roast" />
        </div>
      ) : report ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {report.totalProducts || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {report.items?.length || 0} variants tracked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Low Stock Items
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {report.lowStockProducts || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Need restocking
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Out of Stock
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {report.outOfStockProducts || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Urgent action needed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alerts */}
          {report.items?.filter((i) => i.isLowStock || i.isOutOfStock).length >
            0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.items
                    .filter((item) => item.isLowStock || item.isOutOfStock)
                    .map((item, index) => (
                      <div
                        key={`${item.productVariantId || ""}-${item.variantName || ""}-${index}`}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.variantName} • SKU: {item.sku}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              Available
                            </div>
                            <div className="font-semibold">
                              {item.quantityAvailable}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              Threshold
                            </div>
                            <div className="font-semibold">
                              {item.minThreshold}
                            </div>
                          </div>
                          {item.isOutOfStock ? (
                            <Badge variant="destructive">Critical</Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-600 text-white"
                            >
                              Warning
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stock Forecast Section */}
          {forecast && forecast.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-roast" />
                  Stock Forecast (Next 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {forecast.map((item, idx) => (
                    <div
                      key={`${item.menuItemId}-${idx}`}
                      className="p-4 border rounded-lg bg-gray-50/50"
                    >
                      <div className="font-medium mb-1 truncate" title={item.productName}>{item.productName}</div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Avg. Daily Sales:</span>
                        <span className="font-semibold">{item.averageDailySales}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-muted-foreground">Projected 7-Day Demand:</span>
                        <span className="font-bold text-roast">{item.projected7DayDemand}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inventory Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Inventory Details</CardTitle>
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead className="text-right">Physical</TableHead>
                      <TableHead className="text-right">Reserved</TableHead>
                      <TableHead className="text-right">Available</TableHead>
                      <TableHead className="text-right">Threshold</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!report.items || report.items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center text-muted-foreground"
                        >
                          No inventory items found
                        </TableCell>
                      </TableRow>
                    ) : (
                      report.items.map((item, index) => (
                        <TableRow key={`${item.productVariantId || ""}-${item.variantName || ""}-${index}`}>
                          <TableCell className="font-mono text-sm">
                            {item.sku}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.productName}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.variantName}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.quantityPhysical}
                          </TableCell>
                          <TableCell className="text-right text-orange-600">
                            {item.quantityReserved}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {item.quantityAvailable}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {item.minThreshold}
                          </TableCell>
                          <TableCell>
                            {item.isOutOfStock ? (
                              <Badge variant="destructive">Out of Stock</Badge>
                            ) : item.isLowStock ? (
                              <Badge
                                variant="secondary"
                                className="bg-yellow-600 text-white"
                              >
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge variant="default" className="bg-green-600">
                                In Stock
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No inventory data available
        </div>
      )}
    </PageContainer>
  );
}
