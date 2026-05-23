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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { categoryService } from "@/services/category.service";
import type {
  Category as ApiCategory,
  CategorySpec,
} from "@/types/category.types";
import { toast } from "sonner";

interface NewCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => void;
}

interface SpecFormData {
  specKey: string;
  specName: string;
  isRequired: boolean;
  dataType: string;
  options: string;
}

export default function NewCategoryDialog({
  open,
  onOpenChange,
  onAdd,
}: NewCategoryDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent: "none",
    status: "Active",
  });
  const [allCategories, setAllCategories] = useState<ApiCategory[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Specs management
  const [specs, setSpecs] = useState<CategorySpec[]>([]);
  const [isAddingSpec, setIsAddingSpec] = useState(false);
  const [editingSpecIndex, setEditingSpecIndex] = useState<number | null>(null);
  const [specFormData, setSpecFormData] = useState<SpecFormData>({
    specKey: "",
    specName: "",
    isRequired: false,
    dataType: "TEXT",
    options: "",
  });

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response.data) {
        // Handle both direct array and paginated response
        const categoriesData = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.content || [];
        setAllCategories(categoriesData);
      }
    } catch (error: unknown) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setSubmitting(true);
      const categoryData = {
        name: formData.name,
        description: formData.description,
        parentId: formData.parent === "none" ? undefined : formData.parent,
      };

      const response = await categoryService.createCategory(
        categoryData,
        imageFile || undefined,
      );

      // If specs were added, save them to the newly created category
      if (response.data?.id && specs.length > 0) {
        for (const spec of specs) {
          await categoryService.createSpec({
            categoryId: response.data.id,
            specKey: spec.specKey,
            specName: spec.specName,
            isRequired: spec.isRequired,
            dataType: spec.dataType,
            options: spec.options || undefined,
          });
        }
      }

      toast.success("Category created successfully");

      // Reset form
      setFormData({
        name: "",
        description: "",
        parent: "none",
        status: "Active",
      });
      setImageFile(null);
      setImagePreview("");
      setSpecs([]);
      setIsAddingSpec(false);
      setEditingSpecIndex(null);

      onAdd(); // Refresh the parent list
      onOpenChange(false);
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to create category";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSpec = () => {
    setSpecFormData({
      specKey: "",
      specName: "",
      isRequired: false,
      dataType: "TEXT",
      options: "",
    });
    setIsAddingSpec(true);
    setEditingSpecIndex(null);
  };

  const handleEditSpec = (index: number) => {
    const spec = specs[index];
    setSpecFormData({
      specKey: spec.specKey,
      specName: spec.specName,
      isRequired: spec.isRequired,
      dataType: spec.dataType,
      options: spec.options?.join(", ") || "",
    });
    setEditingSpecIndex(index);
    setIsAddingSpec(false);
  };

  const handleSaveSpec = () => {
    if (!specFormData.specKey.trim() || !specFormData.specName.trim()) {
      toast.error("Spec Key and Spec Name are required");
      return;
    }

    const newSpec: CategorySpec = {
      id:
        editingSpecIndex !== null
          ? specs[editingSpecIndex].id
          : `temp-${Date.now()}`,
      specKey: specFormData.specKey,
      specName: specFormData.specName,
      isRequired: specFormData.isRequired,
      dataType: specFormData.dataType,
      options:
        specFormData.dataType === "SELECT" && specFormData.options
          ? specFormData.options.split(",").map((opt) => opt.trim())
          : [],
    };

    if (editingSpecIndex !== null) {
      const updatedSpecs = [...specs];
      updatedSpecs[editingSpecIndex] = newSpec;
      setSpecs(updatedSpecs);
      toast.success("Spec updated");
    } else {
      setSpecs([...specs, newSpec]);
      toast.success("Spec added");
    }

    setIsAddingSpec(false);
    setEditingSpecIndex(null);
  };

  const handleDeleteSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
    toast.success("Spec removed");
  };

  const handleCancelSpec = () => {
    setIsAddingSpec(false);
    setEditingSpecIndex(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] max-h-[90vh] bg-white border shadow-lg">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold">
            New Category
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-150px)] py-4">
          {/* Category Information */}
          <div className="grid grid-cols-2 gap-4 pl-1">
            <div className="space-y-2 ">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter category name"
                className="bg-white"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent">Parent Category</Label>
              <Select
                value={formData.parent}
                onValueChange={(value) =>
                  setFormData({ ...formData, parent: value })
                }
              >
                <SelectTrigger className="bg-white w-full">
                  <SelectValue placeholder="Select parent (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="none">None (Root Category)</SelectItem>
                  {allCategories.map((cat) => (
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
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="bg-white w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-2 text-center bg-white">
                {imagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                      }}
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("image")?.click()}
                      type="button"
                    >
                      Choose File
                    </Button>
                    <span className="text-sm text-gray-500 ml-2">
                      No file chosen
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              className="h-[100px] bg-white resize-none"
              placeholder="Enter category description..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Specifications Section */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Specifications (Optional)
              </Label>
              {!isAddingSpec && editingSpecIndex === null && (
                <Button
                  onClick={handleAddSpec}
                  size="sm"
                  variant="outline"
                  className="text-roast border-roast/30 hover:bg-roast/10"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Spec
                </Button>
              )}
            </div>

            {/* Spec Add/Edit Form */}
            {(isAddingSpec || editingSpecIndex !== null) && (
              <div className="border-2 border-roast/20 rounded-lg p-3 bg-white shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-roast/90">
                    {editingSpecIndex !== null
                      ? "Edit Specification"
                      : "New Specification"}
                  </h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancelSpec}
                    className="h-7 w-7"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Spec Key *</Label>
                    <Input
                      value={specFormData.specKey}
                      onChange={(e) =>
                        setSpecFormData({
                          ...specFormData,
                          specKey: e.target.value,
                        })
                      }
                      placeholder="ram"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Spec Name *</Label>
                    <Input
                      value={specFormData.specName}
                      onChange={(e) =>
                        setSpecFormData({
                          ...specFormData,
                          specName: e.target.value,
                        })
                      }
                      placeholder="RAM Memory"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Data Type</Label>
                    <Select
                      value={specFormData.dataType}
                      onValueChange={(value) =>
                        setSpecFormData({ ...specFormData, dataType: value })
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TEXT">Text</SelectItem>
                        <SelectItem value="NUMBER">Number</SelectItem>
                        <SelectItem value="SELECT">Select (Options)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-5">
                    <Switch
                      checked={specFormData.isRequired}
                      onCheckedChange={(checked) =>
                        setSpecFormData({
                          ...specFormData,
                          isRequired: checked,
                        })
                      }
                    />
                    <Label className="text-xs">Required Field</Label>
                  </div>
                </div>

                {specFormData.dataType === "SELECT" && (
                  <div className="space-y-1">
                    <Label className="text-xs">Options (comma-separated)</Label>
                    <Input
                      value={specFormData.options}
                      onChange={(e) =>
                        setSpecFormData({
                          ...specFormData,
                          options: e.target.value,
                        })
                      }
                      placeholder="8GB, 16GB, 32GB"
                      className="h-8 text-sm"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelSpec}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveSpec}
                    className="bg-roast hover:bg-roast/90"
                  >
                    {editingSpecIndex !== null ? "Update" : "Add"}
                  </Button>
                </div>
              </div>
            )}

            {/* Specs List */}
            {specs.length > 0 && (
              <div className="border rounded-lg overflow-hidden bg-white">
                <Table>
                  <TableHeader className="bg-slate-100">
                    <TableRow>
                      <TableHead className="text-xs">Key</TableHead>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Required</TableHead>
                      <TableHead className="text-xs w-[80px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {specs.map((spec, index) => (
                      <TableRow key={spec.id}>
                        <TableCell className="text-xs">
                          <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                            {spec.specKey}
                          </code>
                        </TableCell>
                        <TableCell className="text-xs">
                          {spec.specName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {spec.dataType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {spec.isRequired ? (
                            <Badge className="bg-red-100 text-red-700 text-xs">
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              No
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleEditSpec(index)}
                              disabled={
                                isAddingSpec || editingSpecIndex !== null
                              }
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteSpec(index)}
                              disabled={
                                isAddingSpec || editingSpecIndex !== null
                              }
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-roast hover:bg-roast/80 text-white"
              onClick={handleAdd}
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Add"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
