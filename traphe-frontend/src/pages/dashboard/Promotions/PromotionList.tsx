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
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Download,
  Edit,
  Trash2,
  Filter,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Tag,
  MoreHorizontal,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import {
  promotionService,
  type PromotionResponse,
  type PromotionStatus,
  type PromotionType,
  type PromotionRequest,
} from "@/services/promotion.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";
import type { Category } from "@/types/category.types";
import type { Product } from "@/types/product.types";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";

export default function PromotionListPage() {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [typeFilter, setTypeFilter] = useState("all-type");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // New promotion dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingPromotion, setEditingPromotion] =
    useState<PromotionResponse | null>(null);
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
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Fetch categories and products when dialog opens
  useEffect(() => {
    if (
      isCreateDialogOpen &&
      (categories.length === 0 || products.length === 0)
    ) {
      fetchCategoriesAndProducts();
    }
  }, [isCreateDialogOpen]);

  const fetchCategoriesAndProducts = async () => {
    setLoadingOptions(true);
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        categoryService.getAllCategories(),
        productService.getAllProducts(),
      ]);
      console.log("Categories response:", categoriesRes);
      console.log("Products response:", productsRes);

      // Handle different response structures
      const categoryData = categoriesRes.data?.data || categoriesRes.data || [];
      const productData = productsRes.data?.data || productsRes.data || [];

      console.log("Category data:", categoryData);
      console.log("Product data:", productData);

      setCategories(Array.isArray(categoryData) ? categoryData : []);
      setProducts(Array.isArray(productData) ? productData : []);
    } catch (err: any) {
      console.error("Error fetching categories/products:", err);
    } finally {
      setLoadingOptions(false);
    }
  };

  // Fetch promotions from API
  const fetchPromotions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await promotionService.getAllPromotions();
      console.log("Fetch promotions response:", response);

      // Handle different response structures
      const promotionData = response.data?.data || response.data || [];
      console.log("Promotion data:", promotionData);

      setPromotions(Array.isArray(promotionData) ? promotionData : []);
    } catch (err: any) {
      console.error("Error fetching promotions:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to view promotions.");
      } else {
        setError(err.response?.data?.message || "Failed to fetch promotions");
      }
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // Filter promotions
  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch =
      promo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all-status" ||
      promo.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType =
      typeFilter === "all-type" ||
      promo.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPromotions = filteredPromotions.slice(startIndex, endIndex);

  const getStatusColor = (status: PromotionStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      case "EXPIRED":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getTypeLabel = (type: PromotionType) => {
    switch (type) {
      case "PERCENTAGE":
        return "Percentage";
      case "FIXED_AMOUNT":
        return "Fixed Amount";
      case "BUY_X_GET_Y":
        return "Buy X Get Y";
      default:
        return type;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteClick = (promotion: { id: string; name: string }) => {
    setPromotionToDelete(promotion);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (promotionToDelete) {
      try {
        await promotionService.deletePromotion(promotionToDelete.id);
        setPromotions(promotions.filter((p) => p.id !== promotionToDelete.id));
        setIsDeleteDialogOpen(false);
        setPromotionToDelete(null);
      } catch (err: any) {
        console.error("Error deleting promotion:", err);
        alert(err.response?.data?.message || "Failed to delete promotion");
      }
    }
  };

  const handleToggleStatus = async (promotion: PromotionResponse) => {
    try {
      const response = await promotionService.togglePromotionStatus(
        promotion.id,
      );
      console.log("Toggle status response:", response);

      // Handle response structure
      const updatedPromotion = response.data?.data || response.data;

      if (updatedPromotion) {
        setPromotions(
          promotions.map((p) => (p.id === promotion.id ? updatedPromotion : p)),
        );
      } else {
        // Fallback: just refresh the list
        await fetchPromotions();
      }
    } catch (err: any) {
      console.error("Error toggling promotion status:", err);
      alert(err.response?.data?.message || "Failed to toggle promotion status");
    }
  };

  const handleCreatePromotion = async () => {
    if (
      !formData.code ||
      !formData.name ||
      !formData.startDate ||
      !formData.endDate
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate PRODUCT scope requires categories or products
    if (formData.scope === "PRODUCT") {
      if (
        (!formData.applicableCategoryIds ||
          formData.applicableCategoryIds.length === 0) &&
        (!formData.applicableProductIds ||
          formData.applicableProductIds.length === 0)
      ) {
        alert("PRODUCT promotion must have at least one category or product");
        return;
      }
    }

    // Validate CATEGORY scope requires categories
    if (formData.scope === "CATEGORY") {
      if (
        !formData.applicableCategoryIds ||
        formData.applicableCategoryIds.length === 0
      ) {
        alert("CATEGORY promotion must have at least one category");
        return;
      }
    }

    setCreating(true);
    try {
      const response = await promotionService.createPromotion(formData);
      console.log("Create promotion response:", response);

      // Handle response structure - might be response.data or response.data.data
      const newPromotion = response.data?.data || response.data;

      if (newPromotion) {
        setPromotions([newPromotion, ...promotions]);
      }

      setIsCreateDialogOpen(false);
      resetForm();

      // Refresh the list to ensure we have the latest data
      await fetchPromotions();
    } catch (err: any) {
      console.error("Error creating promotion:", err);
      alert(err.response?.data?.message || "Failed to create promotion");
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
    setEditingPromotion(null);
  };

  const handleEditClick = (promotion: PromotionResponse) => {
    setEditingPromotion(promotion);
    setFormData({
      code: promotion.code,
      name: promotion.name,
      type: promotion.type,
      scope: promotion.scope,
      value: promotion.value,
      minOrderValue: promotion.minOrderValue || undefined,
      maxDiscountAmount: promotion.maxDiscountAmount || undefined,
      applicableCustomerTiers: promotion.applicableCustomerTiers || [],
      startDate: promotion.startDate.substring(0, 16),
      endDate: promotion.endDate.substring(0, 16),
      usageLimit: promotion.usageLimit || undefined,
      usagePerCustomer: promotion.usagePerCustomer || undefined,
      priority: promotion.priority,
      description: promotion.description || "",
      applicableCategoryIds: promotion.applicableCategoryIds || [],
      applicableProductIds: promotion.applicableProductIds || [],
      conflictingPromotionIds: promotion.conflictingPromotionIds || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePromotion = async () => {
    if (!editingPromotion) return;

    if (
      !formData.code ||
      !formData.name ||
      !formData.startDate ||
      !formData.endDate
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate PRODUCT scope requires categories or products
    if (formData.scope === "PRODUCT") {
      if (
        (!formData.applicableCategoryIds ||
          formData.applicableCategoryIds.length === 0) &&
        (!formData.applicableProductIds ||
          formData.applicableProductIds.length === 0)
      ) {
        alert("PRODUCT promotion must have at least one category or product");
        return;
      }
    }

    // Validate CATEGORY scope requires categories
    if (formData.scope === "CATEGORY") {
      if (
        !formData.applicableCategoryIds ||
        formData.applicableCategoryIds.length === 0
      ) {
        alert("CATEGORY promotion must have at least one category");
        return;
      }
    }

    setEditing(true);
    try {
      const response = await promotionService.updatePromotion(
        editingPromotion.id,
        formData,
      );
      console.log("Update promotion response:", response);

      const updatedPromotion = response.data?.data || response.data;

      if (updatedPromotion) {
        setPromotions(
          promotions.map((p) =>
            p.id === editingPromotion.id ? updatedPromotion : p,
          ),
        );
      }

      setIsEditDialogOpen(false);
      resetForm();

      // Refresh the list to ensure we have the latest data
      await fetchPromotions();
    } catch (err: any) {
      console.error("Error updating promotion:", err);
      alert(err.response?.data?.message || "Failed to update promotion");
    } finally {
      setEditing(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Promotion List"
        subtitle="Manage discounts and promotional campaigns"
        onRefresh={fetchPromotions}
      />

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-end gap-3 mb-6">
        <Button
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="mr-2 w-4 h-4" />
          New Promotion
        </Button>
        <Button
          variant="outline"
          className="border-slate-200 hover:bg-slate-50"
        >
          <Plus className="mr-2 w-4 h-4" />
          Import CSV
        </Button>
        <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md">
          <Download className="mr-2 w-4 h-4" />
          Bulk Update
        </Button>
      </div>

      {/* Main Card */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by Name or Code"
                className="pl-10 bg-white border-slate-200 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              className="shrink-0 border-slate-200 hover:bg-slate-50"
            >
              <Filter className="w-4 h-4" />
            </Button>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 border-slate-200">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 border-slate-200">
                <SelectValue placeholder="All type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-type">All type</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <span className="mt-3 text-slate-500 font-medium">
                Loading promotions...
              </span>
            </div>
          ) : filteredPromotions.length === 0 ? (
            <EmptyState
              icon={<Tag className="w-8 h-8 text-slate-400" />}
              title="No promotions found"
              description="Create your first promotional campaign"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPromotions.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {promo.code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => navigate(`/promotions/${promo.id}`)}
                          className="font-medium text-indigo-900 hover:underline cursor-pointer"
                        >
                          {promo.name}
                        </button>
                        {promo.description && (
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {promo.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {getTypeLabel(promo.type)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {promo.scope}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          {promo.type === "PERCENTAGE"
                            ? `${promo.value}%`
                            : `$${promo.value.toFixed(2)}`}
                        </span>
                        {promo.maxDiscountAmount && (
                          <div className="text-xs text-gray-500">
                            Max: ${promo.maxDiscountAmount.toFixed(2)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(promo.startDate)}</div>
                          <div className="text-gray-500">
                            to {formatDate(promo.endDate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(promo.status)}
                          variant="secondary"
                        >
                          {promo.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {promo.usageLimit ? (
                            <>
                              <span className="font-medium">
                                {promo.usageCount || 0}
                              </span>
                              <span className="text-gray-500">
                                /{promo.usageLimit}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-500">Unlimited</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="bg-gray-200 text-gray-800 hover:bg-gray-200"
                          variant="secondary"
                        >
                          {promo.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleStatus(promo)}
                            title={promo.isActive ? "Deactivate" : "Activate"}
                          >
                            {promo.isActive ? (
                              <ToggleRight className="text-green-600" />
                            ) : (
                              <ToggleLeft className="text-gray-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditClick(promo)}
                            title="Edit"
                          >
                            <Edit />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleDeleteClick({
                                id: promo.id,
                                name: promo.name,
                              })
                            }
                          >
                            <Trash2 />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={promotionToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
        contextMessage="from the promotion list"
      />

      {/* Create Promotion Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Promotion</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new promotion
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    placeholder="e.g., SUMMER2026"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Summer Sale 2026"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                      <SelectItem value="BUY_X_GET_Y">Buy X Get Y</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scope">Scope *</Label>
                  <Select
                    value={formData.scope}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, scope: value })
                    }
                  >
                    <SelectTrigger id="scope">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ORDER">Order</SelectItem>
                      <SelectItem value="PRODUCT">Product</SelectItem>
                      <SelectItem value="CATEGORY">Category</SelectItem>
                      <SelectItem value="SHIPPING">Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">
                  Value * {formData.type === "PERCENTAGE" ? "(%)" : "($)"}
                </Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  step={formData.type === "PERCENTAGE" ? "1" : "0.01"}
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      value: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              {/* Show category selection for PRODUCT or CATEGORY scope */}
              {(formData.scope === "PRODUCT" ||
                formData.scope === "CATEGORY") && (
                <div className="space-y-3">
                  <Label>
                    {formData.scope === "CATEGORY"
                      ? "Select Categories *"
                      : "Select Categories or Products *"}
                  </Label>

                  {loadingOptions ? (
                    <div className="text-sm text-gray-500">
                      Loading options...
                    </div>
                  ) : (
                    <>
                      {/* Categories */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Categories</div>
                        <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                          {categories.length === 0 ? (
                            <div className="text-sm text-gray-500">
                              No categories available
                            </div>
                          ) : (
                            categories.map((category) => (
                              <div
                                key={category.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`cat-${category.id}`}
                                  checked={
                                    formData.applicableCategoryIds?.includes(
                                      category.id,
                                    ) || false
                                  }
                                  onCheckedChange={(checked) => {
                                    const currentIds =
                                      formData.applicableCategoryIds || [];
                                    if (checked) {
                                      setFormData({
                                        ...formData,
                                        applicableCategoryIds: [
                                          ...currentIds,
                                          category.id,
                                        ],
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        applicableCategoryIds:
                                          currentIds.filter(
                                            (id) => id !== category.id,
                                          ),
                                      });
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`cat-${category.id}`}
                                  className="text-sm cursor-pointer"
                                >
                                  {category.name}
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Products (only for PRODUCT scope) */}
                      {formData.scope === "PRODUCT" && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Products</div>
                          <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                            {products.length === 0 ? (
                              <div className="text-sm text-gray-500">
                                No products available
                              </div>
                            ) : (
                              products.map((product) => (
                                <div
                                  key={product.id}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`prod-${product.id}`}
                                    checked={
                                      formData.applicableProductIds?.includes(
                                        product.id,
                                      ) || false
                                    }
                                    onCheckedChange={(checked) => {
                                      const currentIds =
                                        formData.applicableProductIds || [];
                                      if (checked) {
                                        setFormData({
                                          ...formData,
                                          applicableProductIds: [
                                            ...currentIds,
                                            product.id,
                                          ],
                                        });
                                      } else {
                                        setFormData({
                                          ...formData,
                                          applicableProductIds:
                                            currentIds.filter(
                                              (id) => id !== product.id,
                                            ),
                                        });
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`prod-${product.id}`}
                                    className="text-sm cursor-pointer"
                                  >
                                    {product.name}
                                  </label>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Promotion description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </TabsContent>

            {/* Rules Tab */}
            <TabsContent value="rules" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minOrderValue">Min Order Value ($)</Label>
                  <Input
                    id="minOrderValue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minOrderValue || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderValue: parseFloat(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDiscountAmount">Max Discount ($)</Label>
                  <Input
                    id="maxDiscountAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maxDiscountAmount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxDiscountAmount:
                          parseFloat(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={formData.usageLimit || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usageLimit: parseInt(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usagePerCustomer">Usage Per Customer</Label>
                  <Input
                    id="usagePerCustomer"
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={formData.usagePerCustomer || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usagePerCustomer: parseInt(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Input
                  id="priority"
                  type="number"
                  min="0"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <p className="text-sm text-gray-500">
                  Higher priority promotions are applied first
                </p>
              </div>

              <div className="space-y-2">
                <Label>Customer Tiers</Label>
                <div className="flex gap-2 flex-wrap">
                  {["BRONZE", "SILVER", "GOLD", "PLATINUM"].map((tier) => (
                    <label key={tier} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.applicableCustomerTiers?.includes(
                          tier,
                        )}
                        onChange={(e) => {
                          const tiers = formData.applicableCustomerTiers || [];
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              applicableCustomerTiers: [...tiers, tier],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              applicableCustomerTiers: tiers.filter(
                                (t) => t !== tier,
                              ),
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{tier}</span>
                    </label>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePromotion}
              disabled={creating}
              className="bg-indigo-900 text-white hover:bg-indigo-800"
            >
              {creating ? "Creating..." : "Create Promotion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Promotion Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl bg-white   max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Promotion</DialogTitle>
            <DialogDescription>
              Update the promotion details below.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="SUMMER2024"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Summer Sale"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        type: value as PromotionRequest["type"],
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                      <SelectItem value="BUY_X_GET_Y">Buy X Get Y</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Scope</label>
                  <Select
                    value={formData.scope}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        scope: value as PromotionRequest["scope"],
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ORDER">Order</SelectItem>
                      <SelectItem value="PRODUCT">Product</SelectItem>
                      <SelectItem value="CATEGORY">Category</SelectItem>
                      <SelectItem value="SHIPPING">Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Value</label>
                  <Input
                    type="number"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        value: Number(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: Number(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter promotion description"
                  className="mt-1"
                />
              </div>
            </TabsContent>

            {/* Rules Tab */}
            <TabsContent value="rules" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Min Order Value</label>
                  <Input
                    type="number"
                    value={formData.minOrderValue || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderValue: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="0"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Max Discount Amount
                  </label>
                  <Input
                    type="number"
                    value={formData.maxDiscountAmount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxDiscountAmount: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="0"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Usage Limit</label>
                  <Input
                    type="number"
                    value={formData.usageLimit || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usageLimit: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Unlimited"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Usage Per Customer
                  </label>
                  <Input
                    type="number"
                    value={formData.usagePerCustomer || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usagePerCustomer: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Unlimited"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Categories Selection */}
              {(formData.scope === "CATEGORY" ||
                formData.scope === "PRODUCT") && (
                <div>
                  <label className="text-sm font-medium">
                    Applicable Categories
                    {formData.scope === "CATEGORY" && (
                      <span className="text-red-500"> *</span>
                    )}
                  </label>
                  <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-3">
                    {categories.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No categories available
                      </p>
                    ) : (
                      categories.map((category) => (
                        <label
                          key={category.id}
                          className="flex items-center space-x-2 py-1"
                        >
                          <Checkbox
                            checked={formData.applicableCategoryIds?.includes(
                              category.id,
                            )}
                            onCheckedChange={(checked) => {
                              const currentIds =
                                formData.applicableCategoryIds || [];
                              setFormData({
                                ...formData,
                                applicableCategoryIds: checked
                                  ? [...currentIds, category.id]
                                  : currentIds.filter(
                                      (id) => id !== category.id,
                                    ),
                              });
                            }}
                          />
                          <span className="text-sm">{category.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Products Selection */}
              {formData.scope === "PRODUCT" && (
                <div>
                  <label className="text-sm font-medium">
                    Applicable Products
                  </label>
                  <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-3">
                    {products.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No products available
                      </p>
                    ) : (
                      products.map((product) => (
                        <label
                          key={product.id}
                          className="flex items-center space-x-2 py-1"
                        >
                          <Checkbox
                            checked={formData.applicableProductIds?.includes(
                              product.id,
                            )}
                            onCheckedChange={(checked) => {
                              const currentIds =
                                formData.applicableProductIds || [];
                              setFormData({
                                ...formData,
                                applicableProductIds: checked
                                  ? [...currentIds, product.id]
                                  : currentIds.filter(
                                      (id) => id !== product.id,
                                    ),
                              });
                            }}
                          />
                          <span className="text-sm">{product.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">
                  Applicable Customer Tiers
                </label>
                <div className="mt-2 space-y-2">
                  {["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"].map(
                    (tier) => (
                      <label key={tier} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.applicableCustomerTiers?.includes(
                            tier,
                          )}
                          onCheckedChange={(checked) => {
                            const currentTiers =
                              formData.applicableCustomerTiers || [];
                            setFormData({
                              ...formData,
                              applicableCustomerTiers: checked
                                ? [...currentTiers, tier]
                                : currentTiers.filter((t) => t !== tier),
                            });
                          }}
                        />
                        <span className="text-sm">{tier}</span>
                      </label>
                    ),
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePromotion}
              disabled={editing}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
            >
              {editing ? "Updating..." : "Update Promotion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
