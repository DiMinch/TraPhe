import { useState, useEffect } from "react";
import axiosClient from "@/lib/axios-client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Users,
  RefreshCw,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  Skull,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ChartTooltip } from "recharts";

// Define segment details with translations, descriptions, and colors
const SEGMENT_INFO: Record<
  string,
  {
    label: string;
    description: string;
    color: string;
    colorHex: string;
    icon: any;
    details: string;
  }
> = {
  CHAMPIONS: {
    label: "Khách hàng xuất sắc (Champions)",
    description: "Mua gần đây, mua thường xuyên và chi tiêu nhiều nhất.",
    color: "bg-emerald-500 hover:bg-emerald-600 text-white",
    colorHex: "#10B981",
    icon: UserCheck,
    details: "Ưu đãi đặc biệt, giới thiệu sản phẩm mới trước.",
  },
  LOYAL_CUSTOMERS: {
    label: "Khách hàng trung thành (Loyal)",
    description: "Chi tiêu lớn, mua thường xuyên. Phản hồi tốt với khuyến mãi.",
    color: "bg-blue-500 hover:bg-blue-600 text-white",
    colorHex: "#3B82F6",
    icon: TrendingUp,
    details: "Tích điểm thưởng gấp đôi, gửi thư tri ân.",
  },
  POTENTIAL_LOYALIST: {
    label: "Khách hàng tiềm năng (Potential Loyalist)",
    description: "Khách hàng mới mua gần đây, tần suất và chi tiêu ở mức khá.",
    color: "bg-cyan-500 hover:bg-cyan-600 text-white",
    colorHex: "#06B6D4",
    icon: TrendingUp,
    details: "Đề xuất chương trình loyalty, tặng mã giảm giá nhỏ.",
  },
  NEW_CUSTOMERS: {
    label: "Khách hàng mới (New Customers)",
    description: "Mua gần đây nhất, nhưng tần suất và chi tiêu chưa cao.",
    color: "bg-teal-500 hover:bg-teal-600 text-white",
    colorHex: "#14B8A6",
    icon: Users,
    details: "Chào mừng nồng nhiệt, khảo sát trải nghiệm.",
  },
  PROMISING: {
    label: "Khách hàng đầy hứa hẹn (Promising)",
    description: "Mua gần đây, chi tiêu trung bình. Cần khuyến khích thêm.",
    color: "bg-amber-500 hover:bg-amber-600 text-white",
    colorHex: "#F59E0B",
    icon: HelpCircle,
    details: "Khuyến mãi dùng thử sản phẩm mới.",
  },
  AT_RISK: {
    label: "Khách hàng rủi ro (At Risk)",
    description: "Đã từng mua rất nhiều và chi lớn nhưng đã lâu chưa quay lại.",
    color: "bg-rose-500 hover:bg-rose-600 text-white",
    colorHex: "#F43F5E",
    icon: AlertTriangle,
    details: "Gửi quà tặng cá nhân hóa, gọi điện khảo sát lý do rời bỏ.",
  },
  HIBERNATING: {
    label: "Đang ngủ đông (Hibernating)",
    description: "Mua lần cuối đã rất lâu, tần suất và chi tiêu thấp.",
    color: "bg-gray-500 hover:bg-gray-600 text-white",
    colorHex: "#6B7280",
    icon: Skull,
    details: "Định kỳ gửi newsletter, không tốn quá nhiều chi phí marketing.",
  },
  LOST: {
    label: "Đã rời bỏ (Lost)",
    description: "Chỉ số RFM thấp nhất. Đã lâu không có tương tác.",
    color: "bg-red-700 hover:bg-red-800 text-white",
    colorHex: "#B91C1C",
    icon: Skull,
    details: "Không cần tập trung tài nguyên marketing vào tệp này.",
  },
};

interface CustomerSegmentData {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  recencyDays: number;
  frequencyCount: number;
  monetaryTotal: number;
  rScore: number;
  fScore: number;
  mScore: number;
  segment: string;
}

export default function CustomerSegments() {
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [selectedSegment, setSelectedSegment] = useState<string>("CHAMPIONS");
  const [customers, setCustomers] = useState<CustomerSegmentData[]>([]);
  const [atRiskCustomers, setAtRiskCustomers] = useState<CustomerSegmentData[]>([]);
  const [loadingDist, setLoadingDist] = useState(false);
  const [loadingCust, setLoadingCust] = useState(false);
  const [loadingAtRisk, setLoadingAtRisk] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 10;

  const fetchDistribution = async () => {
    setLoadingDist(true);
    try {
      const res = await axiosClient.get("/ai/segments");
      setDistribution(res.data || {});
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải biểu đồ phân khúc");
    } finally {
      setLoadingDist(false);
    }
  };

  const fetchCustomers = async (segmentKey: string, currentPage: number) => {
    setLoadingCust(true);
    try {
      const res = await axiosClient.get(`/ai/segments/${segmentKey}/customers`, {
        params: { page: currentPage, size },
      });
      if (res.data) {
        setCustomers(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách khách hàng");
    } finally {
      setLoadingCust(false);
    }
  };

  const fetchAtRiskCustomers = async () => {
    setLoadingAtRisk(true);
    try {
      const res = await axiosClient.get("/ai/segments/AT_RISK/customers", {
        params: { page: 0, size: 20 },
      });
      if (res.data) {
        setAtRiskCustomers(res.data.content || []);
      }
    } catch (err) {
      console.error("Failed to fetch at-risk customers:", err);
    } finally {
      setLoadingAtRisk(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await axiosClient.post("/ai/segments/recalculate");
      toast.success("Đã kích hoạt tính toán lại phân khúc khách hàng!");
      // Reload details after calculation
      setTimeout(() => {
        fetchDistribution();
        fetchCustomers(selectedSegment, 0);
        fetchAtRiskCustomers();
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Yêu cầu tính toán lại thất bại");
    } finally {
      setRecalculating(false);
    }
  };

  useEffect(() => {
    fetchDistribution();
    fetchAtRiskCustomers();
  }, []);

  useEffect(() => {
    setPage(0);
    fetchCustomers(selectedSegment, 0);
  }, [selectedSegment]);

  useEffect(() => {
    fetchCustomers(selectedSegment, page);
  }, [page]);

  const totalCustomers = Object.values(distribution).reduce((a, b) => a + b, 0);

  const pieData = Object.entries(distribution)
    .filter(([_, count]) => count > 0)
    .map(([key, count]) => ({
      name: SEGMENT_INFO[key]?.label.split(" (")[0] || key,
      value: count,
      color: SEGMENT_INFO[key]?.colorHex || "#888888",
    }));

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2C1A0E]">Phân Khúc Khách Hàng AI</h1>
          <p className="text-sm text-[#5C4A3C]">
            Hệ thống tự động chấm điểm RFM (Recency, Frequency, Monetary) để phân chia nhóm khách hàng mục tiêu.
          </p>
        </div>
        <Button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="bg-[#5C3317] hover:bg-[#2C1A0E] text-white flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${recalculating ? "animate-spin" : ""}`} />
          {recalculating ? "Đang tính toán..." : "Tính toán lại RFM"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribution Card */}
        <Card className="lg:col-span-1 bg-white border-[#EFE5D3] rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-lg text-[#2C1A0E] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#A0622A]" />
              Phân phối RFM ({totalCustomers} KH)
            </CardTitle>
            <CardDescription className="text-xs">
              Bấm vào từng phân khúc để xem chi tiết danh sách khách hàng.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
            {!loadingDist && totalCustomers > 0 && (
              <div className="h-[180px] w-full mb-2 flex items-center justify-center border-b border-stone-100 pb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      formatter={(value, name) => [`${value} KH`, name]}
                      contentStyle={{ background: "#fff", border: "1px solid #EFE5D3", borderRadius: "8px", fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {loadingDist ? (
              <div className="text-center py-6 text-sm text-stone-500 italic">Đang tải biểu đồ phân khúc...</div>
            ) : Object.keys(SEGMENT_INFO).map((key) => {
              const count = distribution[key] || 0;
              const percentage = totalCustomers > 0 ? (count / totalCustomers) * 100 : 0;
              const isSelected = selectedSegment === key;
              const info = SEGMENT_INFO[key];

              return (
                <div
                  key={key}
                  onClick={() => setSelectedSegment(key)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#5C3317] bg-[#5C3317]/5 shadow-sm"
                      : "border-stone-100 hover:border-[#A0622A]/50 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-[#2C1A0E] truncate">{info?.label || key}</span>
                    <Badge className={`${info?.color || "bg-gray-500"} text-[10px] px-2 py-0.5 rounded-full`}>
                      {count} KH
                    </Badge>
                  </div>
                  <Progress value={percentage} className="h-1.5 bg-stone-100" />
                  <p className="text-[10px] text-[#5C4A3C] mt-1 line-clamp-1">{info?.description}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Selected Segment Customer Table */}
        <Card className="lg:col-span-2 bg-white border-[#EFE5D3] rounded-2xl shadow-sm">
          <CardHeader className="border-b border-[#EFE5D3] pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="font-serif text-xl text-[#2C1A0E]">
                  {SEGMENT_INFO[selectedSegment]?.label || selectedSegment}
                </CardTitle>
                <CardDescription className="text-xs text-[#5C4A3C] mt-1">
                  {SEGMENT_INFO[selectedSegment]?.description}
                </CardDescription>
              </div>
              <Badge className={`${SEGMENT_INFO[selectedSegment]?.color} text-xs font-bold px-3 py-1 rounded-full`}>
                Gợi ý Marketing: {SEGMENT_INFO[selectedSegment]?.details}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {loadingCust ? (
              <div className="text-center py-12 text-sm text-stone-500 italic">Đang tải danh sách khách hàng...</div>
            ) : customers.length === 0 ? (
              <div className="text-center py-12 text-sm text-stone-500 italic">
                Không tìm thấy khách hàng nào trong phân khúc này.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border border-stone-100 rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader className="bg-stone-50">
                      <TableRow>
                        <TableHead className="font-bold text-[#2C1A0E]">Họ Tên</TableHead>
                        <TableHead className="font-bold text-[#2C1A0E]">Liên Hệ</TableHead>
                        <TableHead className="font-bold text-[#2C1A0E] text-right">Recency (Ngày)</TableHead>
                        <TableHead className="font-bold text-[#2C1A0E] text-right">Frequency (Đơn)</TableHead>
                        <TableHead className="font-bold text-[#2C1A0E] text-right">Monetary (Tổng chi)</TableHead>
                        <TableHead className="font-bold text-[#2C1A0E] text-center">Score (R-F-M)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((row) => (
                        <TableRow key={row.customerId}>
                          <TableCell className="font-medium text-stone-900">{row.customerName || "N/A"}</TableCell>
                          <TableCell className="text-xs text-stone-600">
                            <div>{row.customerEmail}</div>
                            <div>{row.customerPhone}</div>
                          </TableCell>
                          <TableCell className="text-right text-stone-700">{row.recencyDays} ngày</TableCell>
                          <TableCell className="text-right text-stone-700">{row.frequencyCount} đơn</TableCell>
                          <TableCell className="text-right font-semibold text-[#5C3317]">
                            {row.monetaryTotal.toLocaleString("vi-VN")} ₫
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex gap-1 text-[10px] font-bold bg-stone-100 px-2 py-0.5 rounded text-stone-700">
                              <span>R:{row.rScore}</span>
                              <span>F:{row.fScore}</span>
                              <span>M:{row.mScore}</span>
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-stone-500">
                      Trang {page + 1} / {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 0}
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        className="border-stone-200 text-stone-600 hover:bg-stone-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                        className="border-stone-200 text-stone-600 hover:bg-stone-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top 20 At-Risk Customers */}
      <Card className="bg-white border-[#EFE5D3] rounded-2xl shadow-sm">
        <CardHeader className="border-b border-[#EFE5D3] pb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <div>
              <CardTitle className="font-serif text-lg text-[#2C1A0E]">
                Top 20 Khách Hàng Có Nguy Cơ Rời Bỏ (At Risk)
              </CardTitle>
              <CardDescription className="text-xs text-[#5C4A3C]">
                Khách hàng từng mua nhiều nhưng đã lâu không quay lại. Cần chạy chiến dịch kích cầu lập tức.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loadingAtRisk ? (
            <div className="text-center py-6 text-sm text-stone-500 italic">Đang tải danh sách khách hàng rủi ro...</div>
          ) : atRiskCustomers.length === 0 ? (
            <div className="text-center py-6 text-sm text-stone-500 italic">
              Không có khách hàng nào thuộc nhóm rủi ro (At Risk) hiện tại.
            </div>
          ) : (
            <div className="border border-stone-100 rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-stone-50">
                  <TableRow>
                    <TableHead className="font-bold text-[#2C1A0E]">Họ Tên</TableHead>
                    <TableHead className="font-bold text-[#2C1A0E]">Liên Hệ</TableHead>
                    <TableHead className="font-bold text-[#2C1A0E] text-right">Recency (Ngày)</TableHead>
                    <TableHead className="font-bold text-[#2C1A0E] text-right">Frequency (Đơn)</TableHead>
                    <TableHead className="font-bold text-[#2C1A0E] text-right">Monetary (Tổng chi)</TableHead>
                    <TableHead className="font-bold text-[#2C1A0E] text-center">Score (R-F-M)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atRiskCustomers.map((row) => (
                    <TableRow key={row.customerId}>
                      <TableCell className="font-medium text-stone-900">{row.customerName || "N/A"}</TableCell>
                      <TableCell className="text-xs text-stone-600">
                        <div>{row.customerEmail}</div>
                        <div>{row.customerPhone}</div>
                      </TableCell>
                      <TableCell className="text-right text-stone-700">{row.recencyDays} ngày</TableCell>
                      <TableCell className="text-right text-stone-700">{row.frequencyCount} đơn</TableCell>
                      <TableCell className="text-right font-semibold text-[#5C3317]">
                        {row.monetaryTotal.toLocaleString("vi-VN")} ₫
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex gap-1 text-[10px] font-bold bg-stone-100 px-2 py-0.5 rounded text-stone-700">
                          <span>R:{row.rScore}</span>
                          <span>F:{row.fScore}</span>
                          <span>M:{row.mScore}</span>
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
