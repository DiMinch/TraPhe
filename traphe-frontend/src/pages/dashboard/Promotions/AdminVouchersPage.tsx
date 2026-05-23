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
    batchName: "ChÃ o hÃ¨ 2026 - ThÃ nh viÃªn má»›i",
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
    batchName: "Tri Ã¢n khÃ¡ch hÃ ng thÃ¡ng 5",
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
    batchName: "Äá»“ng giÃ¡ khai trÆ°Æ¡ng chi nhÃ¡nh 3",
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
      toast.warning("Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin TÃªn Ä‘á»£t vÃ  Tiá»n tá»‘.");
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
      toast.success(`ÄÃ£ táº¡o Ä‘á»£t voucher vÃ  phÃ¡t hÃ nh thÃ nh cÃ´ng ${formData.quantity} mÃ£ má»›i!`);
    }, 1000);
  };

  const handleViewCodes = (batch: VoucherBatch) => {
    setSelectedBatch(batch);
    setIsViewCodesOpen(true);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`ÄÃ£ sao chÃ©p mÃ£: ${code}`);
  };

  const handleDownloadCSV = (batch: VoucherBatch) => {
    // Basic CSV download simulation
    const csvContent = "data:text/csv;charset=utf-8,Voucher Code,Discount Value,Min Order\n" + 
      batch.codes.map(c => `${c},${batch.discountValue}${batch.discountType === "PERCENTAGE" ? "%" : "Ä‘"},${batch.minOrderValue}Ä‘`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Vouchers_${batch.prefix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Táº£i xuá»‘ng danh sÃ¡ch mÃ£ voucher dáº¡ng CSV thÃ nh cÃ´ng!");
  };

  const handleDeleteBatch = (id: string) => {
    if (!confirm("Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a Ä‘á»£t voucher nÃ y?")) return;
    setBatches(batches.filter((b) => b.id !== id));
    toast.success("ÄÃ£ xÃ³a Ä‘á»£t voucher thÃ nh cÃ´ng.");
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
        title="PhÃ¡t hÃ nh Voucher hÃ ng loáº¡t"
        subtitle="Táº¡o Ä‘á»£t phÃ¡t hÃ nh mÃ£ Æ°u Ä‘Ã£i ngáº«u nhiÃªn sá»‘ lÆ°á»£ng lá»›n cho chiáº¿n dá»‹ch marketing hoáº·c sá»± kiá»‡n"
        onRefresh={() => toast.success("ÄÃ£ táº£i láº¡i danh sÃ¡ch Ä‘á»£t voucher!")}
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 mt-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="TÃ¬m kiáº¿m Ä‘á»£t voucher, tiá»n tá»‘..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Tráº¡ng thÃ¡i Ä‘á»£t" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Táº¥t cáº£ tráº¡ng thÃ¡i</SelectItem>
              <SelectItem value="ACTIVE">Äang hoáº¡t Ä‘á»™ng</SelectItem>
              <SelectItem value="EXPIRED">ÄÃ£ háº¿t háº¡n</SelectItem>
              <SelectItem value="DRAFT">Báº£n nhÃ¡p</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-roast hover:bg-roast/90 text-white font-medium shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          PhÃ¡t hÃ nh Ä‘á»£t má»›i
        </Button>
      </div>

      {/* Table List of Batches */}
      <Card className="shadow-md border border-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>TÃªn Ä‘á»£t / Tiá»n tá»‘</TableHead>
                <TableHead className="text-center">Sá»‘ lÆ°á»£ng mÃ£</TableHead>
                <TableHead>Trá»‹ giÃ¡ Æ°u Ä‘Ã£i</TableHead>
                <TableHead>Háº¡n sá»­ dá»¥ng</TableHead>
                <TableHead>Tráº¡ng thÃ¡i</TableHead>
                <TableHead className="text-right">Thao tÃ¡c</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    KhÃ´ng tÃ¬m tháº¥y Ä‘á»£t phÃ¡t hÃ nh voucher nÃ o
                  </TableCell>
                </TableRow>
              ) : (
                filteredBatches.map((batch) => (
                  <TableRow key={batch.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="font-semibold text-slate-800">{batch.batchName}</div>
                      <div className="text-xs text-roast font-mono">Tiá»n tá»‘: {batch.prefix}-XXXX</div>
                    </TableCell>
                    <TableCell className="text-center font-semibold text-slate-600">
                      {batch.quantity} mÃ£
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-800">
                        {batch.discountType === "PERCENTAGE"
                          ? `Giáº£m ${batch.discountValue}%`
                          : `Giáº£m ${batch.discountValue.toLocaleString()}Ä‘`}
                      </div>
                      <div className="text-xs text-slate-400">
                        HÃ³a Ä‘Æ¡n tá»‘i thiá»ƒu: {batch.minOrderValue.toLocaleString()}Ä‘
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
                        {batch.status === "ACTIVE" ? "Äang Ã¡p dá»¥ng" : "ÄÃ£ háº¿t háº¡n"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {batch.codes.length > 0 && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewCodes(batch)}
                            className="text-roast hover:text-roast/90 hover:bg-roast/10"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Xem mÃ£
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadCSV(batch)}
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Xuáº¥t file
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
            <DialogTitle>Táº¡o Ä‘á»£t phÃ¡t hÃ nh Voucher hÃ ng loáº¡t</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1">
              <Label htmlFor="batchName">TÃªn Ä‘á»£t voucher *</Label>
              <Input
                id="batchName"
                placeholder="VÃ­ dá»¥: Voucher Táº·ng Cá»±u Sinh ViÃªn K22"
                value={formData.batchName}
                onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                className="bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="prefix">Tiá»n tá»‘ mÃ£ *</Label>
                <Input
                  id="prefix"
                  placeholder="VÃ­ dá»¥: SVIEN22"
                  value={formData.prefix}
                  onChange={(e) => setFormData({ ...formData, prefix: e.target.value.toUpperCase() })}
                  className="bg-white font-mono"
                />
                <span className="text-[10px] text-slate-400">Há»‡ thá»‘ng tá»± Ä‘á»™ng thÃªm háº­u tá»‘ ngáº«u nhiÃªn phÃ­a sau</span>
              </div>

              <div className="space-y-1">
                <Label htmlFor="quantity">Sá»‘ lÆ°á»£ng mÃ£ cáº§n táº¡o</Label>
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
                <Label htmlFor="discountType">PhÃ¢n loáº¡i giáº£m giÃ¡</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(val: any) => setFormData({ ...formData, discountType: val })}
                >
                  <SelectTrigger id="discountType" className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Theo Pháº§n trÄƒm (%)</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Sá»‘ tiá»n cá»‘ Ä‘á»‹nh (Ä‘)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="discountValue">GiÃ¡ trá»‹ giáº£m giÃ¡ *</Label>
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
                <Label htmlFor="minOrderValue">HÃ³a Ä‘Æ¡n tá»‘i thiá»ƒu (Ä‘)</Label>
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
                <Label htmlFor="maxDiscount">Giáº£m tá»‘i Ä‘a (Ä‘)</Label>
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
                <Label htmlFor="startDate">NgÃ y báº¯t Ä‘áº§u</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="endDate">NgÃ y háº¿t háº¡n</Label>
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
              Há»§y bá»
            </Button>
            <Button
              onClick={handleCreateBatch}
              disabled={submitting}
              className="bg-roast hover:bg-roast/90 text-white font-medium"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Táº¡o vÃ  phÃ¡t hÃ nh mÃ£
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Codes Dialog */}
      <Dialog open={isViewCodesOpen} onOpenChange={setIsViewCodesOpen}>
        <DialogContent className="max-w-[450px] bg-white">
          <DialogHeader>
            <DialogTitle>Danh sÃ¡ch mÃ£ Ä‘Ã£ táº¡o ({selectedBatch?.prefix})</DialogTitle>
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
                  className="h-8 text-roast hover:text-roast/90 hover:bg-roast/10"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Sao chÃ©p
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
              Táº£i file CSV
            </Button>
            <Button onClick={() => setIsViewCodesOpen(false)}>ÄÃ³ng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
