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
import { repairService } from "@/services/repair-service.service";
import type { RepairService } from "@/types/repair-service.types";

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
  const [isFetching, setIsFetching] = useState(false);
  const [services, setServices] = useState<RepairService[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [additionalCost, setAdditionalCost] = useState<number>(0);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      const fetchActiveServices = async () => {
        setIsFetching(true);
        try {
          const res = await repairService.getActiveServices();
          if (res.statusCode === 200 && res.data) {
            // Handle both direct array and paginated response
            const servicesData = Array.isArray(res.data)
              ? res.data
              : (res.data as any)?.content || [];
            setServices(servicesData);
          }
        } catch (error) {
          console.error("Failed to load services", error);
          toast.error("Could not load service list");
        } finally {
          setIsFetching(false);
        }
      };
      fetchActiveServices();
      setSelectedServiceId("");
      setAdditionalCost(0);
      setNote("");
    }
  }, [open]);

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      setAdditionalCost(service.standardPrice);
    }
  };

  const handleSubmit = async () => {
    if (!selectedServiceId) {
      toast.warning("Please select a service");
      return;
    }

    setIsLoading(true);
    try {
      await warrantyService.addService(ticketId, {
        services: [
          {
            repairServiceId: selectedServiceId,
            additionalCost: additionalCost,
            note: note,
          },
        ],
      });

      toast.success("Service added successfully");
      onSuccess();
      onOpenChange(false);
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
              onValueChange={handleServiceChange}
            >
              <SelectTrigger disabled={isFetching}>
                <SelectValue
                  placeholder={
                    isFetching ? "Loading services..." : "Choose a service..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Cost (VND)</Label>
            <Input
              type="number"
              value={additionalCost}
              onChange={(e) => setAdditionalCost(Number(e.target.value))}
              placeholder="Enter cost..."
            />
            <p className="text-xs text-gray-500">
              Default price loaded from system. You can adjust if needed.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Note (Optional)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="E.g. Discount applied, complex repair..."
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
