import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Store, MapPin, ToggleLeft, ToggleRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axiosClient from "@/lib/axios-client";
import { SearchableSelect } from "@/components/common/address/AddressDialog";
import MapLocationPicker from "@/components/common/address/MapLocationPicker";
import { userService } from "@/services/user.service";
import type { Province, Commune } from "@/types/user.types";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Branch {
  id: string;
  name: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  phone?: string;
  openingHours?: string;
  isActive: boolean;
}

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    openingHours: "",
    openTime: "",
    closeTime: "",
    lat: "",
    lng: "",
  });
  const [addressParts, setAddressParts] = useState({
    street: "",
    commune: "",
    communeCode: "",
    province: "",
    provinceCode: "",
  });
  
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [isLoadingCommunes, setIsLoadingCommunes] = useState(false);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await userService.getProvinces();
        if (res.statusCode === 200 && res.data) {
          const provincesData = Array.isArray(res.data) ? res.data : (res.data as any)?.content || [];
          setProvinces(provincesData);
        }
      } catch (error) {
        console.error("Failed to load provinces", error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (addressParts.provinceCode) {
      const fetchCommunes = async () => {
        setIsLoadingCommunes(true);
        try {
          const res = await userService.getCommunes(addressParts.provinceCode);
          if (res.statusCode === 200 && res.data) {
            const communesData = Array.isArray(res.data) ? res.data : (res.data as any)?.content || [];
            setCommunes(communesData);
          }
        } catch (error) {
          console.error("Failed to load communes", error);
        } finally {
          setIsLoadingCommunes(false);
        }
      };
      fetchCommunes();
    } else {
      setCommunes([]);
    }
  }, [addressParts.provinceCode]);

  const handleProvinceChange = (code: string) => {
    const selected = provinces.find((p) => String(p.code) === code);
    setAddressParts((prev) => ({
      ...prev,
      provinceCode: code,
      province: selected ? selected.name : "",
      communeCode: "",
      commune: "",
    }));
  };

  const handleCommuneChange = (code: string) => {
    const selected = communes.find((c) => String(c.code) === code);
    setAddressParts((prev) => ({
      ...prev,
      communeCode: code,
      commune: selected ? selected.name : "",
    }));
  };

  const fetchBranches = async () => {
    try {
      const res = await axiosClient.get<any, any>("/admin/branches");
      const rawData = Array.isArray(res) ? res : (res?.data || res?.data?.content || []);
      const mapped = rawData.map((b: any) => ({
        ...b,
        isActive: b.active !== undefined ? b.active : (b.isActive !== undefined ? b.isActive : true),
      }));
      setBranches(mapped);
    } catch {
      toast.error("Không thể tải danh sách chi nhánh");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBranches(); }, []);

  const resetForm = () => {
    setForm({ name: "", phone: "", openingHours: "", openTime: "", closeTime: "", lat: "", lng: "" });
    setAddressParts({
      street: "",
      commune: "",
      communeCode: "",
      province: "",
      provinceCode: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressParts.province || !addressParts.commune || !addressParts.street) {
      toast.warning("Vui lòng nhập đầy đủ địa chỉ (Số nhà, Xã/Phường, Tỉnh/Thành)");
      return;
    }

    // Validate lat/lng if provided
    if (form.lat && isNaN(Number(form.lat))) {
      toast.error("Vĩ độ (Latitude) phải là số thực hợp lệ");
      return;
    }
    if (form.lng && isNaN(Number(form.lng))) {
      toast.error("Kinh độ (Longitude) phải là số thực hợp lệ");
      return;
    }
    
    if ((form.openTime && !form.closeTime) || (!form.openTime && form.closeTime)) {
      toast.warning("Vui lòng nhập cả giờ mở cửa và giờ đóng cửa");
      return;
    }
    const openingHoursFormatted = form.openTime && form.closeTime ? `${form.openTime}-${form.closeTime}` : undefined;

    const fullAddress = `${addressParts.street}, ${addressParts.commune}, ${addressParts.province}`;
    const payload: any = {
      name: form.name,
      address: fullAddress,
      phone: form.phone || undefined,
      openingHours: openingHoursFormatted,
      lat: form.lat ? Number(form.lat) : undefined,
      lng: form.lng ? Number(form.lng) : undefined,
    };

    try {
      if (editingId) {
        await axiosClient.put(`/admin/branches/${editingId}`, payload);
        toast.success("Cập nhật chi nhánh thành công");
      } else {
        await axiosClient.post("/admin/branches", payload);
        toast.success("Thêm chi nhánh thành công");
      }
      resetForm();
      fetchBranches();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu chi nhánh");
    }
  };

  const handleEdit = (b: Branch) => {
    let open = "";
    let close = "";
    if (b.openingHours && b.openingHours.includes("-")) {
      const parts = b.openingHours.split("-");
      open = parts[0].trim();
      close = parts[1].trim();
    }

    setForm({
      name: b.name,
      phone: b.phone || "",
      openingHours: b.openingHours || "",
      openTime: open,
      closeTime: close,
      lat: b.lat != null ? String(b.lat) : "",
      lng: b.lng != null ? String(b.lng) : "",
    });
    
    // Parse existing address if possible
    const parts = b.address.split(",").map(s => s.trim());
    if (parts.length >= 3) {
      const isOldFormat = parts.length >= 4;
      const streetName = isOldFormat ? parts[0] + ", " + parts[1] : parts[0];
      const communeName = isOldFormat ? parts[2] : parts[1];
      const provinceName = isOldFormat ? parts[3] : parts[2];
      
      const matchedProvince = provinces.find(p => p.name.includes(provinceName) || provinceName.includes(p.name));
      
      setAddressParts({
        street: streetName,
        commune: communeName,
        communeCode: "",
        province: matchedProvince ? matchedProvince.name : provinceName,
        provinceCode: matchedProvince ? String(matchedProvince.code) : "",
      });
    } else {
      setAddressParts({
        street: b.address,
        commune: "",
        communeCode: "",
        province: "",
        provinceCode: "",
      });
    }

    setEditingId(b.id);
    setShowForm(true);
  };

  const handleToggleActive = async (b: Branch) => {
    try {
      await axiosClient.put(`/admin/branches/${b.id}`, {
        name: b.name,
        address: b.address,
        phone: b.phone,
        openingHours: b.openingHours,
        lat: b.lat,
        lng: b.lng,
        isActive: !b.isActive,
      });
      toast.success(b.isActive ? "Đã tạm đóng chi nhánh" : "Đã kích hoạt lại chi nhánh");
      fetchBranches();
    } catch {
      toast.error("Không thể cập nhật trạng thái");
    }
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
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Chi nhánh</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách tất cả chi nhánh trong hệ thống</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2 bg-roast hover:bg-[#4A2810] text-white">
          <Plus className="w-4 h-4" /> Thêm chi nhánh
        </Button>
      </div>

      {/* ===== Modal Dialog for Create / Edit ===== */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Sửa chi nhánh" : "Thêm chi nhánh mới"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Cập nhật thông tin chi nhánh" : "Nhập thông tin chi nhánh mới vào hệ thống"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tên chi nhánh *</Label>
                <Input placeholder="VD: TraPhe - Quận 1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input placeholder="0901234567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Giờ mở cửa</Label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input 
                      type="time" 
                      value={form.openTime || ""} 
                      onChange={(e) => setForm({ ...form, openTime: e.target.value })} 
                    />
                  </div>
                  <span className="text-gray-500 font-medium">đến</span>
                  <div className="flex-1">
                    <Input 
                      type="time" 
                      value={form.closeTime || ""} 
                      onChange={(e) => setForm({ ...form, closeTime: e.target.value })} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 text-sm">Địa chỉ chi nhánh</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tỉnh / Thành phố *</Label>
                  <SearchableSelect<Province>
                    value={addressParts.provinceCode}
                    onChange={handleProvinceChange}
                    options={provinces}
                    getOptionValue={(p) => String(p.code)}
                    getOptionLabel={(p) => p.name}
                    placeholder="Chọn Tỉnh / Thành phố"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quận / Huyện / Xã / Phường *</Label>
                  <SearchableSelect<Commune>
                    value={addressParts.communeCode}
                    onChange={handleCommuneChange}
                    options={communes}
                    getOptionValue={(c) => String(c.code)}
                    getOptionLabel={(c) => c.name}
                    placeholder={isLoadingCommunes ? "Đang tải..." : "Chọn Quận / Huyện / Xã / Phường"}
                    disabled={!addressParts.provinceCode || isLoadingCommunes}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Số nhà, Tên đường *</Label>
                  <Input 
                    placeholder="Số nhà, Tên đường" 
                    value={addressParts.street} 
                    onChange={(e) => setAddressParts({ ...addressParts, street: e.target.value })} 
                    required 
                  />
                </div>
              </div>
            </div>
            
            {/* Coordinates & Map */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 text-sm">Tọa độ (lat/lng)</h4>
              <MapLocationPicker
                lat={form.lat}
                lng={form.lng}
                onChange={(newLat, newLng) => setForm({ ...form, lat: newLat, lng: newLng })}
                address={addressParts.street && addressParts.commune && addressParts.province ? `${addressParts.street}, ${addressParts.commune}, ${addressParts.province}` : ""}
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vĩ độ (Latitude)</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="VD: 10.7769"
                    value={form.lat}
                    onChange={(e) => setForm({ ...form, lat: e.target.value })}
                  />
                  {form.lat && isNaN(Number(form.lat)) && (
                    <p className="text-xs text-red-500">Phải là số thực hợp lệ</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Kinh độ (Longitude)</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="VD: 106.7009"
                    value={form.lng}
                    onChange={(e) => setForm({ ...form, lng: e.target.value })}
                  />
                  {form.lng && isNaN(Number(form.lng)) && (
                    <p className="text-xs text-red-500">Phải là số thực hợp lệ</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 justify-end">
              <Button type="button" variant="outline" onClick={resetForm}>Huỷ</Button>
              <Button type="submit" className="bg-roast hover:bg-[#4A2810] text-white">{editingId ? "Cập nhật" : "Tạo mới"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===== Branch Table ===== */}
      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 whitespace-nowrap">Chi nhánh</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 whitespace-nowrap">Địa chỉ</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 whitespace-nowrap">SĐT</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 whitespace-nowrap">Giờ mở cửa</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 whitespace-nowrap">Trạng thái</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500 whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {branches.map((b) => (
                  <tr key={b.id} className={`hover:bg-gray-50 ${!b.isActive ? "opacity-60" : ""}`}>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-gray-400 shrink-0" /> {b.name}
                      </div>
                      {b.lat != null && b.lng != null && (
                        <span className="text-xs text-gray-400 ml-6">({b.lat}, {b.lng})</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" /> 
                        <span className="truncate max-w-[250px] inline-block" title={b.address}>{b.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{b.phone || "—"}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{b.openingHours || "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {b.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3.5 h-3.5" /> Tạm đóng
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        title={b.isActive ? "Tạm đóng chi nhánh" : "Kích hoạt lại"}
                        onClick={() => handleToggleActive(b)}
                        className={b.isActive ? "text-orange-500 hover:text-orange-700 hover:bg-orange-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                      >
                        {b.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(b)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(b.id)}><Trash2 className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {branches.length === 0 && <div className="text-center py-12 text-gray-400">Chưa có chi nhánh nào</div>}
        </div>
      )}
    </div>
  );
}
