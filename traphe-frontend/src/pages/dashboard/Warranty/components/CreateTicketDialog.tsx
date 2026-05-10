import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { warrantyService } from "@/services/warranty.service";
import { customerService } from "@/services/customer.service";
import type { Customer } from "@/types/customer.types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateTicketDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateTicketDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const [openCombobox, setOpenCombobox] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [formData, setFormData] = useState({
    serialNumber: "",
    customerId: "",
    customerName: "",
    customerPhone: "",
    problemDescription: "",
    accessories: "",
    technicianId: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      const fetchCustomers = async () => {
        try {
          const res = await customerService.getCustomers();
          if (res.statusCode === 200 && res.data) {
            // Handle both direct array and paginated response
            const customersData = Array.isArray(res.data)
              ? res.data
              : (res.data as any)?.content || [];
            setCustomers(customersData);
          }
        } catch (error) {
          console.error("Failed to load customers", error);
        }
      };
      fetchCustomers();
    }
  }, [open]);

  const handleSelectCustomer = (custId: string) => {
    const selected = customers.find((c) => c.id === custId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        customerId: selected.id,
        customerName: selected.fullName,
        customerPhone: selected.phone,
      }));
      setOpenCombobox(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.serialNumber ||
      !formData.customerName ||
      !formData.customerPhone
    ) {
      toast.warning("Please fill in required fields (*)");
      return;
    }

    setIsLoading(true);
    try {
      await warrantyService.createTicket({
        ...formData,
        expectedReturnDate: date
          ? date.toISOString()
          : new Date().toISOString(),
        technicianId: formData.technicianId || undefined,
        customerId: formData.customerId || undefined,
      });
      toast.success("Warranty ticket created successfully");
      onSuccess();
      onOpenChange(false);
      setFormData({
        serialNumber: "",
        customerId: "",
        customerName: "",
        customerPhone: "",
        problemDescription: "",
        accessories: "",
        technicianId: "",
        notes: "",
      });
      setDate(undefined);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create ticket");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[700px] bg-white max-h-[90vh] flex flex-col p-0 gap-0">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle>Create New Warranty Ticket</DialogTitle>
          </DialogHeader>
        </div>
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-500 uppercase border-b pb-2">
                Customer Info
              </h4>
              <div className="space-y-2 flex flex-col">
                <Label>Select Existing Customer</Label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between font-normal"
                    >
                      {formData.customerId
                        ? customers.find((c) => c.id === formData.customerId)
                            ?.fullName || "Select customer..."
                        : "Select customer..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[300px] p-0 bg-white"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Search customer name or phone..." />
                      <div
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                      >
                        <CommandList>
                          <CommandEmpty>No customer found.</CommandEmpty>
                          <CommandGroup>
                            {customers.map((c) => (
                              <CommandItem
                                key={c.id}
                                value={c.fullName + " " + c.phone}
                                onSelect={() => handleSelectCustomer(c.id)}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.customerId === c.id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{c.fullName}</span>
                                  <span className="text-xs text-gray-500">
                                    {c.phone}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </div>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  placeholder="Or type manually..."
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  placeholder="0909 xxx xxx"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-500 uppercase border-b pb-2">
                Product & Assignment
              </h4>

              <div className="space-y-2">
                <Label>Serial Number / IMEI *</Label>
                <Input
                  value={formData.serialNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, serialNumber: e.target.value })
                  }
                  placeholder="Scan or enter SN"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Assign Technician{" "}
                  <span className="text-xs text-gray-400 font-normal">
                    (Coming Soon)
                  </span>
                </Label>
                <Select
                  value={formData.technicianId}
                  onValueChange={(val) =>
                    setFormData({ ...formData, technicianId: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech-001">
                      John Technician (Demo)
                    </SelectItem>
                    <SelectItem value="tech-002">Jane Expert (Demo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Expected Return Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="col-span-2 space-y-4 mt-2">
              <h4 className="font-medium text-sm text-gray-500 uppercase border-b pb-2">
                Issue Details
              </h4>
              <div className="space-y-2">
                <Label>Problem Description</Label>
                <Textarea
                  value={formData.problemDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      problemDescription: e.target.value,
                    })
                  }
                  placeholder="Describe the issue..."
                />
              </div>
              <div className="space-y-2">
                <Label>Accessories Received</Label>
                <Input
                  value={formData.accessories}
                  onChange={(e) =>
                    setFormData({ ...formData, accessories: e.target.value })
                  }
                  placeholder="Charger, Mouse, Bag..."
                />
              </div>
              <div className="space-y-2">
                <Label>Internal Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Notes for technician..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-2 border-t border-gray-100">
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
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Ticket
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
