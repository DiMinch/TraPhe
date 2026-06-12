import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import { PageContainer, PageHeader, EmptyState } from "@/components/layout/PageLayout";
import { branchStockService, type StockTransactionResponse } from "@/services/branch-stock.service";
import axiosClient from "@/lib/axios-client";
import { authService } from "@/services/auth.service";
import { UserRole } from "@/enums/roles.enum";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export default function TransactionsPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [transactions, setTransactions] = useState<StockTransactionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();
  const isBranchManager = currentUser?.roles?.includes(UserRole.BRANCH_MANAGER) && !currentUser?.roles?.includes(UserRole.ADMIN);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      fetchTransactions();
    }
  }, [selectedBranchId, filterType]);

  const fetchBranches = async () => {
    try {
      // Branch Manager: skip API call, use assigned branch directly
      if (isBranchManager && currentUser?.branchId) {
        setBranches([{ id: currentUser.branchId, name: "Chi nhánh của tôi" }]);
        setSelectedBranchId(currentUser.branchId);
        return;
      }

      let branchData = [];
      const branchRes = await axiosClient.get("/branches");
      const allBranches = Array.isArray(branchRes.data) ? branchRes.data : branchRes.data?.content || [];
      branchData = allBranches;
      setBranches(branchData);
      if (branchData.length > 0) setSelectedBranchId(branchData[0].id);
    } catch (err) {
      toast.error("Không thể tải danh sách chi nhánh");
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const type = filterType === "all" ? undefined : filterType;
      const res = await branchStockService.getTransactions({
        branchId: selectedBranchId,
        type: type,
        page: 0,
        size: 50 // TODO: Add real pagination
      });
      setTransactions(res.data.content || []);
    } catch (err: any) {
      toast.error("Không thể tải lịch sử giao dịch");
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case "IMPORT":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Nhập kho</Badge>;
      case "ADJUST":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Điều chỉnh</Badge>;
      case "CONSUME":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Pha chế</Badge>;
      case "RETURN":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Trả hàng</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <PageContainer>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="p-2"><ArrowLeft className="w-5 h-5" /></Button>
        <PageHeader title="Lịch sử giao dịch kho" subtitle="Theo dõi các hoạt động nhập, xuất, điều chỉnh tồn kho" onRefresh={fetchTransactions} />
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="w-[250px]">
          <Select value={selectedBranchId} onValueChange={setSelectedBranchId} disabled={isBranchManager}>
            <SelectTrigger className="bg-white"><SelectValue placeholder="Chọn chi nhánh" /></SelectTrigger>
            <SelectContent>
              {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="w-[200px]">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-white"><SelectValue placeholder="Loại giao dịch" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả giao dịch</SelectItem>
              <SelectItem value="IMPORT">Nhập kho</SelectItem>
              <SelectItem value="ADJUST">Điều chỉnh</SelectItem>
              <SelectItem value="CONSUME">Pha chế (Xuất)</SelectItem>
              <SelectItem value="RETURN">Trả hàng</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Nguyên liệu</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="text-right">Tồn trước</TableHead>
                <TableHead className="text-right">Thay đổi</TableHead>
                <TableHead className="text-right">Tồn sau</TableHead>
                <TableHead>Lý do</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-roast mb-2" />
                    <p className="text-slate-500">Đang tải dữ liệu...</p>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 p-0">
                    <EmptyState
                      icon={<Loader2 className="w-8 h-8 text-slate-400" />}
                      title="Không có giao dịch nào"
                      description="Chưa có hoạt động nhập, xuất, hoặc điều chỉnh kho nào trong thời gian này."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-700">
                      {new Date(tx.createdAt).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell className="font-medium">{tx.ingredientName}</TableCell>
                    <TableCell>{getTransactionTypeBadge(tx.type)}</TableCell>
                    <TableCell className="text-right text-slate-500">{tx.quantityBefore}</TableCell>
                    <TableCell className="text-right font-medium">
                      {tx.quantityChange > 0 ? (
                        <span className="text-emerald-600">+{tx.quantityChange}</span>
                      ) : (
                        <span className="text-red-600">{tx.quantityChange}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-700">{tx.quantityAfter}</TableCell>
                    <TableCell className="text-slate-600 text-sm max-w-[200px] truncate" title={tx.reason || "-"}>
                      {tx.reason || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
