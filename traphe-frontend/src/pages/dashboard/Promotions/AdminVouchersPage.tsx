import { useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Ticket,
  Plus,
  Search,
  Download,
  Eye,
  Calendar,
  Copy,
  Trash2,
  Loader2,
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";
import { toast } from "sonner";
import { format } from "date-fns";

interface VoucherBatch {
  id: string;
  batchName: string;
  prefix: string;
  quantity: number;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "EXPIRED" | "DRAFT";
  codes: string[];
}

const INITIAL_BATCHES: VoucherBatch[] = [
  {
    id: "b1",
    batchName: "Chào hè 2026 - Thành viên mới",
    prefix: "WELCOME26",
    quantity: 100,
    discountType: "PERCENTAGE",
    discountValue: 15,
    minOrderValue: 40000,
    maxDiscount: 20000,
    startDate: "2026-05-01",
    endDate: "2026-06-30",
    status: "ACTIVE",
    codes: Array.from({ length: 10 }, () => `WELCOME26-${Math.random().toString(36).substring(2, 6).toUpperCase()}`),
  },
  {
    id: "b2",
    batchName: "Tri ân khách hàng tháng 5",
    prefix: "THANKSM5",
    quantity: 50,
    discountType: "FIXED_AMOUNT",
    discountValue: 30000,
    minOrderValue: 80000,
    maxDiscount: 30000,
    startDate: "2026-05-15",
    endDate: "2026-05-31",
    status: "ACTIVE",
    codes: Array.from({ length: 5 }, () => `THANKSM5-${Math.random().toString(36).substring(2, 6).toUpperCase()}`),
  },
  {
    id: "b3",
    batchName: "Đồng giá khai trương chi nhánh 3",
    prefix: "OPENING3",
    quantity: 200,
    discountType: "PERCENTAGE",
    discountValue: 30,
    minOrderValue: 0,
    maxDiscount: 50000,
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    status: "EXPIRED",
    codes: [],
  },
];

export default function AdminVouchersPage() {
  const [batches, setBatches] = useState<VoucherBatch[]>(INITIAL_BATCHES);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewCodesOpen, setIsViewCodesOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<VoucherBatch | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    batchName: "",
    prefix: "",
    quantity: 50,
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    discountValue: 10,
    minOrderValue: 30000,
    maxDiscount: 15000,
    startDate: "2026-05-21",
    endDate: "2026-06-21",
  });

  const handleOpenCreate = () => {
    setFormData({
      batchName: "",
      prefix: "",
      quantity: 50,
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderValue: 30000,
      maxDiscount: 15000,
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    });
    setIsCreateOpen(true);
  };

  const handleCreateBatch = () => {
    if (!formData.batchName.trim() || !formData.prefix.trim()) {
      toast.warning("Vui lòng điền đầy đủ thông tin Tên đợt và Tiền tố.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const generatedCodes = Array.from(
        { length: Number(formData.quantity) },
        () => `${formData.prefix.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      );

      const newBatch: VoucherBatch = {
        id: "b-" + Math.random().toString(36).substring(2, 9),
        batchName: formData.batchName,
        prefix: formData.prefix.toUpperCase(),
        quantity: Number(formData.quantity),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue),
        maxDiscount: Number(formData.maxDiscount),
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: "ACTIVE",
        codes: generatedCodes,
      };

      setBatches([newBatch, ...batches]);
      setSubmitting(false);
      setIsCreateOpen(false);
      toast.success(`Đã tạo đợt voucher và phát hành thành công ${formData.quantity} mã mới!`);
    }, 1000);
  };

  const handleViewCodes = (batch: VoucherBatch) => {
    setSelectedBatch(batch);
    setIsViewCodesOpen(true);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã: ${code}`);
  };

  const handleDownloadCSV = (batch: VoucherBatch) => {
    // Basic CSV download simulation
    const csvContent = "data:text/csv;charset=utf-8,Voucher Code,Discount Value,Min Order\n" + 
      batch.codes.map(c => `${c},${batch.discountValue}${batch.discountType === "PERCENTAGE" ? "%" : "đ"},${batch.minOrderValue}đ`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Vouchers_${batch.prefix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Tải xuống danh sách mã voucher dạng CSV thành công!");
  };

  const handleDeleteBatch = (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đợt voucher này?")) return;
    setBatches(batches.filter((b) => b.id !== id));
    toast.success("Đã xóa đợt voucher thành công.");
  };

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.prefix.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageContainer>
      <PageHeader
        title="Phát hành Voucher hàng loạt"
        subtitle="Tạo đợt phát hành mã ưu đãi ngẫu nhiên số lượng lớn cho chiến dịch marketing hoặc sự kiện"
        onRefresh={() => toast.success("Đã tải lại danh sách đợt voucher!")}
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 mt-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm đợt voucher, tiền tố..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Trạng thái đợt" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
              <SelectItem value="EXPIRED">Đã hết hạn</SelectItem>
              <SelectItem value="DRAFT">Bản nháp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Phát hành đợt mới
        </Button>
      </div>

      {/* Table List of Batches */}
      <Card className="shadow-md border border-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Tên đợt / Tiền tố</TableHead>
                <TableHead className="text-center">Số lượng mã</TableHead>
                <TableHead>Trị giá ưu đãi</TableHead>
                <TableHead>Hạn sử dụng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    Không tìm thấy đợt phát hành voucher nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredBatches.map((batch) => (
                  <TableRow key={batch.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="font-semibold text-slate-800">{batch.batchName}</div>
                      <div className="text-xs text-indigo-600 font-mono">Tiền tố: {batch.prefix}-XXXX</div>
                    </TableCell>
                    <TableCell className="text-center font-semibold text-slate-600">
                      {batch.quantity} mã
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-800">
                        {batch.discountType === "PERCENTAGE"
                          ? `Giảm ${batch.discountValue}%`
                          : `Giảm ${batch.discountValue.toLocaleString()}đ`}
                      </div>
                      <div className="text-xs text-slate-400">
                        Hóa đơn tối thiểu: {batch.minOrderValue.toLocaleString()}đ
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {format(new Date(batch.startDate), "dd/MM/yyyy")} - {format(new Date(batch.endDate), "dd/MM/yyyy")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          batch.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100"
                            : "bg-red-50 text-red-700 hover:bg-red-50 border-red-100"
                        }
                      >
                        {batch.status === "ACTIVE" ? "Đang áp dụng" : "Đã hết hạn"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {batch.codes.length > 0 && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewCodes(batch)}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Xem mã
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadCSV(batch)}
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Xuất file
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBatch(batch.id)}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Batch Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-[550px] bg-white">
          <DialogHeader>
            <DialogTitle>Tạo đợt phát hành Voucher hàng loạt</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1">
              <Label htmlFor="batchName">Tên đợt voucher *</Label>
              <Input
                id="batchName"
                placeholder="Ví dụ: Voucher Tặng Cựu Sinh Viên K22"
                value={formData.batchName}
                onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                className="bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="prefix">Tiền tố mã *</Label>
                <Input
                  id="prefix"
                  placeholder="Ví dụ: SVIEN22"
                  value={formData.prefix}
                  onChange={(e) => setFormData({ ...formData, prefix: e.target.value.toUpperCase() })}
                  className="bg-white font-mono"
                />
                <span className="text-[10px] text-slate-400">Hệ thống tự động thêm hậu tố ngẫu nhiên phía sau</span>
              </div>

              <div className="space-y-1">
                <Label htmlFor="quantity">Số lượng mã cần tạo</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="discountType">Phân loại giảm giá</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(val: any) => setFormData({ ...formData, discountType: val })}
                >
                  <SelectTrigger id="discountType" className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Theo Phần trăm (%)</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Số tiền cố định (đ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="discountValue">Giá trị giảm giá *</Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="1"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="minOrderValue">Hóa đơn tối thiểu (đ)</Label>
                <Input
                  id="minOrderValue"
                  type="number"
                  min="0"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="maxDiscount">Giảm tối đa (đ)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  min="0"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                  disabled={formData.discountType === "FIXED_AMOUNT"}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="endDate">Ngày hết hạn</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-white"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              onClick={handleCreateBatch}
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Tạo và phát hành mã
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Codes Dialog */}
      <Dialog open={isViewCodesOpen} onOpenChange={setIsViewCodesOpen}>
        <DialogContent className="max-w-[450px] bg-white">
          <DialogHeader>
            <DialogTitle>Danh sách mã đã tạo ({selectedBatch?.prefix})</DialogTitle>
          </DialogHeader>

          <div className="max-h-[350px] overflow-y-auto py-2 space-y-2 pr-2">
            {selectedBatch?.codes.map((code, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <span className="font-mono font-bold text-slate-800">{code}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyCode(code)}
                  className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Sao chép
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => selectedBatch && handleDownloadCSV(selectedBatch)}
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Tải file CSV
            </Button>
            <Button onClick={() => setIsViewCodesOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
