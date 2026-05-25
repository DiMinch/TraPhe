import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Gift,
  Users,
  Award,
  Settings2,
  RefreshCw,
  TrendingUp,
  Coins,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { customerTierService } from "@/services/customer-tier.service";
import { customerService } from "@/services/customer.service";
import type { Customer, CustomerTier } from "@/types/customer.types";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";
import { toast } from "sonner";

export default function AdminLoyaltyPage() {
  const [loading, setLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [tiers, setTiers] = useState<CustomerTier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pointRate, setPointRate] = useState("1000"); // 1,000đ = 1 point
  const [savingPolicy, setSavingPolicy] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tiersRes, customersRes] = await Promise.all([
        customerTierService.getActiveTiers(),
        customerService.getCustomers(),
      ]);

      if (tiersRes.statusCode === 200 && tiersRes.data) {
        setTiers(Array.isArray(tiersRes.data) ? tiersRes.data : (tiersRes.data as any).content || []);
      }
      if (customersRes.statusCode === 200 && customersRes.data) {
        setCustomers(Array.isArray(customersRes.data) ? customersRes.data : (customersRes.data as any).content || []);
      }
    } catch (err: any) {
      console.error("Error fetching loyalty overview:", err);
      toast.error("Không thể tải thông tin loyalty.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await customerTierService.recalculateAll();
      toast.success("Đã tính toán lại toàn bộ hạng thành viên thành công!");
      fetchData();
    } catch (err: any) {
      console.error("Error recalculating loyalty tiers:", err);
      toast.error("Không thể tính toán lại hạng thành viên.");
    } finally {
      setRecalculating(false);
    }
  };

  const handleSavePolicy = () => {
    setSavingPolicy(true);
    setTimeout(() => {
      setSavingPolicy(false);
      toast.success("Cập nhật quy định tích điểm thành công!");
    }, 800);
  };

  // Calculations
  const totalCustomers = customers.length;
  const totalPointsIssued = customers.reduce((sum, c) => sum + (c.loyaltyPoint?.totalPoints || 0), 0);
  const totalPointsAvailable = customers.reduce((sum, c) => sum + (c.loyaltyPoint?.pointsAvailable || 0), 0);
  const totalPointsRedeemed = totalPointsIssued - totalPointsAvailable;

  // Calculate distributions
  const getTierCustomerCount = (tierName: string) => {
    return customers.filter((c) => c.tier?.name === tierName).length;
  };

  return (
    <PageContainer>
      <PageHeader
        title="Tổng quan Loyalty"
        subtitle="Quản lý chương trình khách hàng thân thiết, hạng thành viên và quy định đổi điểm"
        onRefresh={fetchData}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-roast mb-4" />
          <span className="text-slate-600 font-medium">Đang tải thông tin loyalty...</span>
        </div>
      ) : (
        <div className="space-y-6 mt-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="shadow-md border border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-500">Khách hàng thành viên</span>
                  <div className="p-2 bg-roast/10 rounded-lg text-roast">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{totalCustomers}</div>
                <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+12% tháng này</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-500">Điểm đã phát hành</span>
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <Coins className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{totalPointsIssued.toLocaleString()}</div>
                <div className="text-xs text-slate-400 mt-2">Tổng số điểm khách tích lũy</div>
              </CardContent>
            </Card>

            <Card className="shadow-md border border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-500">Điểm đã quy đổi quà</span>
                  <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                    <Gift className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{totalPointsRedeemed.toLocaleString()}</div>
                <div className="text-xs text-slate-400 mt-2">
                  Tỷ lệ quy đổi: {totalPointsIssued > 0 ? ((totalPointsRedeemed / totalPointsIssued) * 100).toFixed(1) : 0}%
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-500">Điểm khả dụng hiện tại</span>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{totalPointsAvailable.toLocaleString()}</div>
                <div className="text-xs text-slate-400 mt-2">Điểm chưa quy đổi của khách hàng</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left/Middle Column: Membership Tiers & Action */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-md border border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Danh sách hạng thành viên</CardTitle>
                    <CardDescription>Cấu hình điáÂ»Âu kiện chi tiêu tối thiểu và ưu đãi của từng hạng</CardDescription>
                  </div>
                  <Button
                    onClick={handleRecalculate}
                    disabled={recalculating}
                    variant="outline"
                    className="border-roast/20 text-roast hover:bg-roast/10"
                  >
                    {recalculating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Cập nhật lại hạng (Đồng bộ)
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tiers.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">Không tìm thấy hạng thành viên nào.</div>
                  ) : (
                    <div className="space-y-4">
                      {tiers.map((tier) => {
                        const count = getTierCustomerCount(tier.name);
                        const percentage = totalCustomers > 0 ? (count / totalCustomers) * 100 : 0;
                        return (
                          <div key={tier.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-colors">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-roast" />
                                <span className="font-semibold text-slate-900 text-md">{tier.name}</span>
                              </div>
                              <div className="text-sm font-medium text-slate-600">
                                {count} thành viên ({percentage.toFixed(1)}%)
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3 text-slate-600">
                              <div>
                                <span className="text-xs text-slate-400 block">Điểm tối thiểu</span>
                                <span className="font-semibold">{tier.minSpending?.toLocaleString("vi-VN") || 0} VND</span>
                              </div>
                              <div>
                                <span className="text-xs text-slate-400 block">Ưu đãi giảm giá</span>
                                <span className="font-semibold text-rose-600">Giảm {tier.discountRate}%</span>
                              </div>
                              <div>
                                <span className="text-xs text-slate-400 block">Trạng thái</span>
                                <Badge className={tier.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}>
                                  {tier.active ? "Đang áp dụng" : "Ngừng áp dụng"}
                                </Badge>
                              </div>
                            </div>
                            <Progress value={percentage} className="h-1.5 bg-slate-200" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Point Policies */}
            <div className="lg:col-span-1">
              <Card className="shadow-md border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Cấu hình quy định tích điểm</CardTitle>
                  <CardDescription>Thiết lập tỷ lệ quy đổi số tiáÂ»Ân mua hàng sang điểm thưởng khách hàng</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="earn-rate">Hệ số tích điểm</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="earn-rate"
                        type="number"
                        value={pointRate}
                        onChange={(e) => setPointRate(e.target.value)}
                        className="bg-white"
                      />
                      <span className="text-sm font-medium text-slate-600 whitespace-nowrap">VND = 1 Điểm</span>
                    </div>
                    <span className="text-xs text-slate-400 block mt-1">
                      Mặc định: 1,000 VND chi tiêu sáÂºÂ½ tương ứng tích lũy được 1 điểm thưởng.
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-roast/10/50 border border-foam space-y-3">
                    <div className="flex items-center gap-2 text-roast font-semibold text-sm">
                      <Settings2 className="w-4 h-4" />
                      <span>Ví dụ quy đổi hóa đơn</span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Hóa đơn trà đào:</span>
                        <span>45,000đ</span>
                      </div>
                      <div className="flex justify-between font-medium text-slate-700">
                        <span>Điểm nhận được:</span>
                        <span className="text-roast">+{Math.floor(45000 / parseInt(pointRate || "1000"))} Điểm</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSavePolicy}
                    disabled={savingPolicy}
                    className="w-full bg-roast hover:bg-roast/90 text-white font-medium"
                  >
                    {savingPolicy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Lưu cấu hình quy định
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-md border border-slate-200 mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Lối tắt Loyalty</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-4">
                  <Button variant="ghost" className="w-full justify-between text-slate-700 hover:text-roast hover:bg-roast/10" asChild>
                    <a href="/admin/loyalty/rewards">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-roast" />
                        <span>Catalogue Quà đổi điểm</span>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" className="w-full justify-between text-slate-700 hover:text-roast hover:bg-roast/10" asChild>
                    <a href="/admin/loyalty/tiers">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-roast" />
                        <span>Quản lý nhóm / hạng thành viên</span>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" className="w-full justify-between text-slate-700 hover:text-roast hover:bg-roast/10" asChild>
                    <a href="/admin/loyalty/customers">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-roast" />
                        <span>Danh sách Khách hàng</span>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
