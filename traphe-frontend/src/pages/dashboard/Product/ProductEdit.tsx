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
import type { Category } from "@/types/category.types";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/PageLayout";

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
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

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchCategories();
      fetchSuppliers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
        navigate("/product");
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
          onClick={() => navigate("/product")}
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
              <Label htmlFor="specs">Common Specs (JSON)</Label>
              <Textarea
                id="specs"
                value={formData.commonSpecs}
                onChange={(e) =>
                  setFormData({ ...formData, commonSpecs: e.target.value })
                }
                placeholder='{"color": "black", "ram": "8GB"}'
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/product")}
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
