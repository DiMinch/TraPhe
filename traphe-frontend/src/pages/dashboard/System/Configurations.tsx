import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, Plus, Edit, Trash2, Settings, Loader2, Save, Key, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import {
  systemConfigService,
  type SystemConfigResponse,
  type SystemConfigRequest,
} from "@/services/system-config.service";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Well-known config keys with friendly labels
const CONFIG_KEY_LABELS: Record<string, string> = {
  SHIPPING_BASE_FEE: "Phí ship cơ bản (đ)",
  SHIPPING_PER_KM: "Phí ship mỗi km (đ/km)",
  BRAND_NAME: "Tên thương hiệu",
  BRAND_LOGO_URL: "URL logo thương hiệu",
  DEFAULT_INVENTORY_THRESHOLD: "Ngưỡng cảnh báo tồn kho mặc định",
};

const INITIAL_FORM: SystemConfigRequest = {
  configKey: "",
  configValue: "",
  description: "",
};

export default function ConfigurationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<{
    id: string;
    key: string;
  } | null>(null);
  const [configurations, setConfigurations] = useState<SystemConfigResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create/Edit dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SystemConfigRequest>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await systemConfigService.getAllConfigs();
      if (response.statusCode === 200) {
        // Handle both direct array and paginated response
        const configsData = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.content || [];
        setConfigurations(configsData);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMsg =
        error.response?.data?.message || "Failed to fetch configurations";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const filteredConfigurations = configurations.filter(
    (config) =>
      config.configKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.configValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (config.description &&
        config.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // ==================== Create/Edit Handlers ====================

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (config: SystemConfigResponse) => {
    setEditingId(config.id);
    setFormData({
      configKey: config.configKey,
      configValue: config.configValue,
      description: config.description || "",
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.configKey.trim() || !formData.configValue.trim()) {
      toast.warning("Vui lòng nhập đầy đủ Key và Value.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Update
        const response = await systemConfigService.updateConfig(editingId, formData);
        const updated = (response as any).data ?? response;
        setConfigurations((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...updated } : c)),
        );
        toast.success("Cập nhật cấu hình thành công");
      } else {
        // Create
        const response = await systemConfigService.createConfig(formData);
        const created = (response as any).data ?? response;
        setConfigurations((prev) => [created, ...prev]);
        toast.success("Tạo cấu hình mới thành công");
      }
      setIsFormOpen(false);
      setFormData(INITIAL_FORM);
      setEditingId(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error.response?.data?.message || "Thao tác thất bại. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== Delete Handlers ====================

  const handleDeleteClick = (config: { id: string; key: string }) => {
    setConfigToDelete(config);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (configToDelete) {
      try {
        await systemConfigService.deleteConfig(configToDelete.id);
        setConfigurations(
          configurations.filter((c) => c.id !== configToDelete.id),
        );
        toast.success("Xoá cấu hình thành công");
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(
          error.response?.data?.message || "Xoá cấu hình thất bại",
        );
      } finally {
        setIsDeleteDialogOpen(false);
        setConfigToDelete(null);
      }
    }
  };

  // ==================== Helpers ====================

  const getFriendlyLabel = (key: string) => CONFIG_KEY_LABELS[key] || null;

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd/MM/yyyy HH:mm");
    } catch {
      return dateStr;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Cấu hình hệ thống"
        subtitle="Quản lý các thiết lập cấu hình hệ thống (phí ship, ngưỡng tồn kho, thương hiệu...)"
      />

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        <Button
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-roast to-roast/90 hover:from-roast/90 hover:to-roast/80 text-white shadow-lg"
        >
          <Plus className="mr-2 w-4 h-4" />
          Thêm cấu hình
        </Button>
      </div>

      {/* Main Card */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo Key, Value hoặc Mô tả..."
                className="pl-10 bg-white border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-roast" />
              <span className="ml-3 text-slate-600">
                Đang tải cấu hình...
              </span>
            </div>
          ) : error ? (
            <EmptyState
              icon={<Settings className="w-8 h-8 text-red-400" />}
              title="Lỗi tải dữ liệu"
              description={error}
            />
          ) : filteredConfigurations.length === 0 ? (
            <EmptyState
              icon={<Settings className="w-8 h-8 text-slate-400" />}
              title="Chưa có cấu hình nào"
              description="Nhấn 'Thêm cấu hình' để bắt đầu thiết lập hệ thống"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                  <TableHead className="font-semibold text-slate-600">
                    Key
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Value
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Mô tả
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Cập nhật lần cuối
                  </TableHead>
                  <TableHead className="text-center font-semibold text-slate-600">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConfigurations.map((config) => (
                  <TableRow key={config.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="space-y-1">
                        <span className="font-mono text-sm font-medium text-slate-800">
                          {config.configKey}
                        </span>
                        {getFriendlyLabel(config.configKey) && (
                          <Badge variant="secondary" className="text-xs block w-fit">
                            {getFriendlyLabel(config.configKey)}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700 font-medium max-w-[200px] truncate">
                      {config.configValue}
                    </TableCell>
                    <TableCell className="text-slate-500 max-w-[250px] truncate">
                      {config.description || "—"}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {config.updatedAt ? formatDate(config.updatedAt) : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-blue-50"
                          onClick={() => handleOpenEdit(config)}
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-50"
                          onClick={() =>
                            handleDeleteClick({
                              id: config.id,
                              key: config.configKey,
                            })
                          }
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingId ? (
                <>
                  <Edit className="w-5 h-5" />
                  Chỉnh sửa cấu hình
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Thêm cấu hình mới
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="configKey" className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                Config Key
              </Label>
              <Input
                id="configKey"
                placeholder="VD: SHIPPING_PER_KM, BRAND_NAME..."
                value={formData.configKey}
                onChange={(e) =>
                  setFormData({ ...formData, configKey: e.target.value.toUpperCase().replace(/\s+/g, "_") })
                }
                disabled={!!editingId}
                className={editingId ? "bg-slate-100 text-slate-500" : ""}
              />
              {editingId && (
                <p className="text-xs text-slate-400">
                  Key không thể thay đổi sau khi tạo
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="configValue" className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Value
              </Label>
              <Input
                id="configValue"
                placeholder="Nhập giá trị..."
                value={formData.configValue}
                onChange={(e) =>
                  setFormData({ ...formData, configValue: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả (tuỳ chọn)</Label>
              <Textarea
                id="description"
                placeholder="Mô tả ngắn gọn về cấu hình này..."
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              disabled={submitting}
            >
              Huỷ
            </Button>
            <Button
              onClick={handleSave}
              disabled={submitting}
              className="bg-roast hover:bg-roast/90 text-white"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editingId ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={configToDelete?.key || ""}
        onConfirm={handleDeleteConfirm}
        contextMessage="cấu hình"
      />
    </PageContainer>
  );
}
