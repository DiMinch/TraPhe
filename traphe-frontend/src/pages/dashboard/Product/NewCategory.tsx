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
import { useState } from "react";

interface Category {
  id: number;
  name: string;
  description: string;
  parent: string;
  productCount: number;
  status: "Active" | "Inactive";
  image?: string;
}

interface NewCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (category: Category) => void;
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

  const handleAdd = () => {
    const newCategory: Category = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      parent: formData.parent === "none" ? "" : formData.parent,
      productCount: 0,
      status: formData.status as "Active" | "Inactive",
    };
    onAdd(newCategory);
    setFormData({
      name: "",
      description: "",
      parent: "none",
      status: "Active",
    });
    onOpenChange(false);
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
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
                  setFormData({
                    ...formData,
                    parent: value === "none" ? "" : value,
                  })
                }
              >
                <SelectTrigger className="bg-white w-full">
                  <SelectValue placeholder="Select parent (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="Laptop">Laptop</SelectItem>
                  <SelectItem value="Mouse">Mouse</SelectItem>
                  <SelectItem value="Keyboard">Keyboard</SelectItem>
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
              <div className="border-2 border-dashed border-gray-300 rounded-md p-2 text-center bg-white flex items-center justify-center">
                <Button variant="outline" size="sm">
                  Choose File
                </Button>
                <span className="text-sm text-gray-500 ml-2">
                  No file chosen
                </span>
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-900 hover:bg-indigo-800 text-white"
              onClick={handleAdd}
            >
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
