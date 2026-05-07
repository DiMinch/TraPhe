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

// Giả lập danh sách dịch vụ (Thực tế bạn nên gọi API getAllServiceTypes)
const MOCK_SERVICES = [
  { id: "srv-001", name: "General Diagnosis", price: 100000 },
  { id: "srv-002", name: "Screen Replacement Service", price: 150000 },
  { id: "srv-003", name: "Battery Replacement Service", price: 100000 },
  { id: "srv-004", name: "Software Re-installation", price: 200000 },
  { id: "srv-005", name: "Motherboard Repair (Level 1)", price: 500000 },
];

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  onSuccess: () => void;
}

export default function AddServiceDialog({
  open,
  onOpenChange,
  ticketId,
  onSuccess,
}: AddServiceDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    if (!selectedServiceId) {
      toast.warning("Please select a service");
      return;
    }

    setIsLoading(true);
    try {
      await warrantyService.addService(ticketId, {
        repairServiceId: selectedServiceId,
        notes: notes,
      });
      toast.success("Service added successfully");
      onSuccess();
      onOpenChange(false);
      // Reset
      setSelectedServiceId("");
      setNotes("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add service");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Add Service Charge</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Select Service</Label>
            <Select
              value={selectedServiceId}
              onValueChange={setSelectedServiceId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a service..." />
              </SelectTrigger>
              <SelectContent>
                {MOCK_SERVICES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} - {s.price.toLocaleString()}₫
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g. Difficult repair, discount applied..."
            />
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
            Add Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
