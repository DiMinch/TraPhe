import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Edit,
  Package,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
import { productService } from "@/services/product.service";
import type {
  Product,
  ProductVariant,
  CreateVariantRequest,
  UpdateVariantRequest,
} from "@/types/product.types";
import { toast } from "sonner";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditVariantOpen, setIsEditVariantOpen] = useState(false);
  const [isAddVariantOpen, setIsAddVariantOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [variantFormData, setVariantFormData] = useState<CreateVariantRequest>({
    productId: id || "",
    sku: "",
    barcode: "",
    variantName: "",
    variantSpecs: "",
    sellingPrice: 0,
  });
  const [variantSpecs, setVariantSpecs] = useState<
    Array<{ type: string; customType: string; value: string }>
  >([{ type: "", customType: "", value: "" }]);

  const specOptions = [
    "RAM",
    "Storage",
    "Color",
    "Size",
    "CPU",
    "GPU",
    "Screen Size",
    "Battery",
    "Other",
  ];

  const addSpecField = () => {
    setVariantSpecs([...variantSpecs, { type: "", customType: "", value: "" }]);
  };

  const removeSpecField = (index: number) => {
    if (variantSpecs.length > 1) {
      setVariantSpecs(variantSpecs.filter((_, i) => i !== index));
    }
  };

  const updateSpecField = (index: number, field: string, value: string) => {
    const updated = [...variantSpecs];
    updated[index] = { ...updated[index], [field]: value };
    setVariantSpecs(updated);
  };

  const generateVariantFromSpecs = () => {
    // Filter out empty specs
    const validSpecs = variantSpecs.filter((spec) => spec.value && spec.type);

    // Create JSON object for backend
    const specsObject: Record<string, string> = {};
    validSpecs.forEach((spec) => {
      const specType = spec.type === "Other" ? spec.customType : spec.type;
      if (specType) {
        specsObject[specType] = spec.value;
      }
    });

    // Generate variant name (for display)
    const variantName = validSpecs.map((spec) => spec.value).join(" + ");

    // Convert specs object to JSON string
    const variantSpecsJSON = JSON.stringify(specsObject);

    setVariantFormData({
      ...variantFormData,
      variantName: variantName || "",
      variantSpecs: variantSpecsJSON || "",
    });
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductById(id!);
      setProduct(response.data);
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to load product";
      toast.error(errorMsg);
      navigate("/product/productlist");
    } finally {
      setLoading(false);
    }
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setVariantFormData({
      productId: id || "",
      sku: variant.sku,
      barcode: variant.barcode || "",
      variantName: variant.variantName,
      variantSpecs: variant.variantSpecs,
      sellingPrice: variant.sellingPrice,
    });
    setIsEditVariantOpen(true);
  };

  const handleAddVariantClick = () => {
    setVariantFormData({
      productId: id || "",
      sku: "",
      barcode: "",
      variantName: "",
      variantSpecs: "",
      sellingPrice: 0,
    });
    setVariantSpecs([{ type: "", customType: "", value: "" }]);
    setIsAddVariantOpen(true);
  };

  const handleSaveVariant = async () => {
    // Validate required fields
    if (!variantFormData.sku.trim()) {
      toast.error("SKU is required");
      return;
    }
    if (!variantFormData.variantName.trim()) {
      toast.error("Variant name is required");
      return;
    }
    if (variantFormData.sellingPrice <= 0) {
      toast.error("Selling price must be greater than 0");
      return;
    }

    setSaving(true);
    try {
      if (editingVariant) {
        const updateData: UpdateVariantRequest = {
          sku: variantFormData.sku,
          barcode: variantFormData.barcode,
          variantName: variantFormData.variantName,
          variantSpecs: variantFormData.variantSpecs,
          sellingPrice: variantFormData.sellingPrice,
        };
        await productService.updateVariant(editingVariant.id, updateData);
        toast.success("Variant updated successfully");
        setIsEditVariantOpen(false);
      } else {
        // Ensure selling price is a valid number
        const createData: CreateVariantRequest = {
          ...variantFormData,
          sellingPrice: Number(variantFormData.sellingPrice),
        };
        console.log("Submitting variant data:", createData);
        await productService.createVariant(createData);
        toast.success("Variant added successfully");
        setIsAddVariantOpen(false);
      }
      await fetchProduct();
      setEditingVariant(null);
    } catch (error: any) {
      console.error("Variant save error:", error);
      // Extract backend error message
      let errorMsg = "Failed to save variant";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVariant = async (
    variantId: string,
    variantName: string,
  ) => {
    if (!confirm(`Are you sure you want to delete variant "${variantName}"?`)) {
      return;
    }
    try {
      await productService.deleteVariant(variantId);
      toast.success("Variant deleted successfully");
      await fetchProduct();
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to delete variant";
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </PageContainer>
    );
  }

  if (!product) {
    return (
      <PageContainer>
        <EmptyState
          icon={<Package className="w-10 h-10 text-slate-400" />}
          title="Product not found"
          description="The product you're looking for doesn't exist."
          action={
            <Button onClick={() => navigate("/product/productlist")}>
              Back to Products
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Product Details"
        subtitle={`View information about ${product.name}`}
      />

      <div className="flex gap-3 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/product/productlist")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
        <Button
          onClick={() => navigate(`/product/edit/${product.id}`)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Product
        </Button>
      </div>

      <div className="space-y-6">
        {/* Product Information Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex gap-6">
              <div className="w-64 h-64 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-20 h-20 text-slate-400" />
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-800">
                    {product.name}
                  </h2>
                  <p className="text-slate-600 mt-2">
                    {product.description || "No description available"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Category</p>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">
                      {product.categoryName}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Supplier</p>
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0">
                      {product.supplierName}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">
                      Warranty Period
                    </p>
                    <p className="text-base font-medium text-slate-700">
                      {product.warrantyPeriod
                        ? `${product.warrantyPeriod} months`
                        : "No warranty"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">
                      Min Stock Threshold
                    </p>
                    <p className="text-base font-medium text-slate-700">
                      {product.minStockThreshold || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Status</p>
                    <Badge
                      className={`${
                        product.status === "ACTIVE"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                      } border-0`}
                    >
                      {product.status}
                    </Badge>
                  </div>
                </div>

                {product.commonSpecs && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">
                      Common Specifications
                    </p>
                    <p className="text-base text-slate-700">
                      {product.commonSpecs}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Variants Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-800">
                Product Variants ({product.variants?.length || 0})
              </h3>
              <Button
                onClick={handleAddVariantClick}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Variant
              </Button>
            </div>

            {product.variants && product.variants.length > 0 ? (
              <div className="space-y-4">
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="p-5 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-slate-800">
                          {variant.variantName}
                        </h4>
                        <p className="text-slate-600 mt-1">
                          {variant.variantSpecs}
                        </p>
                        <div className="flex gap-6 mt-3">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">SKU</p>
                            <p className="text-sm font-mono font-medium text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                              {variant.sku}
                            </p>
                          </div>
                          {variant.barcode && (
                            <div>
                              <p className="text-xs text-slate-500 mb-1">
                                Barcode
                              </p>
                              <p className="text-sm font-mono font-medium text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                                {variant.barcode}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <p className="text-sm text-slate-500 mb-1">
                          Selling Price
                        </p>
                        <p className="text-2xl font-bold text-green-600 mb-3">
                          {variant.sellingPrice.toLocaleString()}đ
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditVariant(variant)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              handleDeleteVariant(
                                variant.id,
                                variant.variantName,
                              )
                            }
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Package className="w-10 h-10 text-slate-400" />}
                title="No variants available"
                description="This product doesn't have any variants yet."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Variant Dialog */}
      <Dialog open={isEditVariantOpen} onOpenChange={setIsEditVariantOpen}>
        <DialogContent className="max-w-2xl min-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Edit Variant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="variantName">Variant Name *</Label>
                <Input
                  id="variantName"
                  value={variantFormData.variantName}
                  onChange={(e) =>
                    setVariantFormData({
                      ...variantFormData,
                      variantName: e.target.value,
                    })
                  }
                  placeholder="e.g., 32GB RAM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price *</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  value={variantFormData.sellingPrice}
                  onChange={(e) =>
                    setVariantFormData({
                      ...variantFormData,
                      sellingPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={variantFormData.sku}
                  onChange={(e) =>
                    setVariantFormData({
                      ...variantFormData,
                      sku: e.target.value,
                    })
                  }
                  placeholder="e.g., LAPTOP-32GB"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={variantFormData.barcode}
                  onChange={(e) =>
                    setVariantFormData({
                      ...variantFormData,
                      barcode: e.target.value,
                    })
                  }
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="variantSpecs">Variant Specifications *</Label>
              <Input
                id="variantSpecs"
                value={variantFormData.variantSpecs}
                onChange={(e) =>
                  setVariantFormData({
                    ...variantFormData,
                    variantSpecs: e.target.value,
                  })
                }
                placeholder="e.g., 32GB RAM, 1TB SSD"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditVariantOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveVariant} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Variant Dialog */}
      <Dialog open={isAddVariantOpen} onOpenChange={setIsAddVariantOpen}>
        <DialogContent className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Variant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Variant Specifications Builder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Variant Specifications *
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSpecField}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Spec
                </Button>
              </div>

              {variantSpecs.map((spec, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Spec Type</Label>
                      <Select
                        value={spec.type}
                        onValueChange={(value) =>
                          updateSpecField(index, "type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {specOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {spec.type === "Other" && (
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">
                          Custom Type
                        </Label>
                        <Input
                          value={spec.customType}
                          onChange={(e) =>
                            updateSpecField(index, "customType", e.target.value)
                          }
                          placeholder="e.g., Weight"
                        />
                      </div>
                    )}

                    <div
                      className={`space-y-1 ${spec.type === "Other" ? "" : "col-span-1"}`}
                    >
                      <Label className="text-xs text-gray-600">Value</Label>
                      <Input
                        value={spec.value}
                        onChange={(e) =>
                          updateSpecField(index, "value", e.target.value)
                        }
                        placeholder="e.g., 32GB"
                        onBlur={generateVariantFromSpecs}
                      />
                    </div>
                  </div>

                  {variantSpecs.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-6"
                      onClick={() => removeSpecField(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Generated Variant Info */}
            <div className="border-t pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newVariantName">
                    Generated Variant Name *
                  </Label>
                  <Input
                    id="newVariantName"
                    value={variantFormData.variantName}
                    onChange={(e) =>
                      setVariantFormData({
                        ...variantFormData,
                        variantName: e.target.value,
                      })
                    }
                    placeholder="Auto-generated"
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newSellingPrice">Selling Price *</Label>
                  <Input
                    id="newSellingPrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={variantFormData.sellingPrice || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setVariantFormData({
                        ...variantFormData,
                        sellingPrice: value === "" ? 0 : parseFloat(value),
                      });
                    }}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="generatedSpecs">Full Specifications</Label>
                <Input
                  id="generatedSpecs"
                  value={(() => {
                    try {
                      const specs = JSON.parse(
                        variantFormData.variantSpecs || "{}",
                      );
                      return (
                        Object.entries(specs)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ") || ""
                      );
                    } catch {
                      return variantFormData.variantSpecs;
                    }
                  })()}
                  readOnly
                  placeholder="Auto-generated from specs"
                  className="bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newSku">SKU *</Label>
                  <Input
                    id="newSku"
                    value={variantFormData.sku}
                    onChange={(e) =>
                      setVariantFormData({
                        ...variantFormData,
                        sku: e.target.value,
                      })
                    }
                    placeholder="e.g., LAPTOP-32GB"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newBarcode">Barcode</Label>
                  <Input
                    id="newBarcode"
                    value={variantFormData.barcode}
                    onChange={(e) =>
                      setVariantFormData({
                        ...variantFormData,
                        barcode: e.target.value,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddVariantOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveVariant}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {saving ? "Adding..." : "Add Variant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
