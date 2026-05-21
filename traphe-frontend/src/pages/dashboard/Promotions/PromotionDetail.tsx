import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Edit,
  Trash2,
  ChevronRight,
  Save,
  Loader2,
  BarChart3,
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
import {
  promotionService,
  type PromotionResponse,
  type PromotionRequest,
  type PromotionStatus,
  type PromotionType,
  type PromotionUsageReportResponse,
} from "@/services/promotion.service";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";
import type { Category } from "@/types/category.types";
import type { Product } from "@/types/product.types";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";

const enrichPromotion = (data: PromotionResponse): PromotionResponse => {
  const type: PromotionType = data.discountType || "PERCENTAGE";
  const value = data.discountValue || 0;
  const perUserLimit = data.perUserLimit || 1;

  let status: PromotionStatus = "INACTIVE";
  if (data.isActive) {
    const now = new Date();
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (now > end) {
      status = "EXPIRED";
    } else if (now < start) {
      status = "SCHEDULED";
    } else {
      status = "ACTIVE";
    }
  }

  return {
    ...data,
    type,
    value,
    status,
    scope: data.scope || "ORDER",
    priority: data.priority || 0,
    usagePerCustomer: perUserLimit,
    applicableCategoryIds: data.applicableCategoryIds || [],
    applicableProductIds: data.applicableProductIds || [],
    applicableCustomerTiers: data.applicableCustomerTiers || [],
    conflictingPromotionIds: data.conflictingPromotionIds || [],
    hasQuota: data.usageLimit ? true : false,
    remainingQuota: data.usageLimit ? (data.usageLimit - data.usageCount) : undefined
  };
};

export default function PromotionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [promotion, setPromotion] = useState<PromotionResponse | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Usage report state
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [usageReport, setUsageReport] =
    useState<PromotionUsageReportResponse | null>(null);

  // Form data
  const [formData, setFormData] = useState<PromotionRequest>({
    code: "",
    name: "",
    type: "PERCENTAGE",
    scope: "ORDER",
    value: 0,
    minOrderValue: 0,
    maxDiscountAmount: 0,
    applicableCustomerTiers: [],
    startDate: "",
    endDate: "",
    usageLimit: undefined,
    usagePerCustomer: undefined,
    priority: 0,
    description: "",
    applicableCategoryIds: [],
    applicableProductIds: [],
    conflictingPromotionIds: [],
  });

  // Categories and products for selection
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (id) {
      fetchPromotion();
      fetchCategoriesAndProducts();
    }
  }, [id]);

  const fetchPromotion = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await promotionService.getPromotionById(id);
      const data = response.data;
      if (data) {
        const enrichedPromotion = enrichPromotion(data);
        setPromotion(enrichedPromotion);
        setFormData({
          code: enrichedPromotion.code,
          name: enrichedPromotion.name,
          type: enrichedPromotion.type,
          scope: enrichedPromotion.scope,
          value: enrichedPromotion.value,
          minOrderValue: enrichedPromotion.minOrderValue || undefined,
          maxDiscountAmount: enrichedPromotion.maxDiscountAmount || undefined,
          applicableCustomerTiers: enrichedPromotion.applicableCustomerTiers || [],
          startDate: enrichedPromotion.startDate?.substring(0, 16) || "",
          endDate: enrichedPromotion.endDate?.substring(0, 16) || "",
          usageLimit: enrichedPromotion.usageLimit || undefined,
          usagePerCustomer: enrichedPromotion.usagePerCustomer || undefined,
          priority: enrichedPromotion.priority,
          description: enrichedPromotion.description || "",
          applicableCategoryIds: enrichedPromotion.applicableCategoryIds || [],
          applicableProductIds: enrichedPromotion.applicableProductIds || [],
          conflictingPromotionIds: enrichedPromotion.conflictingPromotionIds || [],
        });
      }
    } catch (err: any) {
      console.error("Error fetching promotion:", err);
      toast.error(err.response?.data?.message || "Failed to load promotion");
      navigate("/admin/promotions");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndProducts = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        categoryService.getAllCategories(),
        productService.getAllProducts(),
      ]);
      const categoryData = Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : (categoriesRes.data as any)?.content || [];
      const productData = Array.isArray(productsRes.data)
        ? productsRes.data
        : (productsRes.data as any)?.content || [];
      setCategories(categoryData);
      setProducts(productData);
    } catch (err) {
      console.error("Error fetching categories/products:", err);
    }
  };

  const handleSave = async () => {
    if (!id || !promotion) return;

    if (
      !formData.code ||
      !formData.name ||
      !formData.startDate ||
      !formData.endDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const requestData: PromotionRequest = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        discountType: formData.type === "PERCENTAGE" ? "PERCENTAGE" : "FIXED_AMOUNT",
        discountValue: formData.value || 0,
        minOrderValue: formData.minOrderValue,
        maxDiscountAmount: formData.maxDiscountAmount,
        usageLimit: formData.usageLimit,
        perUserLimit: formData.usagePerCustomer || 1,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };

      const response = await promotionService.updatePromotion(id, requestData);
      const updated = response.data;
      if (updated) {
        setPromotion(enrichPromotion(updated));
      }
      toast.success("Promotion updated successfully");
      setIsEditing(false);
    } catch (err: any) {
      console.error("Error updating promotion:", err);
      toast.error(err.response?.data?.message || "Failed to update promotion");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await promotionService.deletePromotion(id);
      toast.success("Promotion deleted successfully");
      navigate("/admin/promotions");
    } catch (err: any) {
      console.error("Error deleting promotion:", err);
      toast.error(err.response?.data?.message || "Failed to delete promotion");
    }
  };

  const handleToggleStatus = async () => {
    if (!id || !promotion) return;
    try {
      const response = await promotionService.togglePromotionStatus(id);
      const updated = response.data;
      if (updated) {
        setPromotion(enrichPromotion(updated));
        toast.success(
          `Promotion ${updated.isActive ? "activated" : "deactivated"} successfully`,
        );
      }
    } catch (err: any) {
      console.error("Error toggling status:", err);
      toast.error(err.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleViewReport = async () => {
    if (!id) return;
    setIsReportDialogOpen(true);
    setLoadingReport(true);
    try {
      const response = await promotionService.getPromotionUsageReport(id);
      const data = response.data?.data || response.data;
      setUsageReport(data);
    } catch (err: any) {
      console.error("Error fetching report:", err);
      toast.error(err.response?.data?.message || "Failed to load usage report");
    } finally {
      setLoadingReport(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "EXPIRED":
        return "bg-red-100 text-red-800";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  if (!promotion) {
    return (
      <PageContainer>
        <div className="text-center py-20">
          <p className="text-gray-500">Promotion not found</p>
          <Button
            onClick={() => navigate("/admin/promotions")}
            className="mt-4"
          >
            Back to Promotions
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Promotion Detail"
        subtitle={`${promotion.code} - ${promotion.name}`}
        onRefresh={fetchPromotion}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <button
          onClick={() => navigate("/admin/promotions")}
          className="hover:text-indigo-900 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Promotion List
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium">{promotion.code}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        <Button variant="outline" onClick={handleViewReport}>
          <BarChart3 className="mr-2 w-4 h-4" />
          Usage Report
        </Button>
        <Button variant="outline" onClick={handleToggleStatus}>
          {promotion.isActive ? (
            <>
              <ToggleRight className="mr-2 w-4 h-4" />
              Deactivate
            </>
          ) : (
            <>
              <ToggleLeft className="mr-2 w-4 h-4" />
              Activate
            </>
          )}
        </Button>
        {isEditing ? (
          <>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 w-4 h-4" />
                  Save
                </>
              )}
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 w-4 h-4" />
            Edit
          </Button>
        )}
        <Button
          variant="destructive"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 className="mr-2 w-4 h-4" />
          Delete
        </Button>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <Badge
          className={`${getStatusColor(promotion.status || "INACTIVE")} text-sm px-3 py-1`}
        >
          {promotion.status || "INACTIVE"}
        </Badge>
        {promotion.hasQuota && (
          <span className="ml-3 text-sm text-gray-600">
            Remaining: {promotion.remainingQuota} / {promotion.usageLimit}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Code</Label>
                {isEditing ? (
                  <Input
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                  />
                ) : (
                  <p className="font-medium">{promotion.code}</p>
                )}
              </div>
              <div>
                <Label>Name</Label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                ) : (
                  <p className="font-medium">{promotion.name}</p>
                )}
              </div>
            </div>
            <div>
              <Label>Description</Label>
              {isEditing ? (
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              ) : (
                <p className="text-gray-600">
                  {promotion.description || "No description"}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                ) : (
                  <p className="font-medium">{promotion.priority}</p>
                )}
              </div>
              <div>
                <Label>Usage Count</Label>
                <p className="font-medium">{promotion.usageCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Type & Value */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Discount Type & Value</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                {isEditing ? (
                  <Select
                    value={formData.type}
                    onValueChange={(v: any) =>
                      setFormData({ ...formData, type: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                      <SelectItem value="BUY_X_GET_Y">Buy X Get Y</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-medium">{promotion.type}</p>
                )}
              </div>
              <div>
                <Label>Scope</Label>
                {isEditing ? (
                  <Select
                    value={formData.scope}
                    onValueChange={(v: any) =>
                      setFormData({ ...formData, scope: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ORDER">Order</SelectItem>
                      <SelectItem value="PRODUCT">Product</SelectItem>
                      <SelectItem value="CATEGORY">Category</SelectItem>
                      <SelectItem value="SHIPPING">Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-medium">{promotion.scope}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Value</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        value: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                ) : (
                  <p className="font-medium">
                    {(promotion.type || "PERCENTAGE") === "PERCENTAGE"
                      ? `${promotion.value || 0}%`
                      : formatCurrency(promotion.value || 0)}
                  </p>
                )}
              </div>
              <div>
                <Label>Max Discount</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.maxDiscountAmount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxDiscountAmount:
                          parseFloat(e.target.value) || undefined,
                      })
                    }
                  />
                ) : (
                  <p className="font-medium">
                    {promotion.maxDiscountAmount
                      ? formatCurrency(promotion.maxDiscountAmount)
                      : "No limit"}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label>Min Order Value</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.minOrderValue || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minOrderValue: parseFloat(e.target.value) || undefined,
                    })
                  }
                />
              ) : (
                <p className="font-medium">
                  {promotion.minOrderValue
                    ? formatCurrency(promotion.minOrderValue)
                    : "No minimum"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Date & Usage Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Schedule & Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                {isEditing ? (
                  <Input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                ) : (
                  <p className="font-medium">
                    {formatDate(promotion.startDate)}
                  </p>
                )}
              </div>
              <div>
                <Label>End Date</Label>
                {isEditing ? (
                  <Input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                ) : (
                  <p className="font-medium">{formatDate(promotion.endDate)}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Usage Limit (Total)</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.usageLimit || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usageLimit: parseInt(e.target.value) || undefined,
                      })
                    }
                    placeholder="Unlimited"
                  />
                ) : (
                  <p className="font-medium">
                    {promotion.usageLimit || "Unlimited"}
                  </p>
                )}
              </div>
              <div>
                <Label>Usage Per Customer</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.usagePerCustomer || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usagePerCustomer: parseInt(e.target.value) || undefined,
                      })
                    }
                    placeholder="Unlimited"
                  />
                ) : (
                  <p className="font-medium">
                    {promotion.usagePerCustomer || "Unlimited"}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applicable Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Applicable Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Customer Tiers</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {promotion.applicableCustomerTiers?.length ? (
                  promotion.applicableCustomerTiers.map((tier, i) => (
                    <Badge key={i} variant="secondary">
                      {tier}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500">All tiers</span>
                )}
              </div>
            </div>
            <div>
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {promotion.applicableCategoryIds?.length ? (
                  promotion.applicableCategoryIds.map((catId, i) => {
                    const cat = categories.find((c) => c.id === catId);
                    return (
                      <Badge key={i} variant="outline">
                        {cat?.name || catId}
                      </Badge>
                    );
                  })
                ) : (
                  <span className="text-gray-500">All categories</span>
                )}
              </div>
            </div>
            <div>
              <Label>Products</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {promotion.applicableProductIds?.length ? (
                  promotion.applicableProductIds.map((prodId, i) => {
                    const prod = products.find((p) => p.id === prodId);
                    return (
                      <Badge key={i} variant="outline">
                        {prod?.name || prodId}
                      </Badge>
                    );
                  })
                ) : (
                  <span className="text-gray-500">All products</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timestamps */}
      <Card className="mt-6">
        <CardContent className="py-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Created: {formatDate(promotion.createdAt)}</span>
            <span>Updated: {formatDate(promotion.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={promotion.name}
        onConfirm={handleDelete}
        contextMessage="promotion"
      />

      {/* Usage Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Promotion Usage Report</DialogTitle>
            <DialogDescription>
              Usage statistics for {promotion.code}
            </DialogDescription>
          </DialogHeader>
          {loadingReport ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : usageReport ? (
            <div className="py-4 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-3xl font-bold text-primary">
                      {usageReport.totalUsage}
                    </p>
                    <p className="text-sm text-gray-500">Total Uses</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(usageReport.totalDiscountGiven)}
                    </p>
                    <p className="text-sm text-gray-500">Total Discount</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {formatCurrency(usageReport.averageDiscountPerUse)}
                    </p>
                    <p className="text-sm text-gray-500">Avg. Discount</p>
                  </CardContent>
                </Card>
              </div>
              {usageReport.usageByDate &&
                Object.keys(usageReport.usageByDate).length > 0 && (
                  <div>
                    <Label className="mb-2 block">Usage by Date</Label>
                    <div className="max-h-[200px] overflow-y-auto border rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="text-left p-2">Date</th>
                            <th className="text-right p-2">Uses</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(usageReport.usageByDate)
                            .sort(([a], [b]) => b.localeCompare(a))
                            .map(([date, count]) => (
                              <tr key={date} className="border-t">
                                <td className="p-2">{date}</td>
                                <td className="p-2 text-right font-medium">
                                  {count}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-500">
              No usage data available
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReportDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
