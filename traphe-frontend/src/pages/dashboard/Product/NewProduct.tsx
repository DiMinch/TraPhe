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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, X, Image as ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import type { Product, ToppingOption } from "@/types/product.types";
import type { Category } from "@/types/category.types";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

interface NewProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (product: Product) => void;
}

interface SizeFormData {
  sizeName: string;
  sellingPrice: number | "";
  displayOrder: number;
}

export default function NewProductDialog({
  open,
  onOpenChange,
  onAdd,
}: NewProductDialogProps) {
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
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // F&B specific
  const [sizes, setSizes] = useState<SizeFormData[]>([]);
  const [availableToppings, setAvailableToppings] = useState<ToppingOption[]>([]);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchToppings();
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setFormData({
      name: "",
      categoryId: "",
      description: "",
      basePrice: "",
      preparationTime: "",
      isDrink: true,
      allowToppings: true,
    });
    setImageFile(null);
    setSizes([]);
    setSelectedToppings([]);
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

  const handleCreateProduct = async () => {
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
      const response = await productService.createProduct(
        {
          name: formData.name,
          categoryId: formData.categoryId,
          description: formData.description || undefined,
          basePrice: Number(formData.basePrice),
          preparationTime: formData.preparationTime ? Number(formData.preparationTime) : undefined,
          isDrink: formData.isDrink,
          allowToppings: formData.allowToppings,
          sizes: sizes.map(s => ({
            sizeName: s.sizeName,
            sellingPrice: Number(s.sellingPrice),
            displayOrder: s.displayOrder
          })),
          toppingIds: selectedToppings.length > 0 ? selectedToppings : undefined,
        },
        imageFile || undefined,
      );

      if (response.data) {
        toast.success("Product created successfully!");
        onAdd(response.data);
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

  const toggleTopping = (id: string) => {
    setSelectedToppings(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[800px] max-h-[90vh] flex flex-col bg-white overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">New Menu Item</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-8">
            {/* Basic Info */}
            <section className="space-y-4">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    placeholder="e.g. CÃ  phÃª sá»¯a Ä‘Ã¡"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
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
                    placeholder="29000"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value === "" ? "" : Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prepTime">Preparation Time (minutes)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    placeholder="e.g. 5"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value === "" ? "" : Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the menu item..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Image</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                     onClick={() => document.getElementById("image")?.click()}>
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
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-700">Click to upload image</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Properties */}
            <section className="space-y-4">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Properties</h3>
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
            </section>

            {/* Sizes */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Sizes (Optional)</h3>
                <Button variant="outline" size="sm" onClick={addSize} className="h-8">
                  <Plus className="w-4 h-4 mr-1" /> Add Size
                </Button>
              </div>
              
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
            </section>

            {/* Toppings */}
            {formData.allowToppings && availableToppings.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Available Toppings</h3>
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
              </section>
            )}
            
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t bg-slate-50 mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateProduct} 
            disabled={loading}
            className="bg-roast hover:bg-roast/90 text-white"
          >
            {loading ? "Creating..." : "Create Menu Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
