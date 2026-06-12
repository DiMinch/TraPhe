import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axiosClient from "@/lib/axios-client";

interface Ingredient { id: string; name: string; unit: string; description?: string; }

export default function AdminIngredientsPage() {
  const [items, setItems] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", unit: "", description: "" });

  const fetch = async () => {
    try {
      const res = await axiosClient.get<any, any>("/admin/ingredients");
      setItems(Array.isArray(res.data) ? res.data : res.data?.content || []);
    } catch { toast.error("Không thể tải nguyên liệu"); }
    finally { setIsLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const reset = () => { setForm({ name: "", unit: "", description: "" }); setEditingId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) { await axiosClient.put(`/admin/ingredients/${editingId}`, form); toast.success("Đã cập nhật"); }
      else { await axiosClient.post("/admin/ingredients", form); toast.success("Đã thêm nguyên liệu"); }
      reset(); fetch();
    } catch (err: any) { toast.error(err.response?.data?.message || "Lỗi"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xoá nguyên liệu này?")) return;
    try { await axiosClient.delete(`/admin/ingredients/${id}`); toast.success("Đã xoá"); fetch(); }
    catch { toast.error("Không thể xoá"); }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Danh mục Nguyên liệu</h1><p className="text-sm text-gray-500 mt-1">Quản lý nguyên liệu pha chế</p></div>
        <Button onClick={() => { reset(); setShowForm(true); }} className="gap-2"><Plus className="w-4 h-4" /> Thêm NL</Button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="font-semibold">{editingId ? "Sửa" : "Thêm"} nguyên liệu</h3>
          <div className="grid grid-cols-3 gap-4">
            <Input placeholder="Tên nguyên liệu" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Đơn vị (g, ml, ...)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
            <Input placeholder="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-2"><Button type="submit">{editingId ? "Cập nhật" : "Tạo"}</Button><Button type="button" variant="outline" onClick={reset}>Huỷ</Button></div>
        </form>
      )}
      {isLoading ? <div className="h-40 bg-gray-100 rounded-lg animate-pulse" /> : (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr><th className="text-left px-6 py-3 font-medium text-gray-500">Nguyên liệu</th><th className="text-left px-6 py-3 font-medium text-gray-500">Đơn vị</th><th className="text-left px-6 py-3 font-medium text-gray-500">Mô tả</th><th className="text-right px-6 py-3 font-medium text-gray-500">Thao tác</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((it) => (
                <tr key={it.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium flex items-center gap-2"><Leaf className="w-4 h-4 text-green-500" />{it.name}</td>
                  <td className="px-6 py-4 text-gray-600">{it.unit}</td>
                  <td className="px-6 py-4 text-gray-600">{it.description || "—"}</td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => { setForm({ name: it.name, unit: it.unit, description: it.description || "" }); setEditingId(it.id); setShowForm(true); }}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(it.id)}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <div className="text-center py-12 text-gray-400">Chưa có nguyên liệu nào</div>}
        </div>
      )}
    </div>
  );
}
