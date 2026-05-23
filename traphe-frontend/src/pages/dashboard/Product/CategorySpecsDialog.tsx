import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { categoryService } from "@/services/category.service";
import type { CategorySpec } from "@/types/category.types";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface CategorySpecsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  categoryName: string;
}

interface SpecFormData {
  specKey: string;
  specName: string;
  isRequired: boolean;
  dataType: string;
  options: string;
}

export default function CategorySpecsDialog({
  open,
  onOpenChange,
  categoryId,
  categoryName,
}: CategorySpecsDialogProps) {
  const [specs, setSpecs] = useState<CategorySpec[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SpecFormData>({
    specKey: "",
    specName: "",
    isRequired: false,
    dataType: "TEXT",
    options: "",
  });

  useEffect(() => {
    if (open && categoryId) {
      fetchSpecs();
    }
  }, [open, categoryId]);

  const fetchSpecs = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getSpecs(categoryId);
      if (response.data) {
        setSpecs(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch specs:", error);
      toast.error("Failed to load specifications");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      specKey: "",
      specName: "",
      isRequired: false,
      dataType: "TEXT",
      options: "",
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    setFormData({
      specKey: "",
      specName: "",
      isRequired: false,
      dataType: "TEXT",
      options: "",
    });
    setIsAdding(true);
    setEditingId(null);
  };

  const handleEdit = (spec: CategorySpec) => {
    setEditingId(spec.id);
    setFormData({
      specKey: spec.specKey,
      specName: spec.specName,
      isRequired: spec.isRequired,
      dataType: spec.dataType,
      options: spec.options ? spec.options.join(", ") : "",
    });
  };

  const handleSave = async () => {
    if (!formData.specKey || !formData.specName) {
      toast.error("Please fill in Spec Key and Spec Name");
      return;
    }

    const requestData = {
      categoryId,
      specKey: formData.specKey,
      specName: formData.specName,
      isRequired: formData.isRequired,
      dataType: formData.dataType,
      options:
        formData.options && formData.dataType === "SELECT"
          ? formData.options.split(",").map((opt) => opt.trim())
          : undefined,
    };

    try {
      setLoading(true);
      if (editingId) {
        // Update existing spec
        await categoryService.updateSpec(editingId, requestData);
        toast.success("Specification updated successfully");
      } else {
        // Create new spec
        await categoryService.createSpec(requestData);
        toast.success("Specification added successfully");
      }
      fetchSpecs();
      resetForm();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save specification";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (specId: string) => {
    if (!confirm("Are you sure you want to delete this specification?")) {
      return;
    }

    try {
      setLoading(true);
      await categoryService.deleteSpec(specId);
      toast.success("Specification deleted successfully");
      fetchSpecs();
    } catch (error) {
      toast.error("Failed to delete specification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">
            Manage Specifications - {categoryName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Add/Edit Form */}
          {(isAdding || editingId) && (
            <div className="border-2 border-roast/20 rounded-lg p-4 bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-roast/90">
                  {editingId ? "Edit Specification" : "New Specification"}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetForm}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specKey">
                    Spec Key * (e.g., ram, storage)
                  </Label>
                  <Input
                    id="specKey"
                    value={formData.specKey}
                    onChange={(e) =>
                      setFormData({ ...formData, specKey: e.target.value })
                    }
                    placeholder="ram"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specName">Spec Name * (Display name)</Label>
                  <Input
                    id="specName"
                    value={formData.specName}
                    onChange={(e) =>
                      setFormData({ ...formData, specName: e.target.value })
                    }
                    placeholder="RAM Memory"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataType">Data Type</Label>
                  <Select
                    value={formData.dataType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, dataType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEXT">Text</SelectItem>
                      <SelectItem value="NUMBER">Number</SelectItem>
                      <SelectItem value="SELECT">Select (Options)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="isRequired"
                    checked={formData.isRequired}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isRequired: checked })
                    }
                  />
                  <Label htmlFor="isRequired">Required Field</Label>
                </div>
              </div>

              {formData.dataType === "SELECT" && (
                <div className="space-y-2">
                  <Label htmlFor="options">
                    Options (comma-separated, e.g., 8GB, 16GB, 32GB)
                  </Label>
                  <Input
                    id="options"
                    value={formData.options}
                    onChange={(e) =>
                      setFormData({ ...formData, options: e.target.value })
                    }
                    placeholder="8GB, 16GB, 32GB"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-roast hover:bg-roast/90"
                >
                  {loading ? "Saving..." : editingId ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          )}

          {/* Specs Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Specifications List</h3>
              {!isAdding && !editingId && (
                <Button
                  onClick={handleAdd}
                  size="sm"
                  className="bg-roast hover:bg-roast/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Spec
                </Button>
              )}
            </div>

            {loading && !isAdding && !editingId ? (
              <div className="text-center py-12 text-slate-500 bg-white rounded-lg border">
                Loading specifications...
              </div>
            ) : specs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-white rounded-lg border">
                No specifications defined yet. Click "Add Spec" to start.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-100">
                    <TableRow>
                      <TableHead>Spec Key</TableHead>
                      <TableHead>Spec Name</TableHead>
                      <TableHead>Data Type</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Options</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {specs.map((spec) => (
                      <TableRow key={spec.id}>
                        <TableCell>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {spec.specKey}
                          </code>
                        </TableCell>
                        <TableCell className="font-medium">
                          {spec.specName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{spec.dataType}</Badge>
                        </TableCell>
                        <TableCell>
                          {spec.isRequired ? (
                            <Badge className="bg-red-100 text-red-700">
                              Required
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Optional</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {spec.options && spec.options.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {spec.options.slice(0, 3).map((opt, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {opt}
                                </Badge>
                              ))}
                              {spec.options.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{spec.options.length - 3}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(spec)}
                              disabled={isAdding || editingId !== null}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(spec.id)}
                              disabled={isAdding || editingId !== null}
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
