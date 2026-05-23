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
    toast.success("Äang chuáº©n bá»‹ bÃ¡o cÃ¡o phÃ¢n tÃ­ch loyalty dáº¡ng PDF...");
    setTimeout(() => {
      toast.success("Táº£i xuá»‘ng bÃ¡o cÃ¡o hoÃ n táº¥t!");
    }, 1200);
  };

  // Mock data for graphs
  const chartData = [
    { label: "Tuáº§n 1", issued: 1200, redeemed: 450 },
    { label: "Tuáº§n 2", issued: 1800, redeemed: 900 },
    { label: "Tuáº§n 3", issued: 1500, redeemed: 600 },
    { label: "Tuáº§n 4", issued: 2400, redeemed: 1500 },
  ];

  const maxVal = 3000;

  return (
    <PageContainer>
      <PageHeader
        title="BÃ¡o cÃ¡o & PhÃ¢n tÃ­ch Loyalty"
        subtitle="Theo dÃµi hiá»‡u quáº£ chÆ°Æ¡ng trÃ¬nh khÃ¡ch hÃ ng thÃ¢n thiáº¿t, sá»‘ lÆ°á»£ng Ä‘iá»ƒm tÃ­ch lÅ©y vÃ  Ä‘á»•i quÃ "
        onRefresh={fetchTopLoyalists}
      />

      {/* Filter and Export */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 mt-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-400" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Chá»n khoáº£ng thá»i gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 ngÃ y qua</SelectItem>
              <SelectItem value="30">30 ngÃ y qua</SelectItem>
              <SelectItem value="90">90 ngÃ y qua</SelectItem>
              <SelectItem value="365">NÄƒm nay</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleExportReport}
          variant="outline"
          className="border-roast/20 text-roast hover:bg-roast/10"
        >
          <Download className="w-4 h-4 mr-2" />
          Xuáº¥t bÃ¡o cÃ¡o chi tiáº¿t
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Cards Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-md border border-slate-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-slate-500">Tá»· lá»‡ Ä‘á»•i Ä‘iá»ƒm</span>
                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0">
                  +3.2%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-slate-950">62.5%</div>
              <p className="text-xs text-slate-400 mt-2">Tá»•ng Ä‘iá»ƒm quy Ä‘á»•i quÃ  / Ä‘iá»ƒm phÃ¡t hÃ nh</p>
            </CardContent>
          </Card>

          <Card className="shadow-md border border-slate-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-slate-500">GiÃ¡ trá»‹ quy Ä‘á»•i trung bÃ¬nh</span>
                <span className="text-slate-400 text-xs">30 ngÃ y qua</span>
              </div>
              <div className="text-2xl font-bold text-slate-950">34,500Ä‘</div>
              <p className="text-xs text-slate-400 mt-2">Quy Ä‘á»•i lá»£i Ã­ch trÃªn má»—i giao dá»‹ch Ä‘á»•i quÃ </p>
            </CardContent>
          </Card>

          <Card className="shadow-md border border-slate-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-slate-500">Táº§n suáº¥t tÃ­ch Ä‘iá»ƒm</span>
                <Badge className="bg-roast/10 text-roast/90 hover:bg-roast/10 border-0">
                  Cao
                </Badge>
              </div>
              <div className="text-2xl font-bold text-slate-950">4.2 hÃ³a Ä‘Æ¡n</div>
              <p className="text-xs text-slate-400 mt-2">Sá»‘ Ä‘Æ¡n trung bÃ¬nh má»—i thÃ¡ng cá»§a KH VIP</p>
            </CardContent>
          </Card>

          <Card className="shadow-md border border-slate-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-slate-500">Doanh thu tá»« Member</span>
                <div className="p-1 bg-amber-50 rounded text-amber-700">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-950">42%</div>
              <p className="text-xs text-slate-400 mt-2">ÄÃ³ng gÃ³p doanh thu cá»§a khÃ¡ch hÃ ng thÃ nh viÃªn</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart Card */}
        <div className="lg:col-span-2">
          <Card className="shadow-md border border-slate-200 h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">TÃ­ch lÅ©y vs Quy Ä‘á»•i Ä‘iá»ƒm</CardTitle>
              <CardDescription>So sÃ¡nh lÆ°á»£ng Ä‘iá»ƒm phÃ¡t hÃ nh vÃ  lÆ°á»£ng Ä‘iá»ƒm Ä‘á»•i quÃ </CardDescription>
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
                          className="w-4 bg-roast/100 hover:bg-roast rounded-t transition-all"
                          title={`TÃ­ch lÅ©y: ${data.issued} Ä‘iá»ƒm`}
                        />
                        {/* Redeemed Bar */}
                        <div
                          style={{ height: `${redeemedPct}%` }}
                          className="w-4 bg-rose-500 hover:bg-rose-600 rounded-t transition-all"
                          title={`Quy Ä‘á»•i: ${data.redeemed} Ä‘iá»ƒm`}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{data.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center gap-6 pt-4 border-t border-slate-100 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-roast/100 rounded" />
                  <span className="text-slate-600">Äiá»ƒm phÃ¡t hÃ nh (TÃ­ch lÅ©y)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-rose-500 rounded" />
                  <span className="text-slate-600">Äiá»ƒm quy Ä‘á»•i quÃ </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Loyalists List & Rewards Performance */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-md border border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Top khÃ¡ch hÃ ng thÃ¢n thiáº¿t</CardTitle>
              <CardDescription>ThÃ nh viÃªn sá»Ÿ há»¯u Ä‘iá»ƒm tÃ­ch lÅ©y kháº£ dá»¥ng cao nháº¥t</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">ChÆ°a cÃ³ dá»¯ liá»‡u thÃ nh viÃªn</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {customers.map((c, idx) => (
                    <div key={c.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-roast/10 flex items-center justify-center font-bold text-roast/90 text-sm">
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
              <CardTitle className="text-lg">QuÃ  Ä‘Æ°á»£c Ä‘á»•i nhiá»u nháº¥t</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-roast" />
                  <span className="font-medium text-slate-700">TrÃ  ÄÃ o Cam Sáº£ (M)</span>
                </div>
                <span className="font-bold text-slate-800">142 lÆ°á»£t</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-roast" />
                  <span className="font-medium text-slate-700">Voucher giáº£m giÃ¡ 20k</span>
                </div>
                <span className="font-bold text-slate-800">89 lÆ°á»£t</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-roast" />
                  <span className="font-medium text-slate-700">BÃ¬nh giá»¯ nhiá»‡t TraPhe</span>
                </div>
                <span className="font-bold text-slate-800">24 lÆ°á»£t</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
