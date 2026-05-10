import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import {
  supplierService,
  type SupplierResponse,
} from "@/services/supplier.service";
import type { Product } from "@/types/product.types";
import type { Category } from "@/types/category.types";
import { toast } from "sonner";

interface NewProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (product: Product) => void;
}

export default function NewProductDialog({
  open,
  onOpenChange,
  onAdd,
}: NewProductDialogProps) {
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

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchSuppliers();
    }
  }, [open]);

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

  const handleAdd = async () => {
    if (!formData.name || !formData.categoryId || !formData.supplierId) {
      toast.error("Please fill in required fields");
      return;
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
          commonSpecs: formData.commonSpecs || undefined,
        },
        imageFile || undefined,
      );

      if (response.data) {
        onAdd(response.data);
        toast.success("Product created successfully");
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
        onOpenChange(false);
      }
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to create product";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[70vw] max-h-[90vh] flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            New Product
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
                  setFormData({ ...formData, warrantyPeriod: e.target.value })
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

          <div className="grid grid-cols-2 gap-4 ">
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
                    onClick={() => document.getElementById("image")?.click()}
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
              <Label htmlFor="spec">Common Specs (JSON)</Label>
              <Textarea
                id="spec"
                className="h-[132px] bg-white font-mono text-sm resize-none"
                placeholder={`{
  "Screen_Size": "1920x1080",
  "Battery": "60Wh"
}`}
                value={formData.commonSpecs}
                onChange={(e) =>
                  setFormData({ ...formData, commonSpecs: e.target.value })
                }
              />
            </div>
          </div>

          {/*  */}
          <Card className="bg-white">
            <CardContent className="">
              <div className="flex items-center justify-between ">
                <h3 className="font-semibold">Variant List</h3>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Display Order</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Spec</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>MB-M1-GR-256</TableCell>
                    <TableCell>1155464853</TableCell>
                    <TableCell>
                      <pre className="text-xs font-mono">
                        {`{
  "RAM":
  "8GB"
}`}
                      </pre>
                    </TableCell>
                    <TableCell>$ 1000</TableCell>
                    <TableCell>$ 3000</TableCell>
                    <TableCell>5</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-gray-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  className="text-indigo-900 hover:underline"
                >
                  Click here to add more variants +
                </Button>
              </div>

              {/* Pagination */}
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="bg-indigo-900 hover:bg-indigo-800 text-white"
              onClick={handleAdd}
              disabled={loading}
            >
              {loading ? "Creating..." : "Add"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
