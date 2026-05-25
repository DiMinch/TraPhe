import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { toppingService, type Topping } from "@/services/topping.service";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export default function AdminToppingsPage() {
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: "",
    extraPrice: "",
    isAvailable: true,
  });

  const fetchToppings = async () => {
    try {
      setIsLoading(true);
      const res = await toppingService.getAll({ size: 100 });
      const content = res.data?.content ?? res.data ?? [];
      if (Array.isArray(content)) {
        const mapped = content.map((t: any) => ({
          ...t,
          isAvailable: t.isAvailable ?? t.available ?? true,
          available: t.available ?? t.isAvailable ?? true,
        }));
        setToppings(mapped);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách Topping");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchToppings();
  }, []);

  const resetForm = () => {
    setForm({ name: "", extraPrice: "", isAvailable: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.extraPrice === "") {
      toast.error("Vui lòng nhập tên và giá Topping");
      return;
    }

    const payload = {
      name: form.name,
      extraPrice: Number(form.extraPrice),
      isAvailable: form.isAvailable,
    };

    try {
      if (editingId) {
        await toppingService.update(editingId, payload);
        toast.success("Cập nhật Topping thành công");
      } else {
        await toppingService.create(payload);
        toast.success("Thêm Topping thành công");
      }
      resetForm();
      fetchToppings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu Topping");
    }
  };

  const handleEdit = (t: Topping) => {
    setForm({
      name: t.name,
      extraPrice: t.extraPrice.toString(),
      isAvailable: t.isAvailable ?? t.available ?? true,
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá Topping này?")) return;
    try {
      await toppingService.delete(id);
      toast.success("Đã xoá Topping");
      fetchToppings();
    } catch (error) {
      toast.error("Lỗi khi xoá Topping");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Topping</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách các lựa chọn thêm (Topping) cho đồ uống</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2 bg-roast hover:bg-[#4A2810] text-white">
          <Plus className="w-4 h-4" /> Thêm Topping
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="font-semibold text-gray-900">{editingId ? "Sửa Topping" : "Thêm Topping mới"}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tên Topping</Label>
              <Input
                placeholder="VD: Trân châu trắng"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Giá cộng thêm (VNĐ)</Label>
              <Input
                type="number"
                placeholder="VD: 10000"
                value={form.extraPrice}
                onChange={(e) => setForm({ ...form, extraPrice: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="is-available"
              checked={form.isAvailable}
              onCheckedChange={(checked) => setForm({ ...form, isAvailable: checked })}
            />
            <Label htmlFor="is-available">Đang phục vụ</Label>
          </div>
          
          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <Button type="submit" className="bg-roast hover:bg-[#4A2810] text-white">
              {editingId ? "Cập nhật" : "Tạo mới"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>Huỷ</Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Tên Topping</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Giá cộng thêm</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Trạng thái</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {toppings.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{t.name}</td>
                  <td className="px-6 py-4 text-roast font-semibold">{formatCurrency(t.extraPrice)}</td>
                  <td className="px-6 py-4">
                    {t.isAvailable ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Có sẵn
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        <XCircle className="w-3.5 h-3.5" /> Hết hàng
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(t)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {toppings.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Chưa có Topping nào được tạo
            </div>
          )}
        </div>
      )}
    </div>
  );
}
