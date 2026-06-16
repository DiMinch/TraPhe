import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Gift,
  Coins,
  CupSoda,
  Ticket,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";
import { toast } from "sonner";
import { promotionService } from "@/services/promotion.service";

interface LoyaltyReward {
  id: string;
  name: string;
  type: "DRINK" | "VOUCHER" | "MERCHANDISE";
  pointsRequired: number;
  description: string;
  stock: number;
  isActive: boolean;
  discountValue?: number;
  discountType?: string;
}

export default function AdminLoyaltyRewardsPage() {
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<LoyaltyReward | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "DRINK" as "DRINK" | "VOUCHER" | "MERCHANDISE",
    pointsRequired: 100,
    description: "",
    stock: 999,
    isActive: true,
    discountValue: 0,
    discountType: "FIXED_AMOUNT" as "FIXED_AMOUNT" | "PERCENTAGE",
  });

  const fetchRewards = async () => {
    setIsLoading(true);
    try {
      const res = await promotionService.adminGetLoyaltyRewards();
      if (res.data) {
        setRewards(res.data as any[]);
      }
    } catch (error: any) {
      console.error("Failed to fetch loyalty rewards", error);
      toast.error("Không thể tải danh sách quà đổi điểm");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleOpenAddDialog = () => {
    setEditingReward(null);
    setFormData({
      name: "",
      type: "DRINK",
      pointsRequired: 100,
      description: "",
      stock: 999,
      isActive: true,
      discountValue: 0,
      discountType: "FIXED_AMOUNT",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (reward: LoyaltyReward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      type: reward.type,
      pointsRequired: reward.pointsRequired,
      description: reward.description,
      stock: reward.stock,
      isActive: reward.isActive,
      discountValue: reward.discountValue ?? 0,
      discountType: (reward.discountType as any) ?? "FIXED_AMOUNT",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa quà tặng này?")) return;
    try {
      await promotionService.adminDeleteLoyaltyReward(id);
      setRewards((prev) => prev.filter((r) => r.id !== id));
      toast.success("Đã xóa quà tặng thành công!");
    } catch (error: any) {
      console.error("Failed to delete reward", error);
      toast.error("Không thể xóa quà tặng");
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.warning("Vui lòng điền đầy đủ tên và mô tả quà tặng");
      return;
    }

    setIsSaving(true);
    try {
      if (editingReward) {
        // Edit mode
        const res = await promotionService.adminUpdateLoyaltyReward(editingReward.id, {
          name: formData.name,
          type: formData.type,
          pointsRequired: Number(formData.pointsRequired),
          description: formData.description,
          stock: Number(formData.stock),
          isActive: formData.isActive,
          discountValue: formData.type === "VOUCHER" ? Number(formData.discountValue) : undefined,
          discountType: formData.type === "VOUCHER" ? formData.discountType : undefined,
        });
        if (res.data) {
          toast.success("Cập nhật quà tặng thành công!");
          fetchRewards();
        }
      } else {
        // Add mode
        const res = await promotionService.adminCreateLoyaltyReward({
          name: formData.name,
          type: formData.type,
          pointsRequired: Number(formData.pointsRequired),
          description: formData.description,
          stock: Number(formData.stock),
          isActive: formData.isActive,
          discountValue: formData.type === "VOUCHER" ? Number(formData.discountValue) : undefined,
          discountType: formData.type === "VOUCHER" ? formData.discountType : undefined,
        });
        if (res.data) {
          toast.success("Thêm quà tặng mới thành công!");
          fetchRewards();
        }
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Failed to save reward", error);
      toast.error("Có lỗi xảy ra khi lưu quà tặng");
    } finally {
      setIsSaving(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "DRINK":
        return <CupSoda className="w-5 h-5 text-roast" />;
      case "VOUCHER":
        return <Ticket className="w-5 h-5 text-amber-600" />;
      case "MERCHANDISE":
        return <ShoppingBag className="w-5 h-5 text-rose-600" />;
      default:
        return <Gift className="w-5 h-5 text-slate-600" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "DRINK":
        return "Đồ uống";
      case "VOUCHER":
        return "Voucher giảm giá";
      case "MERCHANDISE":
        return "Quà tặng lưu niệm";
      default:
        return "Khác";
    }
  };

  const filteredRewards = rewards.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <PageContainer>
      <PageHeader
        title="Catalogue quà đổi điểm"
        subtitle="Quản lý các loại quà tặng, đồ uống và mã giảm giá mà khách hàng có thể đổi bằng điểm tích lũy"
        onRefresh={fetchRewards}
      />

      {/* Filter and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 mt-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm tên quà tặng, ưu đãi..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Phân loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại quà</SelectItem>
              <SelectItem value="DRINK">Đồ uống miễn phí</SelectItem>
              <SelectItem value="VOUCHER">Voucher giảm giá</SelectItem>
              <SelectItem value="MERCHANDISE">Quà lưu niệm</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleOpenAddDialog}
          className="bg-roast hover:bg-roast/90 text-white font-medium shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm quà tặng mới
        </Button>
      </div>

      {/* Rewards Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-roast" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white border border-slate-200 rounded-2xl">
              <Gift className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Không tìm thấy quà tặng nào phù hợp</p>
            </div>
          ) : (
            filteredRewards.map((reward) => (
              <Card
                key={reward.id}
                className={`shadow-sm hover:shadow-md transition-shadow border border-slate-200 overflow-hidden flex flex-col justify-between ${
                  !reward.isActive ? "bg-slate-50/70 border-slate-100" : "bg-white"
                }`}
              >
                <div>
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getIcon(reward.type)}
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {getTypeText(reward.type)}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`rounded-full px-2.5 py-0.5 ${
                        reward.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {reward.isActive ? "Đang mở" : "Đã ẩn"}
                    </Badge>
                  </div>

                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-semibold text-slate-800 line-clamp-1">{reward.name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-3 min-h-[60px]">
                      {reward.description}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 text-amber-600 font-semibold text-md">
                        <Coins className="w-4 h-4" />
                        <span>{reward.pointsRequired} Điểm</span>
                      </div>

                      <div className="text-xs text-slate-400">
                        Kho:{" "}
                        <span
                          className={`font-semibold ${
                            reward.stock === 0
                              ? "text-red-500"
                              : reward.stock < 50
                              ? "text-amber-500"
                              : "text-slate-600"
                          }`}
                        >
                          {reward.stock === 0 ? "Hết quà" : reward.stock}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditDialog(reward)}
                    className="text-slate-600 hover:text-roast hover:bg-slate-100"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Sửa
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(reward.id)}
                    className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Xóa
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingReward ? "Cập nhật quà tặng" : "Thêm quà tặng loyalty mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1">
              <Label htmlFor="reward-name">Tên quà tặng *</Label>
              <Input
                id="reward-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ví dụ: Voucher giảm 30k"
                className="bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="reward-type">Phân loại</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                >
                  <SelectTrigger id="reward-type" className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRINK">Đồ uống miễn phí</SelectItem>
                    <SelectItem value="VOUCHER">Voucher giảm giá</SelectItem>
                    <SelectItem value="MERCHANDISE">Quà lưu niệm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="reward-points">Số điểm yêu cầu *</Label>
                <Input
                  id="reward-points"
                  type="number"
                  min="1"
                  value={formData.pointsRequired}
                  onChange={(e) => setFormData({ ...formData, pointsRequired: Number(e.target.value) })}
                  className="bg-white"
                />
              </div>
            </div>

            {formData.type === "VOUCHER" && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="space-y-1">
                  <Label htmlFor="reward-discount-type">Loại giảm giá</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(val: any) => setFormData({ ...formData, discountType: val })}
                  >
                    <SelectTrigger id="reward-discount-type" className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIXED_AMOUNT">Số tiền cố định (đ)</SelectItem>
                      <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="reward-discount-value">Giá trị giảm *</Label>
                  <Input
                    id="reward-discount-value"
                    type="number"
                    min="0"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="bg-white"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="reward-stock">Số lượng trong kho</Label>
                <Input
                  id="reward-stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="reward-status">Trạng thái áp dụng</Label>
                <Select
                  value={formData.isActive ? "ACTIVE" : "HIDDEN"}
                  onValueChange={(val) => setFormData({ ...formData, isActive: val === "ACTIVE" })}
                >
                  <SelectTrigger id="reward-status" className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Mở đổi quà</SelectItem>
                    <SelectItem value="HIDDEN">Ẩn quà tặng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="reward-desc">Mô tả chi tiết *</Label>
              <Input
                id="reward-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Điều kiện áp dụng, thời hạn sử dụng..."
                className="bg-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Hủy bỏ
            </Button>
            <Button
              onClick={handleSave}
              className="bg-roast hover:bg-roast/90 text-white"
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
