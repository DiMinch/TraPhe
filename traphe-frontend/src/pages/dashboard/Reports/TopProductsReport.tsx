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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Trophy, RefreshCw, FileDown, Loader2 } from "lucide-react";
import {
  reportService,
  type TopProductsReportResponse,
} from "@/services/report.service";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageLayout";

export default function TopProductsReport() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [report, setReport] = useState<TopProductsReportResponse | null>(null);
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [sortBy, setSortBy] = useState<"QUANTITY" | "REVENUE">("REVENUE");
  const [limit, setLimit] = useState(10);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await reportService.getTopProductsReport({
        startDate,
        endDate,
        sortBy,
        limit,
      });
      setReport(response.data);
    } catch (error) {
      console.error("Top products report error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Please try again";
      toast.error("Failed to load top products report", {
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
      await reportService.exportAndDownloadTopProducts(
        format,
        sortBy,
        limit,
        startDate,
        endDate,
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

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500 text-white";
    if (rank === 2) return "bg-gray-400 text-white";
    if (rank === 3) return "bg-orange-600 text-white";
    return "bg-gray-200 text-gray-700";
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Top Products Report
        </h1>
        <p className="text-gray-600 mt-1">
          Discover best-selling products by quantity or revenue
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <Label htmlFor="sortBy">Sort By</Label>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as typeof sortBy)}
              >
                <SelectTrigger id="sortBy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REVENUE">Revenue</SelectItem>
                  <SelectItem value="QUANTITY">Quantity Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="limit">Top</Label>
              <Select
                value={limit.toString()}
                onValueChange={(value) => setLimit(parseInt(value))}
              >
                <SelectTrigger id="limit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Top 5</SelectItem>
                  <SelectItem value="10">Top 10</SelectItem>
                  <SelectItem value="20">Top 20</SelectItem>
                  <SelectItem value="50">Top 50</SelectItem>
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
          {/* Top 3 Highlights */}
          {report.products.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {report.products.slice(0, 3).map((product, index) => (
                <Card
                  key={product.productId}
                  className="relative overflow-hidden"
                >
                  <div
                    className={`absolute top-0 left-0 w-full h-2 ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-600"}`}
                  />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      #{product.rank} Best Seller
                    </CardTitle>
                    <Trophy
                      className={`h-5 w-5 ${index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : "text-orange-600"}`}
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold mb-1">
                      {product.productName}
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      {product.variantName}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Revenue</div>
                        <div className="font-semibold">
                          ${product.revenue.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Qty Sold</div>
                        <div className="font-semibold">
                          {product.quantitySold}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Full Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Rankings</CardTitle>
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
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Qty Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Avg Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.products.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center text-muted-foreground"
                        >
                          No products sold in this period
                        </TableCell>
                      </TableRow>
                    ) : (
                      report.products.map((product) => (
                        <TableRow key={product.productId}>
                          <TableCell>
                            <Badge className={getRankBadgeColor(product.rank)}>
                              #{product.rank}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {product.productName}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {product.variantName}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {product.sku}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {product.quantitySold}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ${product.revenue.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {product.orders}
                          </TableCell>
                          <TableCell className="text-right">
                            ${product.averagePrice.toLocaleString()}
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
          No data available for the selected period
        </div>
      )}
    </PageContainer>
  );
}
