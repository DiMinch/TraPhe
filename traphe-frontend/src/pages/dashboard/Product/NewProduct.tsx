import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Plus, X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import {
  supplierService,
  type SupplierResponse,
} from "@/services/supplier.service";
import type { Product, ProductVariant } from "@/types/product.types";
import type { Category, CategorySpec } from "@/types/category.types";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NewProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (product: Product) => void;
}

interface VariantFormData {
  id?: string; // Temporary ID for UI, or real ID after save
  sku: string;
  barcode: string;
  variantName: string;
  variantSpecs: string;
  purchasePriceAvg: string;
  sellingPrice: string;
  displayOrder: number;
  isEditing?: boolean;
  isSaved?: boolean; // Track if variant is saved to backend
}

export default function NewProductDialog({
  open,
  onOpenChange,
  onAdd,
}: NewProductDialogProps) {
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Product, Step 2: Variants
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    supplierId: "",
    description: "",
    minStockThreshold: "",
    warrantyPeriod: "",
    commonSpecs: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const [categorySpecs, setCategorySpecs] = useState<CategorySpec[]>([]);
  const [specsValues, setSpecsValues] = useState<Record<string, string>>({});

  // Variant management
  const [variants, setVariants] = useState<VariantFormData[]>([]);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(
    null,
  );
  const [newVariant, setNewVariant] = useState<VariantFormData>({
    sku: "",
    barcode: "",
    variantName: "",
    variantSpecs: "",
    purchasePriceAvg: "",
    sellingPrice: "",
    displayOrder: 1,
    isEditing: true,
  });
  const [isAddingVariant, setIsAddingVariant] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchSuppliers();
      resetForm();
    }
  }, [open]);

  // Load specs when category changes
  useEffect(() => {
    if (formData.categoryId) {
      fetchCategorySpecs(formData.categoryId);
    } else {
      setCategorySpecs([]);
      setSpecsValues({});
    }
  }, [formData.categoryId]);

  const resetForm = () => {
    setStep(1);
    setFormData({
      name: "",
      categoryId: "",
      supplierId: "",
      description: "",
      minStockThreshold: "",
      warrantyPeriod: "",
      commonSpecs: "",
    });
    setImageFile(null);
    setVariants([]);
    setCreatedProductId(null);
    setIsAddingVariant(false);
    setEditingVariantIndex(null);
    setCategorySpecs([]);
    setSpecsValues({});
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response.data) {
        const categoriesData = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.content || [];
        setCategories(categoriesData);
      }
    } catch (error: unknown) {
      console.error("Failed to load categories:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getAllSuppliers();
      if (response.data) {
        const suppliersData = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.content || [];
        setSuppliers(suppliersData);
      }
    } catch (error: unknown) {
      console.error("Failed to load suppliers:", error);
    }
  };

  const fetchCategorySpecs = async (categoryId: string) => {
    try {
      const response = await categoryService.getSpecs(categoryId);
      if (response.data) {
        setCategorySpecs(response.data);
        // Initialize specs values with empty strings
        const initialValues: Record<string, string> = {};
        response.data.forEach((spec) => {
          initialValues[spec.specKey] = "";
        });
        setSpecsValues(initialValues);
      }
    } catch (error) {
      console.error("Failed to load category specs:", error);
      setCategorySpecs([]);
      setSpecsValues({});
    }
  };

  // Step 1: Create Product
  const handleCreateProduct = async () => {
    if (!formData.name || !formData.categoryId || !formData.supplierId) {
      toast.error("Please fill in required fields (Name, Category, Supplier)");
      return;
    }

    // Validate required specs
    if (categorySpecs.length > 0) {
      const missingRequiredSpecs = categorySpecs
        .filter((spec) => spec.isRequired && !specsValues[spec.specKey])
        .map((spec) => spec.specName);

      if (missingRequiredSpecs.length > 0) {
        toast.error(
          `Please fill required specs: ${missingRequiredSpecs.join(", ")}`,
        );
        return;
      }
    }

    // Convert specsValues to JSON string if categorySpecs exist
    let commonSpecsJson = formData.commonSpecs;
    if (categorySpecs.length > 0 && Object.keys(specsValues).length > 0) {
      commonSpecsJson = JSON.stringify(specsValues);
    }

    try {
      setLoading(true);
      const response = await productService.createProduct(
        {
          name: formData.name,
          categoryId: formData.categoryId,
          supplierId: formData.supplierId,
          description: formData.description || undefined,
          minStockThreshold: formData.minStockThreshold
            ? Number(formData.minStockThreshold)
            : undefined,
          warrantyPeriod: formData.warrantyPeriod
            ? Number(formData.warrantyPeriod)
            : undefined,
          commonSpecs: commonSpecsJson || undefined,
        },
        imageFile || undefined,
      );

      if (response.data) {
        setCreatedProductId(response.data.id);
        toast.success("Product created! Now add variants.");
        setStep(2);
      }
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to create product";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Variant CRUD
  const handleAddVariantRow = () => {
    setNewVariant({
      sku: "",
      barcode: "",
      variantName: "",
      variantSpecs: "",
      purchasePriceAvg: "",
      sellingPrice: "",
      displayOrder: variants.length + 1,
      isEditing: true,
    });
    setIsAddingVariant(true);
  };

  const handleSaveNewVariant = async () => {
    if (
      !newVariant.sku ||
      !newVariant.variantName ||
      !newVariant.sellingPrice
    ) {
      toast.error("Please fill in SKU, Variant Name, and Selling Price");
      return;
    }

    if (!createdProductId) {
      toast.error("Product ID not found");
      return;
    }

    try {
      setLoading(true);
      const response = await productService.createVariant({
        productId: createdProductId,
        sku: newVariant.sku,
        barcode: newVariant.barcode || undefined,
        variantName: newVariant.variantName,
        variantSpecs: newVariant.variantSpecs || "",
        purchasePriceAvg: newVariant.purchasePriceAvg
          ? Number(newVariant.purchasePriceAvg)
          : undefined,
        sellingPrice: Number(newVariant.sellingPrice),
      });

      if (response.data) {
        setVariants([
          ...variants,
          {
            ...newVariant,
            id: response.data.id,
            isSaved: true,
            isEditing: false,
          },
        ]);
        setIsAddingVariant(false);
        toast.success("Variant added successfully");
      }
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to add variant";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelNewVariant = () => {
    setIsAddingVariant(false);
    setNewVariant({
      sku: "",
      barcode: "",
      variantName: "",
      variantSpecs: "",
      purchasePriceAvg: "",
      sellingPrice: "",
      displayOrder: variants.length + 1,
      isEditing: true,
    });
  };

  const handleEditVariant = (index: number) => {
    setEditingVariantIndex(index);
  };

  const handleUpdateVariant = async (index: number) => {
    const variant = variants[index];
    if (!variant.id || !variant.isSaved) {
      toast.error("Cannot update unsaved variant");
      return;
    }

    try {
      setLoading(true);
      const response = await productService.updateVariant(variant.id, {
        sku: variant.sku,
        barcode: variant.barcode || undefined,
        variantName: variant.variantName,
        variantSpecs: variant.variantSpecs || undefined,
        purchasePriceAvg: variant.purchasePriceAvg
          ? Number(variant.purchasePriceAvg)
          : undefined,
        sellingPrice: Number(variant.sellingPrice),
      });

      if (response.data) {
        setEditingVariantIndex(null);
        toast.success("Variant updated successfully");
      }
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to update variant";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVariant = async (index: number) => {
    const variant = variants[index];
    if (!variant.id || !variant.isSaved) {
      // Not saved yet, just remove from UI
      setVariants(variants.filter((_, i) => i !== index));
      return;
    }

    try {
      setLoading(true);
      await productService.deleteVariant(variant.id);
      setVariants(variants.filter((_, i) => i !== index));
      toast.success("Variant deleted successfully");
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to delete variant";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (variants.length === 0) {
      toast.error("Please add at least one variant before finishing");
      return;
    }

    // Fetch the complete product with variants
    if (createdProductId) {
      try {
        const response = await productService.getProductById(createdProductId);
        if (response.data) {
          onAdd(response.data);
          toast.success("Product and variants created successfully!");
          onOpenChange(false);
        }
      } catch (error) {
        toast.error("Failed to fetch product details");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[75vw] max-h-[90vh] flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            New Product {step === 2 && "- Add Variants"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {step === 1 ? (
            <div className="space-y-6 py-4">
              {/* Product Information */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="MacBook Pro M1 2020"
                    className="bg-white"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: value })
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warranty">Warranty (months)</Label>
                  <Input
                    id="warranty"
                    type="number"
                    placeholder="12"
                    className="bg-white"
                    value={formData.warrantyPeriod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        warrantyPeriod: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select
                    value={formData.supplierId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, supplierId: value })
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threshold">Min Stock Threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    placeholder="5"
                    className="bg-white"
                    value={formData.minStockThreshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minStockThreshold: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  className="bg-white"
                  placeholder="Product description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center bg-white h-[132px] flex items-center justify-center">
                    <div>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setImageFile(file);
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() =>
                          document.getElementById("image")?.click()
                        }
                      >
                        Choose File
                      </Button>
                      <span className="text-sm text-gray-500 ml-2">
                        {imageFile ? imageFile.name : "No file chosen"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spec">Common Specs</Label>
                  {categorySpecs.length === 0 ? (
                    <Textarea
                      id="spec"
                      className="h-[132px] bg-white font-mono text-sm resize-none"
                      placeholder={`{
  "Screen_Size": "1920x1080",
  "Battery": "60Wh"
}`}
                      value={formData.commonSpecs}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          commonSpecs: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <div className="h-[132px] overflow-y-auto border rounded-md p-3 bg-white space-y-3">
                      {categorySpecs.map((spec) => (
                        <div key={spec.id} className="space-y-1">
                          <Label className="text-xs">
                            {spec.specName}
                            {spec.isRequired && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </Label>
                          {spec.dataType === "SELECT" && spec.options ? (
                            <select
                              value={specsValues[spec.specKey] || ""}
                              onChange={(e) =>
                                setSpecsValues({
                                  ...specsValues,
                                  [spec.specKey]: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 text-sm border rounded-md"
                              required={spec.isRequired}
                            >
                              <option value="">Select {spec.specName}</option>
                              {spec.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Input
                              type={
                                spec.dataType === "NUMBER" ? "number" : "text"
                              }
                              value={specsValues[spec.specKey] || ""}
                              onChange={(e) =>
                                setSpecsValues({
                                  ...specsValues,
                                  [spec.specKey]: e.target.value,
                                })
                              }
                              className="h-8 text-sm"
                              placeholder={`Enter ${spec.specName}`}
                              required={spec.isRequired}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Variant List */}
              <Card className="bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Variant List</h3>
                    <Button
                      onClick={handleAddVariantRow}
                      size="sm"
                      disabled={isAddingVariant}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Variant
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Order</TableHead>
                          <TableHead className="min-w-[150px]">SKU *</TableHead>
                          <TableHead className="min-w-[120px]">
                            Barcode
                          </TableHead>
                          <TableHead className="min-w-[200px]">
                            Variant Name *
                          </TableHead>
                          <TableHead className="min-w-[180px]">
                            Spec (JSON)
                          </TableHead>
                          <TableHead className="min-w-[120px]">
                            Purchase Price
                          </TableHead>
                          <TableHead className="min-w-[120px]">
                            Selling Price *
                          </TableHead>
                          <TableHead className="w-[120px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {variants.map((variant, index) => (
                          <TableRow key={variant.id || index}>
                            <TableCell>{variant.displayOrder}</TableCell>
                            <TableCell>
                              {editingVariantIndex === index ? (
                                <Input
                                  value={variant.sku}
                                  onChange={(e) => {
                                    const newVariants = [...variants];
                                    newVariants[index].sku = e.target.value;
                                    setVariants(newVariants);
                                  }}
                                  className="h-8"
                                />
                              ) : (
                                variant.sku
                              )}
                            </TableCell>
                            <TableCell>
                              {editingVariantIndex === index ? (
                                <Input
                                  value={variant.barcode}
                                  onChange={(e) => {
                                    const newVariants = [...variants];
                                    newVariants[index].barcode = e.target.value;
                                    setVariants(newVariants);
                                  }}
                                  className="h-8"
                                />
                              ) : (
                                variant.barcode || "-"
                              )}
                            </TableCell>
                            <TableCell>
                              {editingVariantIndex === index ? (
                                <Input
                                  value={variant.variantName}
                                  onChange={(e) => {
                                    const newVariants = [...variants];
                                    newVariants[index].variantName =
                                      e.target.value;
                                    setVariants(newVariants);
                                  }}
                                  className="h-8"
                                />
                              ) : (
                                variant.variantName
                              )}
                            </TableCell>
                            <TableCell>
                              {editingVariantIndex === index ? (
                                <Textarea
                                  value={variant.variantSpecs}
                                  onChange={(e) => {
                                    const newVariants = [...variants];
                                    newVariants[index].variantSpecs =
                                      e.target.value;
                                    setVariants(newVariants);
                                  }}
                                  className="h-20 font-mono text-xs"
                                />
                              ) : (
                                <pre className="text-xs font-mono max-w-[150px] overflow-x-auto">
                                  {variant.variantSpecs || "{}"}
                                </pre>
                              )}
                            </TableCell>
                            <TableCell>
                              {editingVariantIndex === index ? (
                                <Input
                                  type="number"
                                  value={variant.purchasePriceAvg}
                                  onChange={(e) => {
                                    const newVariants = [...variants];
                                    newVariants[index].purchasePriceAvg =
                                      e.target.value;
                                    setVariants(newVariants);
                                  }}
                                  className="h-8"
                                />
                              ) : (
                                `${variant.purchasePriceAvg || "0"}đ`
                              )}
                            </TableCell>
                            <TableCell>
                              {editingVariantIndex === index ? (
                                <Input
                                  type="number"
                                  value={variant.sellingPrice}
                                  onChange={(e) => {
                                    const newVariants = [...variants];
                                    newVariants[index].sellingPrice =
                                      e.target.value;
                                    setVariants(newVariants);
                                  }}
                                  className="h-8"
                                />
                              ) : (
                                `${variant.sellingPrice}đ`
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {editingVariantIndex === index ? (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => handleUpdateVariant(index)}
                                      disabled={loading}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                      onClick={() =>
                                        setEditingVariantIndex(null)
                                      }
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 hover:bg-amber-50 text-slate-600 hover:text-amber-600"
                                      onClick={() => handleEditVariant(index)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 hover:bg-red-50 text-slate-600 hover:text-red-600"
                                      onClick={() => handleDeleteVariant(index)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}

                        {/* New Variant Row */}
                        {isAddingVariant && (
                          <TableRow className="bg-blue-50/50">
                            <TableCell>{variants.length + 1}</TableCell>
                            <TableCell>
                              <Input
                                value={newVariant.sku}
                                onChange={(e) =>
                                  setNewVariant({
                                    ...newVariant,
                                    sku: e.target.value,
                                  })
                                }
                                placeholder="MB-M1-256"
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={newVariant.barcode}
                                onChange={(e) =>
                                  setNewVariant({
                                    ...newVariant,
                                    barcode: e.target.value,
                                  })
                                }
                                placeholder="123456789"
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={newVariant.variantName}
                                onChange={(e) =>
                                  setNewVariant({
                                    ...newVariant,
                                    variantName: e.target.value,
                                  })
                                }
                                placeholder="Gray - 8GB RAM"
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Textarea
                                value={newVariant.variantSpecs}
                                onChange={(e) =>
                                  setNewVariant({
                                    ...newVariant,
                                    variantSpecs: e.target.value,
                                  })
                                }
                                placeholder='{"RAM":"8GB"}'
                                className="h-20 font-mono text-xs"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={newVariant.purchasePriceAvg}
                                onChange={(e) =>
                                  setNewVariant({
                                    ...newVariant,
                                    purchasePriceAvg: e.target.value,
                                  })
                                }
                                placeholder="1000"
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={newVariant.sellingPrice}
                                onChange={(e) =>
                                  setNewVariant({
                                    ...newVariant,
                                    sellingPrice: e.target.value,
                                  })
                                }
                                placeholder="3000"
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={handleSaveNewVariant}
                                  disabled={loading}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                  onClick={handleCancelNewVariant}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {variants.length === 0 && !isAddingVariant && (
                    <div className="text-center py-8 text-slate-500">
                      No variants added yet. Click "Add Variant" to start.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          {step === 1 ? (
            <div className="flex justify-end gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProduct}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
              >
                {loading ? "Creating..." : "Next: Add Variants"}
              </Button>
            </div>
          ) : (
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="px-6"
              >
                Back to Product Info
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (variants.length === 0) {
                      toast.warning("No variants added. Closing dialog.");
                    }
                    onOpenChange(false);
                  }}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFinish}
                  disabled={loading || variants.length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                >
                  Finish & Close
                </Button>
              </div>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
