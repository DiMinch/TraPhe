import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Attribute {
  id: number;
  name: string;
  key: string;
  type: string;
  required: string;
  highlight: number;
  order: number;
}

interface NewAttributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (attribute: Omit<Attribute, "id">) => void;
}

export default function NewAttributeDialog({
  open,
  onOpenChange,
  onAdd,
}: NewAttributeDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    type: "Text",
    required: "No",
    highlight: 0,
    order: 0,
  });

  const handleSubmit = () => {
    onAdd(formData);
    setFormData({
      name: "",
      key: "",
      type: "Text",
      required: "No",
      highlight: 0,
      order: 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            New Attribute
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter attribute name"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Key *</Label>
              <Input
                value={formData.key}
                onChange={(e) =>
                  setFormData({ ...formData, key: e.target.value })
                }
                placeholder="Enter key"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Text">Text</SelectItem>
                  <SelectItem value="Number">Number</SelectItem>
                  <SelectItem value="Boolean">Boolean</SelectItem>
                  <SelectItem value="Date">Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Required *</Label>
              <Select
                value={formData.required}
                onValueChange={(value) =>
                  setFormData({ ...formData, required: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Highlight</Label>
              <Input
                type="number"
                value={formData.highlight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    highlight: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Display Order</Label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-indigo-900 hover:bg-indigo-800 text-white"
            onClick={handleSubmit}
          >
            Add Attribute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
