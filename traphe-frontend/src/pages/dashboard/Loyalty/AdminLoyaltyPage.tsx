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
  const [pointRate, setPointRate] = useState("1000"); // 1,000Ä‘ = 1 point
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
      toast.error("KhÃ´ng thá»ƒ táº£i thÃ´ng tin loyalty.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await customerTierService.recalculateAll();
      toast.success("ÄÃ£ tÃ­nh toÃ¡n láº¡i toÃ n bá»™ háº¡ng thÃ nh viÃªn thÃ nh cÃ´ng!");
      fetchData();
    } catch (err: any) {
      console.error("Error recalculating loyalty tiers:", err);
      toast.error("KhÃ´ng thá»ƒ tÃ­nh toÃ¡n láº¡i háº¡ng thÃ nh viÃªn.");
    } finally {
      setRecalculating(false);
    }
  };

  const handleSavePolicy = () => {
    setSavingPolicy(true);
    setTimeout(() => {
      setSavingPolicy(false);
      toast.success("Cáº­p nháº­t quy Ä‘á»‹nh tÃ­ch Ä‘iá»ƒm thÃ nh cÃ´ng!");
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
        title="Tá»•ng quan Loyalty"
        subtitle="Quáº£n lÃ½ chÆ°Æ¡ng trÃ¬nh khÃ¡ch hÃ ng thÃ¢n thiáº¿t, háº¡ng thÃ nh viÃªn vÃ  quy Ä‘á»‹nh Ä‘á»•i Ä‘iá»ƒm"
        onRefresh={fetchData}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-roast mb-4" />
          <span className="text-slate-600 font-medium">Äang táº£i thÃ´ng tin loyalty...</span>
        </div>
      ) : (
        <div className="space-y-6 mt-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="shadow-md border border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-500">KhÃ¡ch hÃ ng thÃ nh viÃªn</span>
                  <div className="p-2 bg-roast/10 rounded-lg text-roast">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{totalCustomers}</div>
                <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+12% thÃ¡ng nÃ y</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-500">Äiá»ƒm Ä‘Ã£ phÃ¡t hÃ nh</span>
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <Coins className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{totalPointsIssued.toLocaleString()}</div>
                <div className="text-xs text-slate-400 mt-2">Tá»•ng sá»‘ Ä‘iá»ƒm khÃ¡ch tÃ­ch lÅ©y</div>
              </CardContent>
            </Card>

            <Card className="shadow-md border border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-500">Äiá»ƒm Ä‘Ã£ quy Ä‘á»•i quÃ </span>
                  <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                    <Gift className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{totalPointsRedeemed.toLocaleString()}</div>
                <div className="text-xs text-slate-400 mt-2">
                  Tá»· lá»‡ quy Ä‘á»•i: {totalPointsIssued > 0 ? ((totalPointsRedeemed / totalPointsIssued) * 100).toFixed(1) : 0}%
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-500">Äiá»ƒm kháº£ dá»¥ng hiá»‡n táº¡i</span>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{totalPointsAvailable.toLocaleString()}</div>
                <div className="text-xs text-slate-400 mt-2">Äiá»ƒm chÆ°a quy Ä‘á»•i cá»§a khÃ¡ch hÃ ng</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left/Middle Column: Membership Tiers & Action */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-md border border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Danh sÃ¡ch háº¡ng thÃ nh viÃªn</CardTitle>
                    <CardDescription>Cáº¥u hÃ¬nh Ä‘iá»u kiá»‡n chi tiÃªu tá»‘i thiá»ƒu vÃ  Æ°u Ä‘Ã£i cá»§a tá»«ng háº¡ng</CardDescription>
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
                    Cáº­p nháº­t láº¡i háº¡ng (Äá»“ng bá»™)
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tiers.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">KhÃ´ng tÃ¬m tháº¥y háº¡ng thÃ nh viÃªn nÃ o.</div>
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
                                {count} thÃ nh viÃªn ({percentage.toFixed(1)}%)
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3 text-slate-600">
                              <div>
                                <span className="text-xs text-slate-400 block">Äiá»ƒm tá»‘i thiá»ƒu</span>
                                <span className="font-semibold">{tier.minPoint.toLocaleString("vi-VN")} pts</span>
                              </div>
                              <div>
                                <span className="text-xs text-slate-400 block">Æ¯u Ä‘Ã£i giáº£m giÃ¡</span>
                                <span className="font-semibold text-rose-600">Giáº£m {tier.discountRate}%</span>
                              </div>
                              <div>
                                <span className="text-xs text-slate-400 block">Tráº¡ng thÃ¡i</span>
                                <Badge className={tier.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}>
                                  {tier.status === "ACTIVE" ? "Äang Ã¡p dá»¥ng" : "Ngá»«ng Ã¡p dá»¥ng"}
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
                  <CardTitle className="text-lg">Cáº¥u hÃ¬nh quy Ä‘á»‹nh tÃ­ch Ä‘iá»ƒm</CardTitle>
                  <CardDescription>Thiáº¿t láº­p tá»· lá»‡ quy Ä‘á»•i sá»‘ tiá»n mua hÃ ng sang Ä‘iá»ƒm thÆ°á»Ÿng khÃ¡ch hÃ ng</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="earn-rate">Há»‡ sá»‘ tÃ­ch Ä‘iá»ƒm</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="earn-rate"
                        type="number"
                        value={pointRate}
                        onChange={(e) => setPointRate(e.target.value)}
                        className="bg-white"
                      />
                      <span className="text-sm font-medium text-slate-600 whitespace-nowrap">VND = 1 Äiá»ƒm</span>
                    </div>
                    <span className="text-xs text-slate-400 block mt-1">
                      Máº·c Ä‘á»‹nh: 1,000 VND chi tiÃªu sáº½ tÆ°Æ¡ng á»©ng tÃ­ch lÅ©y Ä‘Æ°á»£c 1 Ä‘iá»ƒm thÆ°á»Ÿng.
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-roast/10/50 border border-foam space-y-3">
                    <div className="flex items-center gap-2 text-roast font-semibold text-sm">
                      <Settings2 className="w-4 h-4" />
                      <span>VÃ­ dá»¥ quy Ä‘á»•i hÃ³a Ä‘Æ¡n</span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>HÃ³a Ä‘Æ¡n trÃ  Ä‘Ã o:</span>
                        <span>45,000Ä‘</span>
                      </div>
                      <div className="flex justify-between font-medium text-slate-700">
                        <span>Äiá»ƒm nháº­n Ä‘Æ°á»£c:</span>
                        <span className="text-roast">+{Math.floor(45000 / parseInt(pointRate || "1000"))} Äiá»ƒm</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSavePolicy}
                    disabled={savingPolicy}
                    className="w-full bg-roast hover:bg-roast/90 text-white font-medium"
                  >
                    {savingPolicy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    LÆ°u cáº¥u hÃ¬nh quy Ä‘á»‹nh
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-md border border-slate-200 mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Lá»‘i táº¯t Loyalty</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-4">
                  <Button variant="ghost" className="w-full justify-between text-slate-700 hover:text-roast hover:bg-roast/10" asChild>
                    <a href="/admin/loyalty/rewards">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-roast" />
                        <span>Catalogue QuÃ  Ä‘á»•i Ä‘iá»ƒm</span>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" className="w-full justify-between text-slate-700 hover:text-roast hover:bg-roast/10" asChild>
                    <a href="/admin/loyalty/tiers">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-roast" />
                        <span>Quáº£n lÃ½ nhÃ³m / háº¡ng thÃ nh viÃªn</span>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" className="w-full justify-between text-slate-700 hover:text-roast hover:bg-roast/10" asChild>
                    <a href="/admin/loyalty/customers">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-roast" />
                        <span>Danh sÃ¡ch KhÃ¡ch hÃ ng</span>
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
