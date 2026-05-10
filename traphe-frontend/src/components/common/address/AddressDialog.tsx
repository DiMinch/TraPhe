import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Loader2, User, Phone } from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import type { Province, Commune, UserAddress } from "@/types/user.types";

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (savedAddress?: UserAddress) => void;
  isFirstAddress?: boolean;
  addressToEdit?: UserAddress | null;
}

export default function AddressDialog({
  open,
  onOpenChange,
  onSuccess,
  isFirstAddress = false,
  addressToEdit,
}: AddressDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [isLoadingCommunes, setIsLoadingCommunes] = useState(false);

  const [formData, setFormData] = useState({
    contactName: "",
    contactPhone: "",
    street: "",
    provinceCode: "",
    communeCode: "",
    postalCode: "",
    type: "Home",
    isPrimary: isFirstAddress,
  });

  useEffect(() => {
    if (open) {
      if (addressToEdit) {
        setFormData({
          contactName: addressToEdit.contactName || "",
          contactPhone: addressToEdit.contactPhone || "",
          street: addressToEdit.street || addressToEdit.detailAddress || "",
          provinceCode: addressToEdit.provinceCode || "",
          communeCode: addressToEdit.communeCode || "",
          postalCode: addressToEdit.postalCode || "",
          type: addressToEdit.type || "Home",
          isPrimary: addressToEdit.isPrimary || false,
        });
      } else {
        const currentUser = authService.getCurrentUser();

        setFormData({
          contactName: currentUser?.fullName || "",
          contactPhone: currentUser?.phone || "",
          street: "",
          provinceCode: "",
          communeCode: "",
          postalCode: "",
          type: "Home",
          isPrimary: isFirstAddress,
        });
        setCommunes([]);
      }
    }
  }, [open, addressToEdit, isFirstAddress]);

  useEffect(() => {
    if (open && provinces.length === 0) {
      const fetchProvinces = async () => {
        try {
          const res = await userService.getProvinces();
          if (res.statusCode === 200 && res.data) {
            const provincesData = Array.isArray(res.data)
              ? res.data
              : (res.data as any)?.content || [];
            setProvinces(provincesData);
          }
        } catch (error) {
          toast.error("Failed to load provinces");
        }
      };
      fetchProvinces();
    }
  }, [open]);

  useEffect(() => {
    if (formData.provinceCode) {
      const fetchCommunes = async () => {
        setIsLoadingCommunes(true);
        try {
          const res = await userService.getCommunes(formData.provinceCode);
          if (res.statusCode === 200 && res.data) {
            const communesData = Array.isArray(res.data)
              ? res.data
              : (res.data as any)?.content || [];
            setCommunes(communesData);
          }
        } catch (error) {
          console.error("Failed to load communes");
        } finally {
          setIsLoadingCommunes(false);
        }
      };
      fetchCommunes();
    } else {
      setCommunes([]);
    }
  }, [formData.provinceCode]);

  const handleSave = async () => {
    if (
      !formData.contactName ||
      !formData.contactPhone ||
      !formData.street ||
      !formData.provinceCode ||
      !formData.communeCode ||
      !formData.type
    ) {
      toast.warning("Please fill in all required fields (*)");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        street: formData.street,
        provinceCode: formData.provinceCode,
        communeCode: formData.communeCode,
        postalCode: formData.postalCode,
        type: formData.type,
        isPrimary: formData.isPrimary,
      };

      let res;
      if (addressToEdit) {
        res = await userService.updateAddress(addressToEdit.id, payload);
        if (res.statusCode === 200)
          toast.success("Address updated successfully");
      } else {
        res = await userService.addAddress(payload);
        if (res.statusCode === 200 || res.statusCode === 201)
          toast.success("Address added successfully");
      }

      if (res && (res.statusCode === 200 || res.statusCode === 201)) {
        onSuccess(res.data);
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save address");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {addressToEdit ? "Edit Address" : "Add New Address"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  className="pl-9"
                  value={formData.contactName}
                  onChange={(e) =>
                    setFormData({ ...formData, contactName: e.target.value })
                  }
                  placeholder="e.g. Nguyen Van A"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  className="pl-9"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPhone: e.target.value })
                  }
                  placeholder="e.g. 0912345678"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Address Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(val) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="Home">
                    Home
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="Work">
                    Work
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="Other">
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Postal Code</Label>
              <Input
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
                placeholder="e.g 700000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Province / City *</Label>
            <Select
              value={formData.provinceCode}
              onValueChange={(val) =>
                setFormData({ ...formData, provinceCode: val, communeCode: "" })
              }
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Select Province" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {provinces.map((p) => (
                  <SelectItem
                    className="cursor-pointer"
                    key={p.code}
                    value={p.code}
                  >
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Commune / Ward *</Label>
            <Select
              value={formData.communeCode}
              onValueChange={(val) =>
                setFormData({ ...formData, communeCode: val })
              }
              disabled={!formData.provinceCode || isLoadingCommunes}
            >
              <SelectTrigger className="cursor-pointer">
                {isLoadingCommunes ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SelectValue placeholder="Select Commune" />
                )}
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {communes.map((c) => (
                  <SelectItem
                    className="cursor-pointer"
                    key={c.code}
                    value={c.code}
                  >
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Street Address *</Label>
            <Input
              value={formData.street}
              onChange={(e) =>
                setFormData({ ...formData, street: e.target.value })
              }
              placeholder="e.g. 123 Nguyen Van Linh"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2 cursor-pointer">
            <Checkbox
              id="isPrimary"
              checked={formData.isPrimary}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isPrimary: checked as boolean })
              }
            />
            <Label
              htmlFor="isPrimary"
              className="text-sm font-normal cursor-pointer"
            >
              Set as default address
            </Label>
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
            onClick={handleSave}
            disabled={isSubmitting}
            className="bg-black text-white cursor-pointer"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {addressToEdit ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
