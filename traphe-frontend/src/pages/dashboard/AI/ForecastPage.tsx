import { useEffect, useState } from "react";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  BarChart3,
  Brain,
  Search,
} from "lucide-react";
import axiosClient from "@/lib/axios-client";
import { toast } from "sonner";
import { adminService } from "@/services/admin.service";

interface ForecastItem {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  forecastDate: string;
  predictedQuantity: number;
  trendPct: number;
  trendLabel: "UP" | "DOWN" | "STABLE";
  confidence: number;
  currentStock: number | null;
  stockStatus: "OK" | "LOW" | "REORDER" | "OUT_OF_STOCK" | "UNKNOWN";
}

const STOCK_STATUS_CONFIG = {
  OK: { label: "Đủ hàng", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  LOW: { label: "Sắp hết", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: AlertTriangle },
  REORDER: { label: "Cần đặt hàng", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  OUT_OF_STOCK: { label: "Hết hàng", color: "bg-red-200 text-red-900 border-red-300", icon: XCircle },
  UNKNOWN: { label: "Không rõ", color: "bg-gray-100 text-gray-600 border-gray-200", icon: Minus },
};

export default function ForecastPage() {
  const [forecasts, setForecasts] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<number>(1); // day offset 1=tomorrow, 2=day after, etc.
  const [days] = useState(7);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [trendFilter, setTrendFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchBranches = async () => {
    try {
      const res = await adminService.getAllBranches();
      setBranches(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { days };
      if (selectedBranch !== "all") params.branchId = selectedBranch;

      const res: any = await axiosClient.get("/ai/forecast", { params });
      const success = res?.success ?? res?.data?.success ?? false;
      const data = res?.success !== undefined ? res.data : (res?.data?.data ?? res?.data);
      
      if (success && Array.isArray(data)) {
        setForecasts(data);
      } else if (Array.isArray(res)) {
        setForecasts(res);
      } else {
        setForecasts([]);
      }
    } catch (err: any) {
      toast.error("Không thể tải dữ liệu dự báo");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerRebuild = async () => {
    setTriggering(true);
    try {
      const params: Record<string, any> = {};
      if (selectedBranch !== "all") params.branchId = selectedBranch;

      await axiosClient.post("/ai/forecast/run", null, { params });
      toast.success("Đã kích hoạt phân tích dự báo. Vui lòng đợi 5–10 giây...");
      setTimeout(fetchForecast, 8000);
    } catch (err) {
      toast.error("Không thể kích hoạt forecast");
    } finally {
      setTriggering(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchForecast();
  }, [selectedBranch]);

  // Group by date, filter by selectedDay offset
  const uniqueDates = Array.from(new Set(forecasts.map((f) => f.forecastDate))).sort();
  const selectedDate = uniqueDates[selectedDay - 1];

  // Date filtered items
  const dateFilteredForecasts = forecasts.filter((f) => f.forecastDate === selectedDate);

  // Summary counts based on the date-filtered list
  const reorderCount = dateFilteredForecasts.filter((f) => f.stockStatus === "REORDER" || f.stockStatus === "OUT_OF_STOCK").length;
  const lowCount = dateFilteredForecasts.filter((f) => f.stockStatus === "LOW").length;
  const okCount = dateFilteredForecasts.filter((f) => f.stockStatus === "OK").length;

  // Apply search and status/trend filters
  const filteredForecasts = dateFilteredForecasts.filter((item) => {
    // 1. Search term
    if (searchTerm.trim() !== "") {
      const name = item.ingredientName?.toLowerCase() || "";
      if (!name.includes(searchTerm.toLowerCase())) return false;
    }
    // 2. Stock status filter
    if (statusFilter !== "ALL") {
      if (statusFilter === "REORDER" || statusFilter === "OUT_OF_STOCK") {
        if (item.stockStatus !== "REORDER" && item.stockStatus !== "OUT_OF_STOCK") return false;
      } else {
        if (item.stockStatus !== statusFilter) return false;
      }
    }
    // 3. Trend filter
    if (trendFilter !== "ALL") {
      if (item.trendLabel !== trendFilter) return false;
    }
    return true;
  });

  // Sort: prioritize REORDER/OUT_OF_STOCK, then LOW, etc.
  const sortedForecasts = [...filteredForecasts].sort((a, b) => {
    const order = { REORDER: 0, OUT_OF_STOCK: 0, LOW: 1, UNKNOWN: 2, OK: 3 };
    return (order[a.stockStatus] ?? 2) - (order[b.stockStatus] ?? 2);
  });

  // Paginated slices
  const totalItems = sortedForecasts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedForecasts = sortedForecasts.slice(startIndex, endIndex);

  return (
    <PageContainer>
      <PageHeader
        title="AI Dự báo nguyên liệu"
        subtitle="Holt's Double Exponential Smoothing — Dự báo nhu cầu 7 ngày tới"
        onRefresh={fetchForecast}
      />

      {/* Controls & Filters Panel */}
      <div className="flex flex-col gap-4 mb-6 bg-white p-4 border border-admin-border rounded-xl">
        {/* Row 1: Branch and Days */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-56 bg-white border-admin-border">
                <SelectValue placeholder="Chọn chi nhánh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-1 bg-admin-bg border border-admin-border rounded-lg p-1">
              {uniqueDates.map((date, i) => (
                <button
                  key={date}
                  onClick={() => {
                    setSelectedDay(i + 1);
                    setCurrentPage(1); // Reset page on day change
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
                    selectedDay === i + 1
                      ? "bg-roast text-white"
                      : "text-roast hover:bg-foam"
                  }`}
                >
                  {new Date(date).toLocaleDateString("vi-VN", { weekday: "short", day: "numeric" })}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={triggerRebuild}
            disabled={triggering || loading}
          >
            {triggering ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Brain className="w-4 h-4 mr-2" />
            )}
            {triggering ? "Đang phân tích..." : "Chạy dự báo mới"}
          </Button>
        </div>

        {/* Row 2: Search, Filters, PageSize */}
        <div className="flex flex-wrap items-center gap-3 border-t border-admin-border pt-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-dust" />
            <Input
              type="text"
              placeholder="Tìm kiếm nguyên liệu..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 bg-white border-admin-border"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-dust font-medium">Trạng thái:</span>
            <Select value={statusFilter} onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-40 bg-white border-admin-border">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="OK">Đủ hàng</SelectItem>
                <SelectItem value="LOW">Sắp hết</SelectItem>
                <SelectItem value="REORDER">Cần đặt hàng</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Hết hàng</SelectItem>
                <SelectItem value="UNKNOWN">Không rõ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-dust font-medium">Xu hướng:</span>
            <Select value={trendFilter} onValueChange={(val) => {
              setTrendFilter(val);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-40 bg-white border-admin-border">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="UP">Xu hướng tăng</SelectItem>
                <SelectItem value="DOWN">Xu hướng giảm</SelectItem>
                <SelectItem value="STABLE">Ổn định</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-dust font-medium">Hiển thị:</span>
            <Select value={pageSize.toString()} onValueChange={(val) => {
              setPageSize(Number(val));
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-20 bg-white border-admin-border">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-700">{reorderCount}</p>
              <p className="text-xs text-red-600">Cần đặt hàng ngay</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold text-yellow-700">{lowCount}</p>
              <p className="text-xs text-yellow-600">Sắp hết hàng</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-green-200 bg-green-50">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-green-700">{okCount}</p>
              <p className="text-xs text-green-600">Đủ hàng</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-dust">
          <Loader2 className="w-10 h-10 animate-spin mb-3 text-roast" />
          <p className="text-sm">Đang tải dữ liệu dự báo...</p>
        </div>
      ) : dateFilteredForecasts.length === 0 ? (
        <Card className="border border-admin-border border-dashed">
          <CardContent className="py-16 text-center text-dust">
            <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Chưa có dữ liệu dự báo</p>
            <p className="text-xs mt-1">Nhấn "Chạy dự báo mới" để phân tích</p>
          </CardContent>
        </Card>
      ) : totalItems === 0 ? (
        <Card className="border border-admin-border border-dashed">
          <CardContent className="py-16 text-center text-dust">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Không tìm thấy nguyên liệu phù hợp</p>
            <p className="text-xs mt-1">Vui lòng thử thay đổi từ khóa hoặc bộ lọc</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-admin-border">
          <CardHeader className="pb-2 border-b border-admin-border">
            <CardTitle className="text-sm font-bold text-ink flex items-center gap-2">
              <Brain className="w-4 h-4 text-roast" />
              Dự báo ngày {selectedDate && new Date(selectedDate).toLocaleDateString("vi-VN")}
              <span className="text-xs text-dust font-normal ml-2">
                (Hiển thị {startIndex + 1} - {endIndex} trên tổng số {totalItems} nguyên liệu)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-admin-bg text-dust text-xs uppercase tracking-wide">
                    <th className="text-left px-4 py-3 font-semibold">Nguyên liệu</th>
                    <th className="text-right px-4 py-3 font-semibold">Dự báo cần</th>
                    <th className="text-right px-4 py-3 font-semibold">Tồn kho</th>
                    <th className="text-center px-4 py-3 font-semibold">Xu hướng</th>
                    <th className="text-center px-4 py-3 font-semibold">Độ tin cậy</th>
                    <th className="text-center px-4 py-3 font-semibold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {paginatedForecasts.map((item, idx) => {
                    const statusConfig = STOCK_STATUS_CONFIG[item.stockStatus] ?? STOCK_STATUS_CONFIG.UNKNOWN;
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr
                        key={`${item.ingredientId}-${item.forecastDate}-${idx}`}
                        className="hover:bg-admin-bg transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-ink">{item.ingredientName}</td>
                        <td className="px-4 py-3 text-right font-bold text-roast">
                          {Number(item.predictedQuantity).toFixed(2)} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-right text-dust">
                          {item.currentStock != null
                            ? `${Number(item.currentStock).toFixed(2)} ${item.unit}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {item.trendLabel === "UP" ? (
                              <TrendingUp className="w-4 h-4 text-red-500" />
                            ) : item.trendLabel === "DOWN" ? (
                              <TrendingDown className="w-4 h-4 text-green-500" />
                            ) : (
                              <Minus className="w-4 h-4 text-dust" />
                            )}
                            <span className={`text-xs font-semibold ${
                              item.trendLabel === "UP" ? "text-red-500" :
                              item.trendLabel === "DOWN" ? "text-green-600" : "text-dust"
                            }`}>
                              {item.trendPct > 0 ? "+" : ""}{Number(item.trendPct).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-16 h-1.5 bg-admin-border rounded-full overflow-hidden">
                              <div
                                className="h-full bg-roast rounded-full transition-all"
                                style={{ width: `${Math.round(item.confidence * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-dust">
                              {Math.round(item.confidence * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            className={`text-[11px] font-semibold border ${statusConfig.color} flex items-center gap-1 w-fit mx-auto`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-admin-border bg-white rounded-b-xl">
              <div className="text-xs text-dust">
                Hiển thị từ <span className="font-bold text-ink">{startIndex + 1}</span> đến{" "}
                <span className="font-bold text-ink">{Math.min(endIndex, totalItems)}</span> trong tổng số{" "}
                <span className="font-bold text-ink">{totalItems}</span> nguyên liệu
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-3 text-xs"
                >
                  Trước
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                  .map((page, idx, arr) => {
                    const showEllipsisBefore = page > 1 && arr[idx - 1] !== page - 1;
                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsisBefore && <span className="px-1 text-dust text-xs">...</span>}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded text-xs font-bold transition-all border ${
                            currentPage === page
                              ? "bg-roast text-white border-roast"
                              : "text-roast hover:bg-foam border-admin-border bg-white"
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-3 text-xs"
                >
                  Sau
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Explanation */}
      <div className="mt-4 p-4 bg-foam/40 border border-admin-border rounded-xl text-xs text-dust">
        <p className="font-bold text-roast mb-1 flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5" />
          Cách AI tính dự báo
        </p>
        <p>
          Hệ thống dùng thuật toán <strong>Holt's Double Exponential Smoothing</strong> — một phương pháp time-series
          chuẩn trong học thuật (phù hợp F&B với xu hướng tăng trưởng). Mô hình tổng hợp lịch sử
          {" "}<strong>60 ngày</strong> đơn hàng, tính lượng tiêu thụ trung bình hàng ngày và hệ số xu hướng (trend),
          sau đó chiếu (extrapolate) ra <strong>7 ngày tiếp theo</strong>.
        </p>
      </div>
    </PageContainer>
  );
}
