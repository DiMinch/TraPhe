import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, AlertTriangle, ArrowUpDown, Loader2 } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";
import { toast } from "sonner";
import { branchStockService, type IngredientStockResponse } from "@/services/branch-stock.service";
import axiosClient from "@/lib/axios-client";
import { authService } from "@/services/auth.service";
import { UserRole } from "@/enums/roles.enum";
import { useNavigate } from "react-router";

export default function AllInventoryPage() {
  const [stocks, setStocks] = useState<IngredientStockResponse[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();
  const isBranchManager = currentUser?.roles?.includes(UserRole.BRANCH_MANAGER) && !currentUser?.roles?.includes(UserRole.ADMIN);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      fetchStock();
    }
  }, [selectedBranchId, searchTerm]);

  const fetchBranches = async () => {
    try {
      // Branch Manager: skip API call, use assigned branch directly
      if (isBranchManager && currentUser?.branchId) {
        setBranches([{ id: currentUser.branchId, name: "Chi nhánh của tôi" }]);
        setSelectedBranchId(currentUser.branchId);
        return;
      }

      let branchData = [];
      const res = await axiosClient.get("/branches");
      const allBranches = Array.isArray(res.data) ? res.data : res.data?.content || [];
      branchData = allBranches;

      setBranches(branchData);
      if (branchData.length > 0) {
        setSelectedBranchId(branchData[0].id);
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
      toast.error("Không thể tải danh sách chi nhánh");
    }
  };

  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = await branchStockService.getStock(selectedBranchId, searchTerm);
      setStocks(res.data || []);
    } catch (err) {
      console.error("Error fetching stock:", err);
      toast.error("Không thể tải dữ liệu tồn kho");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Quản lý tồn kho" 
        subtitle="Xem tồn kho nguyên liệu tại chi nhánh"
        onRefresh={fetchStock}
      />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="w-[250px]">
            <Select 
              value={selectedBranchId} 
              onValueChange={setSelectedBranchId}
              disabled={isBranchManager}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Chọn chi nhánh" />
              </SelectTrigger>
              <SelectContent>
                {branches.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm nguyên liệu..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin/stock/adjust")}
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Điều chỉnh kho
          </Button>
          <Button 
            className="bg-roast hover:bg-roast/90 text-white shadow-sm transition-all duration-200"
            onClick={() => navigate("/admin/stock/import")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nhập nguyên liệu
          </Button>
        </div>
      </div>

      <Card className="shadow-md border border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Tên nguyên liệu</TableHead>
                <TableHead className="text-right">Tồn kho hiện tại</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead className="text-right">Ngưỡng cảnh báo</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Cập nhật lần cuối</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-roast" />
                  </TableCell>
                </TableRow>
              ) : stocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    Không tìm thấy nguyên liệu nào trong kho.
                  </TableCell>
                </TableRow>
              ) : (
                stocks.map((item) => (
                  <TableRow key={item.id} className={item.isLowStock ? "bg-red-50/50" : ""}>
                    <TableCell className="font-medium">{item.ingredientName}</TableCell>
                    <TableCell className={`text-right font-semibold ${item.isLowStock ? 'text-red-600' : 'text-emerald-600'}`}>
                      {item.quantityAvailable}
                    </TableCell>
                    <TableCell className="text-slate-500">{item.unit}</TableCell>
                    <TableCell className="text-right text-slate-500">
                      {item.minStockAlert || "-"}
                    </TableCell>
                    <TableCell>
                      {item.isLowStock ? (
                        <div className="flex items-center text-red-600 text-sm font-medium">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Sắp hết
                        </div>
                      ) : (
                        <span className="text-emerald-600 text-sm font-medium">Bình thường</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {item.lastUpdated ? new Date(item.lastUpdated).toLocaleString('vi-VN') : "-"}
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
