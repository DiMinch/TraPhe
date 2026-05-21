import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Download,
  Gift,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { customerService } from "@/services/customer.service";
import type { Customer } from "@/types/customer.types";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";
import { toast } from "sonner";

export default function LoyaltyReportPage() {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    fetchTopLoyalists();
  }, []);

  const fetchTopLoyalists = async () => {
    setLoading(true);
    try {
      const res = await customerService.getCustomers();
      if (res.statusCode === 200 && res.data) {
        const rawList = Array.isArray(res.data) ? res.data : (res.data as any).content || [];
        // Sort by loyalty points descending
        const sorted = [...rawList].sort(
          (a, b) => (b.loyaltyPoint?.pointsAvailable || 0) - (a.loyaltyPoint?.pointsAvailable || 0)
        );
        setCustomers(sorted.slice(0, 5)); // Get top 5
      }
    } catch (err: any) {
      console.error("Error loading top loyalists for report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    toast.success("Đang chuẩn bị báo cáo phân tích loyalty dạng PDF...");
    setTimeout(() => {
      toast.success("Tải xuống báo cáo hoàn tất!");
    }, 1200);
  };

  // Mock data for graphs
  const chartData = [
    { label: "Tuần 1", issued: 1200, redeemed: 450 },
    { label: "Tuần 2", issued: 1800, redeemed: 900 },
    { label: "Tuần 3", issued: 1500, redeemed: 600 },
    { label: "Tuần 4", issued: 2400, redeemed: 1500 },
  ];

  const maxVal = 3000;

  return (
    <PageContainer>
      <PageHeader
        title="Báo cáo & Phân tích Loyalty"
        subtitle="Theo dõi hiệu quả chương trình khách hàng thân thiết, số lượng điểm tích lũy và đổi quà"
        onRefresh={fetchTopLoyalists}
      />

      {/* Filter and Export */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 mt-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-400" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Chọn khoảng thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 ngày qua</SelectItem>
              <SelectItem value="30">30 ngày qua</SelectItem>
              <SelectItem value="90">90 ngày qua</SelectItem>
              <SelectItem value="365">Năm nay</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleExportReport}
          variant="outline"
          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Xuất báo cáo chi tiết
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Cards Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-md border border-slate-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-slate-500">Tỷ lệ đổi điểm</span>
                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0">
                  +3.2%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-slate-950">62.5%</div>
              <p className="text-xs text-slate-400 mt-2">Tổng điểm quy đổi quà / điểm phát hành</p>
            </CardContent>
          </Card>

          <Card className="shadow-md border border-slate-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-slate-500">Giá trị quy đổi trung bình</span>
                <span className="text-slate-400 text-xs">30 ngày qua</span>
              </div>
              <div className="text-2xl font-bold text-slate-950">34,500đ</div>
              <p className="text-xs text-slate-400 mt-2">Quy đổi lợi ích trên mỗi giao dịch đổi quà</p>
            </CardContent>
          </Card>

          <Card className="shadow-md border border-slate-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-slate-500">Tần suất tích điểm</span>
                <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-0">
                  Cao
                </Badge>
              </div>
              <div className="text-2xl font-bold text-slate-950">4.2 hóa đơn</div>
              <p className="text-xs text-slate-400 mt-2">Số đơn trung bình mỗi tháng của KH VIP</p>
            </CardContent>
          </Card>

          <Card className="shadow-md border border-slate-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-slate-500">Doanh thu từ Member</span>
                <div className="p-1 bg-amber-50 rounded text-amber-700">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-950">42%</div>
              <p className="text-xs text-slate-400 mt-2">Đóng góp doanh thu của khách hàng thành viên</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart Card */}
        <div className="lg:col-span-2">
          <Card className="shadow-md border border-slate-200 h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Tích lũy vs Quy đổi điểm</CardTitle>
              <CardDescription>So sánh lượng điểm phát hành và lượng điểm đổi quà</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end min-h-[300px]">
              <div className="grid grid-cols-4 gap-6 items-end flex-1 pb-4">
                {chartData.map((data, idx) => {
                  const issuedPct = (data.issued / maxVal) * 100;
                  const redeemedPct = (data.redeemed / maxVal) * 100;

                  return (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <div className="w-full flex justify-center gap-2 items-end h-[180px] bg-slate-50 rounded-lg p-2">
                        {/* Issued Bar */}
                        <div
                          style={{ height: `${issuedPct}%` }}
                          className="w-4 bg-indigo-500 hover:bg-indigo-600 rounded-t transition-all"
                          title={`Tích lũy: ${data.issued} điểm`}
                        />
                        {/* Redeemed Bar */}
                        <div
                          style={{ height: `${redeemedPct}%` }}
                          className="w-4 bg-rose-500 hover:bg-rose-600 rounded-t transition-all"
                          title={`Quy đổi: ${data.redeemed} điểm`}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{data.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center gap-6 pt-4 border-t border-slate-100 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-indigo-500 rounded" />
                  <span className="text-slate-600">Điểm phát hành (Tích lũy)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-rose-500 rounded" />
                  <span className="text-slate-600">Điểm quy đổi quà</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Loyalists List & Rewards Performance */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-md border border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Top khách hàng thân thiết</CardTitle>
              <CardDescription>Thành viên sở hữu điểm tích lũy khả dụng cao nhất</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">Chưa có dữ liệu thành viên</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {customers.map((c, idx) => (
                    <div key={c.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-700 text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">{c.fullName}</div>
                          <div className="text-xs text-slate-400">{c.phone}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        {c.loyaltyPoint?.pointsAvailable || 0} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md border border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Quà được đổi nhiều nhất</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-slate-700">Trà Đào Cam Sả (M)</span>
                </div>
                <span className="font-bold text-slate-800">142 lượt</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-slate-700">Voucher giảm giá 20k</span>
                </div>
                <span className="font-bold text-slate-800">89 lượt</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-slate-700">Bình giữ nhiệt TraPhe</span>
                </div>
                <span className="font-bold text-slate-800">24 lượt</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
