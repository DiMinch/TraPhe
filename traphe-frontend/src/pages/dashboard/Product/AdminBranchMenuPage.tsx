import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  Store,
  Search,
  Save,
  AlertCircle,
  Loader2,
} from "lucide-react";
import axiosClient from "@/lib/axios-client";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product.types";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";
import { toast } from "sonner";

interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  openingHours?: string;
  isActive: boolean;
}

interface BranchProductConfig {
  productId: string;
  isAvailable: boolean;
  branchPrice: number; // Override price
}

export default function AdminBranchMenuPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Key is: `${branchId}_${productId}`
  const [branchConfigs, setBranchConfigs] = useState<Record<string, BranchProductConfig>>({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Branches
      const branchRes = await axiosClient.get<any, any>("/admin/branches");
      const branchData = Array.isArray(branchRes.data)
        ? branchRes.data
        : branchRes.data?.content || [];
      setBranches(branchData);

      if (branchData.length > 0) {
        setSelectedBranchId(branchData[0].id);
      }

      // 2. Fetch Products
      const productRes = await productService.getAllProducts({ size: 100 });
      const productData = productRes.data?.content || [];
      setProducts(productData);

      // Initialize configs with base prices & active status
      const initialConfigs: Record<string, BranchProductConfig> = {};
      branchData.forEach((b: Branch) => {
        productData.forEach((p: Product) => {
          const key = `${b.id}_${p.id}`;
          initialConfigs[key] = {
            productId: p.id,
            isAvailable: p.status !== "HIDDEN",
            branchPrice: p.basePrice || 0,
          };
        });
      });
      setBranchConfigs(initialConfigs);
    } catch (err: any) {
      console.error("Error fetching branch menu data:", err);
      toast.error("Không thể tải thông tin chi nhánh hoặc thực đơn.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailable = (productId: string, val: boolean) => {
    if (!selectedBranchId) return;
    const key = `${selectedBranchId}_${productId}`;
    setBranchConfigs((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        isAvailable: val,
      },
    }));
  };

  const handlePriceChange = (productId: string, price: number) => {
    if (!selectedBranchId) return;
    const key = `${selectedBranchId}_${productId}`;
    setBranchConfigs((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        branchPrice: Math.max(0, price),
      },
    }));
  };

  const handleResetToBasePrice = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !selectedBranchId) return;
    const key = `${selectedBranchId}_${productId}`;
    setBranchConfigs((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        branchPrice: product.basePrice || 0,
      },
    }));
    toast.info(`Đã đặt lại giá món ${product.name} về giá gốc.`);
  };

  const handleSaveConfigs = async () => {
    if (!selectedBranchId) {
      toast.error("Vui lòng chọn chi nhánh");
      return;
    }

    setSaving(true);
    // Simulate API request to save branch menu override configs
    setTimeout(() => {
      setSaving(false);
      toast.success("Đã cập nhật thực đơn & giá bán riêng cho chi nhánh thành công!");
    }, 1000);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.categoryName && p.categoryName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <PageContainer>
      <PageHeader
        title="Thực đơn theo Chi nhánh"
        subtitle="Cho phép cấu hình món bán, tắt/bật món và điều chỉnh giá bán riêng biệt cho từng chi nhánh"
        onRefresh={fetchInitialData}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
          <span className="text-slate-600 font-medium">Đang tải cấu hình thực đơn chi nhánh...</span>
        </div>
      ) : (
        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column: Select Branch */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="shadow-md border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Chọn chi nhánh</CardTitle>
                  <CardDescription>Chọn chi nhánh cần tùy chỉnh thực đơn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch-select">Chi nhánh</Label>
                    <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                      <SelectTrigger id="branch-select" className="bg-white">
                        <SelectValue placeholder="Chọn chi nhánh" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedBranchId && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Store className="w-4 h-4 text-indigo-600" />
                        <span>
                          {branches.find((b) => b.id === selectedBranchId)?.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Địa chỉ: {branches.find((b) => b.id === selectedBranchId)?.address}
                      </p>
                      <p className="text-xs text-slate-500">
                        Giờ mở cửa: {branches.find((b) => b.id === selectedBranchId)?.openingHours || "Chưa cập nhật"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-md border border-slate-200 p-4">
                <div className="flex gap-2 text-indigo-800">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-xs">
                    Món ăn/đồ uống bị tắt tại chi nhánh sẽ không thể đặt hàng thông qua POS chi nhánh đó hoặc trên ứng dụng khách hàng tại chi nhánh này.
                  </p>
                </div>
              </Card>
            </div>

            {/* Right Column: Menu List & Config */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="shadow-md border border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-lg">Danh sách món tại chi nhánh</CardTitle>
                    <CardDescription>Bật/tắt món và thiết lập giá bán chi tiết</CardDescription>
                  </div>
                  <Button
                    onClick={handleSaveConfigs}
                    disabled={saving || !selectedBranchId}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Lưu thay đổi thực đơn
                  </Button>
                </CardHeader>

                <CardContent className="p-0">
                  {/* Search Bar */}
                  <div className="p-4 border-b border-slate-100 flex items-center max-w-md">
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Tìm món, danh mục..."
                        className="pl-9 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="p-4">
                    {filteredProducts.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">Không tìm thấy món ăn nào.</div>
                    ) : (
                      <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-slate-50">
                            <TableRow>
                              <TableHead>Món ăn / Phân loại</TableHead>
                              <TableHead className="w-[140px] text-center">Trạng thái tại chi nhánh</TableHead>
                              <TableHead className="w-[180px]">Giá bán gốc</TableHead>
                              <TableHead className="w-[200px]">Giá bán riêng chi nhánh</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredProducts.map((p) => {
                              const key = `${selectedBranchId}_${p.id}`;
                              const config = branchConfigs[key] || {
                                productId: p.id,
                                isAvailable: true,
                                branchPrice: p.basePrice || 0,
                              };

                              const isPriceOverridden = config.branchPrice !== p.basePrice;

                              return (
                                <TableRow key={p.id} className="hover:bg-slate-50/50">
                                  <TableCell>
                                    <div className="font-medium text-slate-800">{p.name}</div>
                                    <div className="text-xs text-slate-400">
                                      Danh mục: {p.categoryName || "N/A"}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center justify-center gap-2">
                                      <Switch
                                        checked={config.isAvailable}
                                        onCheckedChange={(val) => handleToggleAvailable(p.id, val)}
                                      />
                                      <Badge
                                        variant="secondary"
                                        className={
                                          config.isAvailable
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-red-50 text-red-700"
                                        }
                                      >
                                        {config.isAvailable ? "Đang bán" : "Tạm ngưng"}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium text-slate-600">
                                    {p.basePrice?.toLocaleString("vi-VN")}đ
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="number"
                                        className="h-9 w-32 bg-white"
                                        value={config.branchPrice}
                                        onChange={(e) =>
                                          handlePriceChange(p.id, parseInt(e.target.value) || 0)
                                        }
                                        disabled={!config.isAvailable}
                                      />
                                      {isPriceOverridden && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleResetToBasePrice(p.id)}
                                          className="text-xs text-indigo-600 hover:text-indigo-700 h-8 p-1"
                                          title="Đặt về giá gốc"
                                        >
                                          Reset
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
