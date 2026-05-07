import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { warrantyService } from "@/services/warranty.service";

// Giả lập danh sách linh kiện (Thực tế gọi API getInventory/Parts)
const MOCK_PARTS = [
  { id: "part-001", name: "RAM 8GB DDR4", price: 850000, stock: 10 },
  { id: "part-002", name: "SSD 512GB NVMe", price: 1200000, stock: 5 },
  { id: "part-003", name: "Laptop Screen 15.6 FHD", price: 2500000, stock: 2 },
  { id: "part-004", name: "Thermal Paste", price: 50000, stock: 50 },
];

interface AddPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  onSuccess: () => void;
}

export default function AddPartDialog({
  open,
  onOpenChange,
  ticketId,
  onSuccess,
}: AddPartDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    if (!selectedPartId) {
      toast.warning("Please select a part");
      return;
    }
    if (quantity < 1) {
      toast.warning("Quantity must be at least 1");
      return;
    }

    setIsLoading(true);
    try {
      await warrantyService.addPart(ticketId, {
        partId: selectedPartId,
        quantity: quantity,
        notes: notes,
      });
      toast.success("Part added successfully");
      onSuccess();
      onOpenChange(false);
      // Reset
      setSelectedPartId("");
      setQuantity(1);
      setNotes("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add part");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Add Replacement Part</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Select Component</Label>
            <Select value={selectedPartId} onValueChange={setSelectedPartId}>
              <SelectTrigger>
                <SelectValue placeholder="Search part..." />
              </SelectTrigger>
              <SelectContent>
                {MOCK_PARTS.map((p) => (
                  <SelectItem key={p.id} value={p.id} disabled={p.stock <= 0}>
                    {p.name} - {p.price.toLocaleString()}₫ (Stock: {p.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1 space-y-2">
              <Label>Qty</Label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="col-span-3 space-y-2">
              <Label>Notes (Optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for replacement..."
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-indigo-900 text-white"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Part
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
