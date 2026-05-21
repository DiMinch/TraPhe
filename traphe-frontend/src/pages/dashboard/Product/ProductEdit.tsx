import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import {
  supplierService,
  type SupplierResponse,
} from "@/services/supplier.service";
import type { Product } from "@/types/product.types";
import type { Category, CategorySpec } from "@/types/category.types";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageLayout";

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [categorySpecs, setCategorySpecs] = useState<CategorySpec[]>([]);
  const [specValues, setSpecValues] = useState<Record<string, string>>({});
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
  const [customSpecs, setCustomSpecs] = useState<
    { key: string; name: string }[]
  >([]); // Custom added specs
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecName, setNewSpecName] = useState("");

  useEffect(() => {
    if (id) {
      fetchCategories();
      fetchSuppliers();
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Load category specs when categoryId and categories are available
  useEffect(() => {
    if (formData.categoryId && categories.length > 0) {
      const selectedCategory = categories.find(
        (c) => c.id === formData.categoryId,
      );
      if (
        selectedCategory &&
        selectedCategory.specs &&
        selectedCategory.specs.length > 0
      ) {
        setCategorySpecs(selectedCategory.specs);
      } else {
        // Try to fetch specs directly from API if not in category object
        fetchCategorySpecs(formData.categoryId);
      }
    } else {
      setCategorySpecs([]);
    }
  }, [formData.categoryId, categories]);

  // Parse existing commonSpecs when product data is loaded
  useEffect(() => {
    if (formData.commonSpecs) {
      try {
        const parsed = JSON.parse(formData.commonSpecs);
        setSpecValues(parsed);
        // Store the keys from existing specs
        const keys = Object.keys(parsed);

        // Identify specs that are NOT in category specs (custom specs)
        const categorySpecKeys = categorySpecs.map((s) => s.specKey);
        const customKeys = keys.filter(
          (key) => !categorySpecKeys.includes(key),
        );
        setCustomSpecs(
          customKeys.map((key) => ({
            key,
            name: key.replace(/([A-Z])/g, " $1").trim(), // Convert camelCase to readable name
          })),
        );
      } catch {
        setSpecValues({});
        setCustomSpecs([]);
      }
    }
  }, [formData.commonSpecs, categorySpecs]);

  const fetchCategorySpecs = async (categoryId: string) => {
    try {
      const response = await categoryService.getSpecs(categoryId);
      if (response.data) {
        setCategorySpecs(response.data);
      }
    } catch (error) {
      console.error("Failed to load category specs:", error);
    }
  };

  // Update commonSpecs JSON when spec values change
  const handleSpecValueChange = (specKey: string, value: string) => {
    const newValues = { ...specValues, [specKey]: value };
    setSpecValues(newValues);
    // Filter out empty values and convert to JSON
    const filteredValues = Object.fromEntries(
      Object.entries(newValues).filter(([, v]) => v && v.trim() !== ""),
    );
    setFormData((prev) => ({
      ...prev,
      commonSpecs:
        Object.keys(filteredValues).length > 0
          ? JSON.stringify(filteredValues)
          : "",
    }));
  };

  // Add a new custom spec
  const handleAddCustomSpec = () => {
    if (!newSpecKey.trim()) {
      toast.error("Spec key is required");
      return;
    }

    // Check if key already exists
    const allKeys = [
      ...categorySpecs.map((s) => s.specKey),
      ...customSpecs.map((s) => s.key),
    ];
    if (allKeys.includes(newSpecKey)) {
      toast.error("This spec key already exists");
      return;
    }

    const specName =
      newSpecName.trim() || newSpecKey.replace(/([A-Z])/g, " $1").trim();
    setCustomSpecs((prev) => [...prev, { key: newSpecKey, name: specName }]);
    setNewSpecKey("");
    setNewSpecName("");
  };

  // Delete a custom spec
  const handleDeleteSpec = (specKey: string) => {
    // Remove from custom specs
    setCustomSpecs((prev) => prev.filter((s) => s.key !== specKey));

    // Remove the value and update formData
    const newValues = { ...specValues };
    delete newValues[specKey];
    setSpecValues(newValues);

    // Update formData.commonSpecs
    const filteredValues = Object.fromEntries(
      Object.entries(newValues).filter(([, v]) => v && v.trim() !== ""),
    );
    setFormData((prev) => ({
      ...prev,
      commonSpecs:
        Object.keys(filteredValues).length > 0
          ? JSON.stringify(filteredValues)
          : "",
    }));
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response.data) {
        // Handle both direct array and paginated response
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
        // Handle both direct array and paginated response
        const suppliersData = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.content || [];
        setSuppliers(suppliersData);
      }
    } catch (error: unknown) {
      console.error("Failed to load suppliers:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductById(id!);
      if (response.data) {
        setProduct(response.data);
        // Fetch suppliers first to find the matching supplierId by name
        const suppliersResponse = await supplierService.getAllSuppliers();
        let matchedSupplierId = "";
        if (suppliersResponse.data) {
          const suppliersData = Array.isArray(suppliersResponse.data)
            ? suppliersResponse.data
            : (suppliersResponse.data as any)?.content || [];
          setSuppliers(suppliersData);
          // Find supplier by name
          const matchedSupplier = suppliersData.find(
            (s: SupplierResponse) => s.name === response.data.supplierName,
          );
          if (matchedSupplier) {
            matchedSupplierId = matchedSupplier.id;
          }
        }
        setFormData({
          name: response.data.name || "",
          categoryId: response.data.categoryId || "",
          supplierId: matchedSupplierId,
          description: response.data.description || "",
          minStockThreshold: response.data.minStockThreshold?.toString() || "",
          warrantyPeriod: response.data.warrantyPeriod?.toString() || "",
          commonSpecs: response.data.commonSpecs || "",
        });
      }
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to load product";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name) {
      toast.error("Product name is required");
      return;
    }

    try {
      setLoading(true);
      const response = await productService.updateProduct(
        id!,
        {
          name: formData.name,
          categoryId: formData.categoryId || undefined,
          supplierId: formData.supplierId || undefined,
          description: formData.description || undefined,
          minStockThreshold: formData.minStockThreshold
            ? Number(formData.minStockThreshold)
            : undefined,
          warrantyPeriod: formData.warrantyPeriod
            ? Number(formData.warrantyPeriod)
            : undefined,
          commonSpecs: formData.commonSpecs || undefined,
        },
        imageFile || undefined,
      );

      if (response.data) {
        toast.success("Product updated successfully");
        navigate("/admin/menu/items");
      }
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to update product";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !product) {
    return (
      <div className="p-6">
        <div className="text-center py-10">Loading product...</div>
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/menu/items")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-semibold">Edit Product</h1>
      </div>

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Product name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
              >
                <SelectTrigger>
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
              <Label htmlFor="supplierId">Supplier</Label>
              <Select
                value={formData.supplierId}
                onValueChange={(value) =>
                  setFormData({ ...formData, supplierId: value })
                }
              >
                <SelectTrigger>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warranty">Warranty (months)</Label>
              <Input
                id="warranty"
                type="number"
                value={formData.warrantyPeriod}
                onChange={(e) =>
                  setFormData({ ...formData, warrantyPeriod: e.target.value })
                }
                placeholder="12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Min Stock Threshold</Label>
              <Input
                id="threshold"
                type="number"
                value={formData.minStockThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minStockThreshold: e.target.value,
                  })
                }
                placeholder="5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Product description..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              {product?.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-32 h-32 object-cover rounded mb-2"
                />
              )}
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setImageFile(file);
                }}
              />
              {imageFile && (
                <p className="text-sm text-gray-500">New: {imageFile.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Common Specs</Label>
              <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                {/* Category Specs (from category definition) */}
                {categorySpecs.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Category Specs
                    </p>
                    {categorySpecs.map((spec) => (
                      <div key={spec.id} className="space-y-1">
                        <Label className="text-sm font-medium text-slate-700">
                          {spec.specName}
                          {spec.isRequired && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        {spec.options && spec.options.length > 0 ? (
                          <Select
                            value={specValues[spec.specKey] || ""}
                            onValueChange={(value) =>
                              handleSpecValueChange(spec.specKey, value)
                            }
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue
                                placeholder={`Select ${spec.specName}`}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {spec.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={specValues[spec.specKey] || ""}
                            onChange={(e) =>
                              handleSpecValueChange(
                                spec.specKey,
                                e.target.value,
                              )
                            }
                            placeholder={`Enter ${spec.specName}`}
                            type={
                              spec.dataType === "NUMBER" ? "number" : "text"
                            }
                            className="bg-white"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom/Existing Specs (not in category definition) */}
                {customSpecs.length > 0 && (
                  <div className="space-y-3">
                    {categorySpecs.length > 0 && (
                      <hr className="border-slate-200" />
                    )}
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Custom Specs
                    </p>
                    {customSpecs.map((spec) => (
                      <div key={spec.key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-slate-700 capitalize">
                            {spec.name}
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteSpec(spec.key)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Input
                          value={specValues[spec.key] || ""}
                          onChange={(e) =>
                            handleSpecValueChange(spec.key, e.target.value)
                          }
                          placeholder={`Enter ${spec.name}`}
                          className="bg-white"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Custom Spec */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Add New Spec
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      placeholder="Spec key (e.g., color)"
                      className="bg-white"
                    />
                    <Input
                      value={newSpecName}
                      onChange={(e) => setNewSpecName(e.target.value)}
                      placeholder="Display name (optional)"
                      className="bg-white"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleAddCustomSpec}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Spec
                  </Button>
                </div>

                {/* Show message if no specs at all */}
                {categorySpecs.length === 0 && customSpecs.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-2">
                    {formData.categoryId
                      ? "No specs defined. Add custom specs below."
                      : "Select a category or add custom specs below."}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/menu/items")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
