import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Save, Loader2, ArrowLeft } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";
import { toast } from "sonner";
import { branchStockService, type IngredientStockResponse } from "@/services/branch-stock.service";
import axiosClient from "@/lib/axios-client";
import { authService } from "@/services/auth.service";
import { UserRole } from "@/enums/roles.enum";
import { useNavigate } from "react-router";

interface AdjustmentRow {
  ingredientId: string;
  name: string;
  unit: string;
  currentStock: number;
  newStock: number;
  difference: number;
  reason: string;
}

export default function StockAdjustPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [stocks, setStocks] = useState<IngredientStockResponse[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>("");
  const [adjustmentItems, setAdjustmentItems] = useState<AdjustmentRow[]>([]);
  const [generalReason, setGeneralReason] = useState("Kiểm kê định kỳ");

  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();
  const isBranchManager = currentUser?.roles?.includes(UserRole.BRANCH_MANAGER) && !currentUser?.roles?.includes(UserRole.ADMIN);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      fetchStock();
      setAdjustmentItems([]); // Clear adjustments when branch changes
    }
  }, [selectedBranchId]);

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

  const fetchStock = async () => {
    try {
      const res = await branchStockService.getStock(selectedBranchId);
      setStocks(res.data || []);
    } catch (err) {
      toast.error("Không thể tải tồn kho hiện tại");
    }
  };

  const handleAddItem = () => {
    if (!selectedIngredientId) {
      return toast.error("Vui lòng chọn một nguyên liệu");
    }
    if (adjustmentItems.some((row) => row.ingredientId === selectedIngredientId)) {
      return toast.error("Nguyên liệu này đã có trong danh sách điều chỉnh");
    }

    const item = stocks.find((i) => i.ingredientId === selectedIngredientId);
    if (!item) return;

    setAdjustmentItems((prev) => [
      ...prev,
      {
        ingredientId: item.ingredientId,
        name: item.ingredientName,
        unit: item.unit,
        currentStock: item.quantityAvailable,
        newStock: item.quantityAvailable,
        difference: 0,
        reason: generalReason,
      },
    ]);
    setSelectedIngredientId("");
  };

  const handleRemoveRow = (index: number) => {
    setAdjustmentItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, newStockVal: number) => {
    setAdjustmentItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const diff = newStockVal - item.currentStock;
        return {
          ...item,
          newStock: newStockVal,
          difference: diff,
        };
      })
    );
  };

  const handleReasonChange = (index: number, reason: string) => {
    setAdjustmentItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, reason } : item))
    );
  };

  const applyGeneralReason = () => {
    if (!generalReason) return;
    setAdjustmentItems((prev) => prev.map((item) => ({ ...item, reason: generalReason })));
  };

  const handleSubmit = async () => {
    if (!selectedBranchId) return toast.error("Vui lòng chọn chi nhánh");
    const validItems = adjustmentItems.filter(i => i.difference !== 0);
    if (validItems.length === 0) {
      return toast.error("Không có thay đổi số lượng nào cần lưu");
    }
    
    const missingReason = validItems.find(i => !i.reason.trim());
    if (missingReason) {
      return toast.error(`Vui lòng nhập lý do điều chỉnh cho ${missingReason.name}`);
    }

    setSubmitting(true);
    try {
      // Execute all adjustments concurrently
      await Promise.all(validItems.map(item => 
        branchStockService.adjustStock(selectedBranchId, {
          ingredientId: item.ingredientId,
          quantity: item.difference, // positive or negative
          reason: item.reason
        })
      ));
      
      toast.success("Điều chỉnh kho thành công");
      navigate("/admin/stock/all");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi điều chỉnh kho");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="p-2"><ArrowLeft className="w-5 h-5" /></Button>
        <PageHeader title="Điều chỉnh tồn kho" subtitle="Cập nhật số lượng kho thực tế (Kiểm kê, hao hụt, hư hỏng)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle>Thông tin phiếu</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Chi nhánh</Label>
                <Select value={selectedBranchId} onValueChange={setSelectedBranchId} disabled={isBranchManager}>
                  <SelectTrigger><SelectValue placeholder="Chọn chi nhánh" /></SelectTrigger>
                  <SelectContent>
                    {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Lý do chung (Áp dụng nhanh)</Label>
                <Select value={generalReason} onValueChange={setGeneralReason}>
                  <SelectTrigger><SelectValue placeholder="Chọn lý do chung" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kiểm kê định kỳ">Kiểm kê định kỳ</SelectItem>
                    <SelectItem value="Hao hụt/Hư hỏng">Hao hụt/Hư hỏng</SelectItem>
                    <SelectItem value="Hết hạn sử dụng">Hết hạn sử dụng</SelectItem>
                    <SelectItem value="Nhập liệu sai">Nhập liệu sai</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="w-full mt-2" size="sm" onClick={applyGeneralReason} disabled={adjustmentItems.length === 0}>
                  Áp dụng cho tất cả dòng
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Chi tiết điều chỉnh</CardTitle>
                <CardDescription>Thêm nguyên liệu để thay đổi số lượng tồn</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <div className="flex-1 max-w-sm">
                  <Select value={selectedIngredientId} onValueChange={setSelectedIngredientId}>
                    <SelectTrigger><SelectValue placeholder="Tìm và chọn nguyên liệu..." /></SelectTrigger>
                    <SelectContent>
                      {stocks.map((item) => (
                        <SelectItem key={item.ingredientId} value={item.ingredientId}>
                          {item.ingredientName} (Tồn: {item.quantityAvailable} {item.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="secondary" onClick={handleAddItem} disabled={!selectedIngredientId}>
                  <Plus className="w-4 h-4 mr-2" /> Thêm vào danh sách
                </Button>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Tên nguyên liệu</TableHead>
                      <TableHead className="w-24 text-center">Tồn hệ thống</TableHead>
                      <TableHead className="w-32">Tồn thực tế</TableHead>
                      <TableHead className="w-24 text-center">Chênh lệch</TableHead>
                      <TableHead className="w-48">Lý do điều chỉnh</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adjustmentItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-slate-500">
                          Chưa có nguyên liệu nào được chọn để điều chỉnh.
                        </TableCell>
                      </TableRow>
                    ) : (
                      adjustmentItems.map((item, index) => (
                        <TableRow key={item.ingredientId}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-center bg-slate-50">{item.currentStock}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                step="0.1"
                                className="w-20"
                                value={item.newStock === 0 ? "0" : item.newStock || ""}
                                onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value) || 0)}
                              />
                              <span className="text-sm text-slate-500">{item.unit}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {item.difference > 0 ? (
                              <span className="text-emerald-600">+{item.difference}</span>
                            ) : item.difference < 0 ? (
                              <span className="text-red-600">{item.difference}</span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Lý do..."
                              value={item.reason}
                              onChange={(e) => handleReasonChange(index, e.target.value)}
                              className={!item.reason && item.difference !== 0 ? "border-red-300" : ""}
                            />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" className="text-red-500 h-8 w-8 p-0" onClick={() => handleRemoveRow(index)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate(-1)}>Hủy bỏ</Button>
                <Button className="bg-roast hover:bg-roast/90 px-6 py-2 h-10 w-auto" onClick={handleSubmit} disabled={submitting || adjustmentItems.length === 0}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Lưu điều chỉnh
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
