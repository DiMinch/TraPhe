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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import type { Product, ToppingOption } from "@/types/product.types";
import type { Category } from "@/types/category.types";
import { toast } from "sonner";
import { ArrowLeft, Image as ImageIcon, X, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/PageLayout";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

interface SizeFormData {
  sizeName: string;
  sellingPrice: number | "";
  displayOrder: number;
}

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    description: "",
    basePrice: "" as number | "",
    preparationTime: "" as number | "",
    isDrink: true,
    allowToppings: true,
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // F&B specific
  const [sizes, setSizes] = useState<SizeFormData[]>([]);
  const [availableToppings, setAvailableToppings] = useState<ToppingOption[]>([]);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchCategories();
      fetchToppings();
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  const fetchToppings = async () => {
    try {
      const response = await productService.getToppings();
      if (response.data) {
        const toppingsData = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.content || [];
        setAvailableToppings(toppingsData);
      }
    } catch (error: unknown) {
      console.error("Failed to load toppings:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductById(id!);
      if (response.data) {
        const prod = response.data;
        setProduct(prod);
        setFormData({
          name: prod.name || "",
          categoryId: prod.categoryId || "",
          description: prod.description || "",
          basePrice: prod.basePrice ?? "",
          preparationTime: prod.preparationTime ?? "",
          isDrink: prod.isDrink ?? true,
          allowToppings: prod.allowToppings ?? true,
        });

        // Parse sizes (which are provided in prod.variants usually due to the proxy in product.service.ts)
        if (prod.variants && prod.variants.length > 0) {
          // If variants are mapped as BASE-... skip
          if (prod.variants.length === 1 && prod.variants[0].sku?.startsWith('BASE-')) {
            setSizes([]);
          } else {
             const mappedSizes = prod.variants.map((v: any, index: number) => ({
                sizeName: v.variantName,
                sellingPrice: v.sellingPrice,
                displayOrder: index + 1
             }));
             setSizes(mappedSizes);
          }
        }

        // Selected toppings might need fetching from another endpoint if product detail returns it
        if ((prod as any).toppingIds) {
           setSelectedToppings((prod as any).toppingIds);
        }
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
    if (!formData.name || !formData.categoryId || formData.basePrice === "") {
      toast.error("Please fill in required fields (Name, Category, Base Price)");
      return;
    }

    // Validate sizes
    const invalidSize = sizes.find(s => !s.sizeName || s.sellingPrice === "");
    if (invalidSize) {
      toast.error("Please ensure all sizes have a name and a selling price.");
      return;
    }

    try {
      setLoading(true);
      const response = await productService.updateProduct(
        id!,
        {
          name: formData.name,
          categoryId: formData.categoryId,
          description: formData.description || undefined,
          basePrice: Number(formData.basePrice),
          preparationTime: formData.preparationTime ? Number(formData.preparationTime) : undefined,
          isDrink: formData.isDrink,
          allowToppings: formData.allowToppings,
          sizes: sizes.map((s, index) => ({
            sizeName: s.sizeName,
            sellingPrice: Number(s.sellingPrice),
            displayOrder: s.displayOrder || index + 1
          })),
          toppingIds: selectedToppings.length > 0 ? selectedToppings : undefined,
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

  const toggleTopping = (toppingId: string) => {
    setSelectedToppings(prev => 
      prev.includes(toppingId) ? prev.filter(t => t !== toppingId) : [...prev, toppingId]
    );
  };

  const addSize = () => {
    setSizes([...sizes, { sizeName: "", sellingPrice: "", displayOrder: sizes.length + 1 }]);
  };

  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const updateSize = (index: number, field: keyof SizeFormData, value: any) => {
    const newSizes = [...sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setSizes(newSizes);
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
        <h1 className="text-2xl font-semibold">Edit Menu Item</h1>
      </div>

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-6">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Product name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category <span className="text-red-500">*</span></Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice">Base Price (Ä‘) <span className="text-red-500">*</span></Label>
              <Input
                id="basePrice"
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value === "" ? "" : Number(e.target.value) })}
                placeholder="29000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prepTime">Preparation Time (minutes)</Label>
              <Input
                id="prepTime"
                type="number"
                value={formData.preparationTime}
                onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value === "" ? "" : Number(e.target.value) })}
                placeholder="5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product description..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                 onClick={() => document.getElementById("image")?.click()}>
              {product?.imageUrl && !imageFile && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-32 h-32 object-cover rounded mb-4"
                />
              )}
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
              {imageFile ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700">{imageFile.name}</p>
                  <p className="text-xs text-slate-500 mt-1">Click to change</p>
                </div>
              ) : (
                <div className="text-center">
                  {!product?.imageUrl && <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />}
                  <p className="text-sm font-medium text-slate-700">{product?.imageUrl ? "Click to change image" : "Click to upload image"}</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-6">
        <CardHeader>
          <CardTitle>Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Is Drink?</Label>
                <p className="text-xs text-slate-500">Determines if ice/sugar options apply.</p>
              </div>
              <Switch 
                checked={formData.isDrink} 
                onCheckedChange={(c) => setFormData({ ...formData, isDrink: c })} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Allow Toppings?</Label>
                <p className="text-xs text-slate-500">Can customers add extra toppings?</p>
              </div>
              <Switch 
                checked={formData.allowToppings} 
                onCheckedChange={(c) => setFormData({ ...formData, allowToppings: c })} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sizes (Optional)</CardTitle>
          <Button variant="outline" size="sm" onClick={addSize} className="h-8">
            <Plus className="w-4 h-4 mr-1" /> Add Size
          </Button>
        </CardHeader>
        <CardContent>
          {sizes.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Size Name</TableHead>
                    <TableHead>Price (Ä‘)</TableHead>
                    <TableHead className="w-[100px]">Order</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sizes.map((size, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input 
                          placeholder="e.g. Size M" 
                          value={size.sizeName}
                          onChange={(e) => updateSize(index, 'sizeName', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          placeholder="35000" 
                          value={size.sellingPrice}
                          onChange={(e) => updateSize(index, 'sellingPrice', e.target.value === "" ? "" : Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          value={size.displayOrder}
                          onChange={(e) => updateSize(index, 'displayOrder', Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeSize(index)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          <X className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50 border border-dashed rounded-lg text-slate-500 text-sm">
              No sizes added. The item will only use the base price.
            </div>
          )}
        </CardContent>
      </Card>

      {formData.allowToppings && availableToppings.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle>Available Toppings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {availableToppings.map(topping => (
                <div 
                  key={topping.id} 
                  className={`flex items-center space-x-3 border p-3 rounded-md cursor-pointer transition-colors ${selectedToppings.includes(topping.id) ? 'bg-roast/10 border-roast/20' : 'hover:bg-slate-50'}`}
                  onClick={() => toggleTopping(topping.id)}
                >
                  <Checkbox 
                    id={`topping-${topping.id}`} 
                    checked={selectedToppings.includes(topping.id)}
                    onCheckedChange={() => toggleTopping(topping.id)}
                  />
                  <div className="flex flex-col">
                    <Label htmlFor={`topping-${topping.id}`} className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {topping.name}
                    </Label>
                    <span className="text-xs text-slate-500 mt-1">+{topping.extraPrice?.toLocaleString()}Ä‘</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3 mb-10">
        <Button
          variant="outline"
          onClick={() => navigate("/admin/menu/items")}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          className="bg-roast hover:bg-roast/90 text-white shadow-md"
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Product"}
        </Button>
      </div>
    </PageContainer>
  );
}
