import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Search,
  Plus,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { inventoryService, type InventoryResponse } from "@/services/inventory.service";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";
import { toast } from "sonner";

interface AdjustmentRow {
  inventoryId: string;
  productVariantId: string;
  name: string;
  sku: string;
  currentStock: number;
  newStock: number;
  difference: number;
  reason: string;
  type: "PRODUCT" | "COMPONENT";
}

export default function StockAdjustPage() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allItems, setAllItems] = useState<InventoryResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [adjustmentItems, setAdjustmentItems] = useState<AdjustmentRow[]>([]);
  const [generalReason, setGeneralReason] = useState("Kiểm kê định kỳ");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getAllInventory();
      const rawData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.content || [];
      setAllItems(rawData);
    } catch (err: any) {
      console.error("Error fetching inventory for adjustment:", err);
      toast.error("Không thể tải danh sách tồn kho.");
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (item: InventoryResponse) => {
    if (item.type === "PRODUCT" && item.productVariant) {
      const pv = item.productVariant;
      return pv.variantName
        ? `${pv.productName} (${pv.variantName})`
        : pv.productName;
    } else if (item.type === "COMPONENT" && item.partComponent) {
      return `[NL] ${item.partComponent.name}`;
    }
    return "Mặt hàng không xác định";
  };

  const getDisplaySku = (item: InventoryResponse) => {
    if (item.type === "PRODUCT" && item.productVariant) {
      return item.productVariant.sku || "N/A";
    } else if (item.type === "COMPONENT" && item.partComponent) {
      return item.partComponent.id.substring(0, 8).toUpperCase();
    }
    return "N/A";
  };

  const handleAddItem = () => {
    if (!selectedItemId) {
      toast.error("Vui lòng chọn một mặt hàng");
      return;
    }

    // Check if already in list
    if (adjustmentItems.some((row) => row.inventoryId === selectedItemId)) {
      toast.error("Mặt hàng này đã có trong danh sách điều chỉnh");
      return;
    }

    const item = allItems.find((i) => i.id === selectedItemId);
    if (!item) return;

    const currentStock = item.quantityPhysical || 0;
    const name = getDisplayName(item);
    const sku = getDisplaySku(item);
    const productVariantId =
      item.type === "PRODUCT"
        ? item.productVariant?.id || ""
        : item.partComponent?.id || "";

    setAdjustmentItems((prev) => [
      ...prev,
      {
        inventoryId: item.id,
        productVariantId,
        name,
        sku,
        currentStock,
        newStock: currentStock,
        difference: 0,
        reason: generalReason,
        type: item.type === "PRODUCT" ? "PRODUCT" : "COMPONENT",
      },
    ]);

    setSelectedItemId("");
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

  const handleSubmitAdjustment = async () => {
    if (adjustmentItems.length === 0) {
      toast.error("Vui lòng thêm ít nhất một mặt hàng để điều chỉnh");
      return;
    }

    // Verify all rows have a non-zero difference
    const hasZeroDiff = adjustmentItems.some((item) => item.difference === 0);
    if (hasZeroDiff) {
      toast.error("Vui lòng điều chỉnh số lượng khác với tồn kho hiện tại");
      return;
    }

    setSubmitting(true);
    try {
      // The API format for createStockAdjustment expects:
      // {
      //   reason: string,
      //   items: Array<{ productVariantId: string, type: 'STOCK_IN' | 'STOCK_OUT', quantity: number, reason: string }>
      // }
      const itemsPayload = adjustmentItems.map((item) => {
        const transType = item.difference > 0 ? "STOCK_IN" : "STOCK_OUT";
        return {
          productVariantId: item.productVariantId,
          type: transType,
          quantity: Math.abs(item.difference),
          reason: item.reason,
        };
      });

      const payload = {
        reason: notes || generalReason,
        items: itemsPayload,
      };

      // Step 1: Create the adjustment
      const createResponse = await inventoryService.createStockAdjustment(payload);

      // Step 2: Auto-approve the adjustment to apply changes
      if (createResponse.data?.id) {
        await inventoryService.approveStockAdjustment(createResponse.data.id);
      }

      toast.success("Điều chỉnh kho thành công!");
      setAdjustmentItems([]);
      setNotes("");
      fetchInventoryItems();
    } catch (err: any) {
      console.error("Error creating stock adjustment:", err);
      toast.error(err.response?.data?.message || "Không thể thực hiện điều chỉnh kho.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter out items already added to the list or matching search
  const availableItems = allItems.filter((item) => {
    const isAdded = adjustmentItems.some((row) => row.inventoryId === item.id);
    if (isAdded) return false;

    const name = getDisplayName(item).toLowerCase();
    const sku = getDisplaySku(item).toLowerCase();
    return (
      name.includes(searchTerm.toLowerCase()) ||
      sku.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <PageContainer>
      <PageHeader
        title="Điều chỉnh kho thủ công"
        subtitle="Cập nhật số lượng vật lý của sản phẩm và nguyên liệu trực tiếp"
        onRefresh={fetchInventoryItems}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Left Column: Form Configuration & Item Selector */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="shadow-md border border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Thông tin điều chỉnh</CardTitle>
              <CardDescription>Cấu hình lý do chung và ghi chú cho đợt điều chỉnh này</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="general-reason">Lý do chính</Label>
                <Select value={generalReason} onValueChange={setGeneralReason}>
                  <SelectTrigger id="general-reason" className="bg-white">
                    <SelectValue placeholder="Chọn lý do" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kiểm kê định kỳ">Kiểm kê định kỳ</SelectItem>
                    <SelectItem value="Hao hụt / Thất thoát">Hao hụt / Thất thoát</SelectItem>
                    <SelectItem value="Hàng hỏng / Hết hạn">Hàng hỏng / Hết hạn</SelectItem>
                    <SelectItem value="Nhập bổ sung lẻ">Nhập bổ sung lẻ</SelectItem>
                    <SelectItem value="Sai lệch dữ liệu">Sai lệch dữ liệu hệ thống</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú chi tiết</Label>
                <Textarea
                  id="notes"
                  placeholder="Nhập ghi chú hoặc lý do chi tiết..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] bg-white"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Thêm mặt hàng</CardTitle>
              <CardDescription>Tìm kiếm và thêm sản phẩm/nguyên liệu vào danh sách</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Tìm theo tên hoặc SKU..."
                  className="pl-9 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Chọn mặt hàng ({availableItems.length})</Label>
                {loading ? (
                  <div className="flex items-center space-x-2 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                    <span className="text-sm text-slate-500">Đang tải mặt hàng...</span>
                  </div>
                ) : (
                  <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Chọn mặt hàng để điều chỉnh" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {availableItems.length === 0 ? (
                        <div className="p-2 text-sm text-center text-slate-500">Không tìm thấy mặt hàng phù hợp</div>
                      ) : (
                        availableItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            <div className="flex justify-between w-full">
                              <span className="truncate">{getDisplayName(item)}</span>
                              <span className="text-xs text-slate-400 ml-2">SKU: {getDisplaySku(item)}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Button
                onClick={handleAddItem}
                disabled={!selectedItemId}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm vào danh sách
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Adjustment Items List */}
        <div className="lg:col-span-2">
          <Card className="shadow-md border border-slate-200 h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Danh sách điều chỉnh ({adjustmentItems.length})</CardTitle>
                <CardDescription>Điều chỉnh trực tiếp số lượng tồn kho vật lý</CardDescription>
              </div>
              {adjustmentItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAdjustmentItems([])}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  Xóa tất cả
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              {adjustmentItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center flex-1">
                  <ArrowUpDown className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">Chưa có mặt hàng nào được thêm</p>
                  <p className="text-slate-400 text-sm mt-1 max-w-xs">
                    Hãy tìm kiếm và thêm sản phẩm hoặc nguyên liệu ở cột bên trái để bắt đầu điều chỉnh tồn kho.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-lg border border-slate-200 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead>Mặt hàng</TableHead>
                          <TableHead className="w-[100px] text-center">Hiện tại</TableHead>
                          <TableHead className="w-[120px] text-center">Thực tế mới</TableHead>
                          <TableHead className="w-[100px] text-center">Chênh lệch</TableHead>
                          <TableHead className="w-[150px]">Lý do</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adjustmentItems.map((row, index) => (
                          <TableRow key={row.inventoryId} className="hover:bg-slate-50/50">
                            <TableCell>
                              <div className="font-medium text-slate-800 text-sm">{row.name}</div>
                              <div className="text-xs text-slate-400">SKU: {row.sku}</div>
                            </TableCell>
                            <TableCell className="text-center font-medium text-slate-600">
                              {row.currentStock}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                className="h-9 w-24 mx-auto text-center bg-white"
                                value={row.newStock}
                                onChange={(e) =>
                                  handleQuantityChange(index, Math.max(0, parseInt(e.target.value) || 0))
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              {row.difference === 0 ? (
                                <span className="text-slate-400 font-medium">0</span>
                              ) : row.difference > 0 ? (
                                <span className="text-emerald-600 font-semibold">+{row.difference}</span>
                              ) : (
                                <span className="text-red-600 font-semibold">{row.difference}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={row.reason}
                                onValueChange={(val) => handleReasonChange(index, val)}
                              >
                                <SelectTrigger className="h-9 bg-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Kiểm kê định kỳ">Kiểm kê định kỳ</SelectItem>
                                  <SelectItem value="Hao hụt / Thất thoát">Hao hụt</SelectItem>
                                  <SelectItem value="Hàng hỏng / Hết hạn">Hỏng / Hết hạn</SelectItem>
                                  <SelectItem value="Nhập bổ sung lẻ">Nhập bổ sung</SelectItem>
                                  <SelectItem value="Sai lệch dữ liệu">Sai lệch dữ liệu</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                                onClick={() => handleRemoveRow(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <span className="font-semibold">Lưu ý:</span> Việc xác nhận điều chỉnh kho sẽ ghi nhận và thay đổi trực tiếp tồn kho thực tế của chi nhánh. Hành động này sẽ được ghi nhật ký hoạt động hệ thống.
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setAdjustmentItems([])}
                      disabled={submitting}
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      onClick={handleSubmitAdjustment}
                      disabled={submitting}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium min-w-[120px]"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Hoàn tất điều chỉnh
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
