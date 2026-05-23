import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, Loader2, ArrowLeft } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";
import { toast } from "sonner";
import { branchStockService, type ImportStockRequest, type ImportItem } from "@/services/branch-stock.service";
import { supplierService, type SupplierResponse } from "@/services/supplier.service";
import axiosClient from "@/lib/axios-client";
import { authService } from "@/services/auth.service";
import { UserRole } from "@/enums/roles.enum";
import { useNavigate } from "react-router";

export default function ImportStockPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("none");
  const [ingredients, setIngredients] = useState<any[]>([]);
  
  const [items, setItems] = useState<ImportItem[]>([{ ingredientId: "", quantity: 0 }]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();
  const isBranchManager = currentUser?.roles?.includes(UserRole.BRANCH_MANAGER) && !currentUser?.roles?.includes(UserRole.ADMIN);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Branches
      let branchData = [];
      if (isBranchManager && currentUser?.branchId) {
        branchData = [{ id: currentUser.branchId, name: "Chi nhánh của tôi" }];
      } else {
        const branchRes = await axiosClient.get("/branches");
        const allBranches = Array.isArray(branchRes.data) ? branchRes.data : branchRes.data?.content || [];
        branchData = allBranches;
      }
      setBranches(branchData);
      if (branchData.length > 0) setSelectedBranchId(branchData[0].id);

      // Suppliers
      const supplierRes = await supplierService.getAllSuppliers();
      setSuppliers(supplierRes.data || []);

      // Ingredients
      const ingRes = await axiosClient.get("/admin/ingredients");
      setIngredients(Array.isArray(ingRes.data) ? ingRes.data : ingRes.data?.content || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Không thể tải dữ liệu khởi tạo");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { ingredientId: "", quantity: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof ImportItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (!selectedBranchId) return toast.error("Vui lòng chọn chi nhánh");
    
    // Validate items
    const validItems = items.filter(i => i.ingredientId && i.quantity > 0);
    if (validItems.length === 0) {
      return toast.error("Vui lòng thêm ít nhất 1 nguyên liệu hợp lệ với số lượng > 0");
    }

    setSubmitting(true);
    try {
      const data: ImportStockRequest = {
        supplierId: selectedSupplierId === "none" ? undefined : selectedSupplierId,
        items: validItems
      };
      await branchStockService.importStock(selectedBranchId, data);
      toast.success("Nhập kho thành công");
      navigate("/admin/stock/all");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi nhập kho");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-roast" /></div>;
  }

  return (
    <PageContainer>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="p-2"><ArrowLeft className="w-5 h-5" /></Button>
        <PageHeader title="Nhập kho nguyên liệu" subtitle="Tạo phiếu nhập kho mới" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Thông tin phiếu nhập</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Chi nhánh</label>
                <Select value={selectedBranchId} onValueChange={setSelectedBranchId} disabled={isBranchManager}>
                  <SelectTrigger><SelectValue placeholder="Chọn chi nhánh" /></SelectTrigger>
                  <SelectContent>
                    {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nhà cung cấp (Tuỳ chọn)</label>
                <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                  <SelectTrigger><SelectValue placeholder="Chọn nhà cung cấp" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không chọn (Nhập lẻ)</SelectItem>
                    {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Danh sách nguyên liệu</CardTitle>
              <Button variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="w-4 h-4 mr-2" /> Thêm dòng
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 items-end bg-slate-50 p-4 rounded-lg border">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Nguyên liệu</label>
                    <Select value={item.ingredientId} onValueChange={(val) => handleItemChange(index, "ingredientId", val)}>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="Chọn nguyên liệu" /></SelectTrigger>
                      <SelectContent>
                        {ingredients.map(ing => (
                          <SelectItem key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32 space-y-2">
                    <label className="text-sm font-medium">Số lượng</label>
                    <Input 
                      type="number" 
                      min="0.1" 
                      step="0.1"
                      className="bg-white"
                      value={item.quantity || ""} 
                      onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)} 
                    />
                  </div>
                  <Button variant="ghost" className="text-red-500 mb-1" onClick={() => handleRemoveItem(index)} disabled={items.length <= 1}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <div className="pt-6 flex justify-end">
                <Button className="bg-roast hover:bg-roast/90 w-40" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Hoàn tất nhập kho
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
