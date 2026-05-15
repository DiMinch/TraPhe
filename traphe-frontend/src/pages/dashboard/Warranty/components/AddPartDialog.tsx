import { useState, useEffect } from "react";
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
import { partService } from "@/services/part.service";
import type { PartComponent } from "@/types/part.types";

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
  const [isFetching, setIsFetching] = useState(false);
  const [parts, setParts] = useState<PartComponent[]>([]);
  const [selectedPartId, setSelectedPartId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      const fetchParts = async () => {
        setIsFetching(true);
        try {
          const res = await partService.getActiveParts();
          if (res.statusCode === 200 && res.data) {
            // Handle both direct array and paginated response
            const partsData = Array.isArray(res.data)
              ? res.data
              : (res.data as any)?.content || [];
            setParts(partsData);
          }
        } catch (error) {
          console.error("Failed to load parts", error);
          toast.error("Could not load parts list");
        } finally {
          setIsFetching(false);
        }
      };
      fetchParts();
      setSelectedPartId("");
      setQuantity(1);
      setUnitPrice(0);
      setNotes("");
    }
  }, [open]);

  const handlePartChange = (partId: string) => {
    setSelectedPartId(partId);
    const selectedPart = parts.find((p) => p.id === partId);
    if (selectedPart) {
      setUnitPrice(selectedPart.sellingPrice);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPartId) {
      toast.warning("Please select a part");
      return;
    }
    if (quantity < 1) {
      toast.warning("Quantity must be at least 1");
      return;
    }
    if (unitPrice < 0) {
      toast.warning("Price cannot be negative");
      return;
    }

    setIsLoading(true);
    try {
      await warrantyService.addPart(ticketId, {
        parts: [
          {
            partComponentId: selectedPartId,
            quantity: quantity,
            unitPrice: unitPrice,
            notes: notes,
          },
        ],
      });

      toast.success("Part added successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add part");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Add Replacement Part</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Select Component</Label>
            <Select value={selectedPartId} onValueChange={handlePartChange}>
              <SelectTrigger disabled={isFetching}>
                <SelectValue
                  placeholder={
                    isFetching ? "Loading parts..." : "Search part..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {parts.map((p) => (
                  <SelectItem
                    key={p.id}
                    value={p.id}
                    disabled={p.currentStock <= 0}
                  >
                    <div className="flex justify-between w-full gap-4">
                      <span>{p.name}</span>
                      <span className="text-gray-500">
                        Stock: {p.currentStock}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label>Unit Price (VND)</Label>
              <Input
                type="number"
                min={0}
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for replacement..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-indigo-900 text-white cursor-pointer"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Part
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
