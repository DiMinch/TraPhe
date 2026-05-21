import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Store, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axiosClient from "@/lib/axios-client";

interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  openingHours?: string;
  isActive: boolean;
}

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", address: "", phone: "", openingHours: "" });

  const fetchBranches = async () => {
    try {
      const res = await axiosClient.get<any, any>("/admin/branches");
      setBranches(Array.isArray(res.data) ? res.data : res.data?.content || []);
    } catch {
      toast.error("Không thể tải danh sách chi nhánh");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBranches(); }, []);

  const resetForm = () => {
    setForm({ name: "", address: "", phone: "", openingHours: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosClient.put(`/admin/branches/${editingId}`, form);
        toast.success("Cập nhật chi nhánh thành công");
      } else {
        await axiosClient.post("/admin/branches", form);
        toast.success("Thêm chi nhánh thành công");
      }
      resetForm();
      fetchBranches();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu chi nhánh");
    }
  };

  const handleEdit = (b: Branch) => {
    setForm({ name: b.name, address: b.address, phone: b.phone || "", openingHours: b.openingHours || "" });
    setEditingId(b.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận xoá chi nhánh này?")) return;
    try {
      await axiosClient.delete(`/admin/branches/${id}`);
      toast.success("Đã xoá chi nhánh");
      fetchBranches();
    } catch {
      toast.error("Không thể xoá chi nhánh");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Chi nhánh</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách tất cả chi nhánh trong hệ thống</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Thêm chi nhánh
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="font-semibold text-gray-900">{editingId ? "Sửa chi nhánh" : "Thêm chi nhánh mới"}</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="Tên chi nhánh" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="Địa chỉ" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required className="col-span-2" />
            <Input placeholder="Giờ mở cửa (VD: 07:00-22:00)" value={form.openingHours} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <Button type="submit">{editingId ? "Cập nhật" : "Tạo mới"}</Button>
            <Button type="button" variant="outline" onClick={resetForm}>Huỷ</Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Chi nhánh</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Địa chỉ</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">SĐT</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Giờ mở cửa</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                    <Store className="w-4 h-4 text-gray-400" /> {b.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> {b.address}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{b.phone || "—"}</td>
                  <td className="px-6 py-4 text-gray-600">{b.openingHours || "—"}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(b)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(b.id)}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {branches.length === 0 && <div className="text-center py-12 text-gray-400">Chưa có chi nhánh nào</div>}
        </div>
      )}
    </div>
  );
}
