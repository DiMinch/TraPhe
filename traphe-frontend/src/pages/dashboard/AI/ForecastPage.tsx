import { useEffect, useState } from "react";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

      const res = await axiosClient.get("/ai/forecast", { params });
      if (res.data?.success) {
        setForecasts(res.data.data);
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
  const filteredForecasts = forecasts.filter((f) => f.forecastDate === selectedDate);

  const reorderCount = filteredForecasts.filter((f) => f.stockStatus === "REORDER" || f.stockStatus === "OUT_OF_STOCK").length;
  const lowCount = filteredForecasts.filter((f) => f.stockStatus === "LOW").length;
  const okCount = filteredForecasts.filter((f) => f.stockStatus === "OK").length;

  return (
    <PageContainer>
      <PageHeader
        title="AI Dự báo nguyên liệu"
        subtitle="Holt's Double Exponential Smoothing — Dự báo nhu cầu 7 ngày tới"
        onRefresh={fetchForecast}
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
          <SelectTrigger className="w-48 bg-white border-admin-border">
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

        <div className="flex gap-1 bg-white border border-admin-border rounded-lg p-1">
          {uniqueDates.map((date, i) => (
            <button
              key={date}
              onClick={() => setSelectedDay(i + 1)}
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

        <Button
          variant="outline"
          size="sm"
          onClick={triggerRebuild}
          disabled={triggering || loading}
          className="ml-auto"
        >
          {triggering ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Brain className="w-4 h-4 mr-2" />
          )}
          {triggering ? "Đang phân tích..." : "Chạy dự báo mới"}
        </Button>
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
      ) : filteredForecasts.length === 0 ? (
        <Card className="border border-admin-border border-dashed">
          <CardContent className="py-16 text-center text-dust">
            <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Chưa có dữ liệu dự báo</p>
            <p className="text-xs mt-1">Nhấn "Chạy dự báo mới" để phân tích</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-admin-border">
          <CardHeader className="pb-2 border-b border-admin-border">
            <CardTitle className="text-sm font-bold text-ink flex items-center gap-2">
              <Brain className="w-4 h-4 text-roast" />
              Dự báo ngày {selectedDate && new Date(selectedDate).toLocaleDateString("vi-VN")}
              <span className="text-xs text-dust font-normal ml-2">
                ({filteredForecasts.length} nguyên liệu)
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
                  {filteredForecasts
                    .sort((a, b) => {
                      const order = { REORDER: 0, OUT_OF_STOCK: 0, LOW: 1, UNKNOWN: 2, OK: 3 };
                      return (order[a.stockStatus] ?? 2) - (order[b.stockStatus] ?? 2);
                    })
                    .map((item, idx) => {
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
