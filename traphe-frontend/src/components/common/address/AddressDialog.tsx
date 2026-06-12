import { useState, useEffect } from "react";
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
import { Loader2, User, Phone } from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import type { Province, Commune, UserAddress } from "@/types/user.types";

export interface SearchableSelectProps<T> {
  value: string;
  onChange: (value: string) => void;
  options: T[];
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;
  placeholder: string;
  disabled?: boolean;
}

export function SearchableSelect<T>({
  value,
  onChange,
  options,
  getOptionValue,
  getOptionLabel,
  placeholder,
  disabled = false,
}: SearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedOption = options.find((opt) => getOptionValue(opt) === value);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm(selectedOption ? getOptionLabel(selectedOption) : "");
    }
  }, [isOpen, selectedOption, options]);

  const cleanVietnameseName = (name: string): string => {
    if (!name) return "";
    let cleaned = name.trim();
    const prefixes = [
      /^(tỉnh|thành phố|thành\s*phố)\s+/i,
      /^(phường|xã|thị trấn|thị\s*trấn)\s+/i
    ];
    for (const regex of prefixes) {
      cleaned = cleaned.replace(regex, "");
    }
    return cleaned
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");
  };

  const filteredOptions = options.filter((option) => {
    if (!searchTerm) return true;
    const cleanedLabel = cleanVietnameseName(getOptionLabel(option));
    const cleanedSearch = cleanVietnameseName(searchTerm);
    return cleanedLabel.includes(cleanedSearch);
  });

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          className="w-full flex h-10 w-full rounded-md border border-[#E2DDD7] bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5C3317] disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
        />
        {searchTerm && (
          <button
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            onClick={() => {
              setSearchTerm("");
              onChange("");
              setIsOpen(true);
            }}
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && !disabled && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-[#E2DDD7] bg-white text-stone-900 shadow-lg outline-none">
            <div className="p-1">
              {filteredOptions.length === 0 ? (
                <div className="relative flex w-full select-none items-center rounded-sm py-1.5 px-2 text-sm text-gray-400">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const val = getOptionValue(option);
                  const label = getOptionLabel(option);
                  const isSelected = val === value;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        onChange(val);
                        setSearchTerm(label);
                        setIsOpen(false);
                      }}
                      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors hover:bg-[#F5EAD8] hover:text-[#5C3317] ${
                        isSelected ? "bg-[#EFE5D3] text-[#5C3317] font-semibold" : ""
                      }`}
                    >
                      {label}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

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
      const selectedProvince = provinces.find((p) => String(p.code) === formData.provinceCode);
      const selectedCommune = communes.find((c) => String(c.code) === formData.communeCode);

      const payload = {
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        street: formData.street,
        provinceCode: formData.provinceCode,
        provinceName: selectedProvince?.name || "",
        communeCode: formData.communeCode,
        communeName: selectedCommune?.name || "",
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
            <SearchableSelect
              value={formData.provinceCode}
              onChange={(val) =>
                setFormData({ ...formData, provinceCode: val, communeCode: "" })
              }
              options={provinces}
              getOptionValue={(p) => String(p.code)}
              getOptionLabel={(p) => p.name}
              placeholder="Search Province / City"
            />
          </div>

          <div className="space-y-2">
            <Label>Commune / Ward *</Label>
            <SearchableSelect
              value={formData.communeCode}
              onChange={(val) =>
                setFormData({ ...formData, communeCode: val })
              }
              options={communes}
              getOptionValue={(c) => String(c.code)}
              getOptionLabel={(c) => c.name}
              placeholder={isLoadingCommunes ? "Loading..." : "Search Commune / Ward"}
              disabled={!formData.provinceCode || isLoadingCommunes}
            />
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

          <div 
            onClick={() => setFormData({ ...formData, isPrimary: !formData.isPrimary })}
            className="flex items-center space-x-2.5 pt-2 cursor-pointer select-none"
          >
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
              formData.isPrimary 
                ? "bg-[#5C3317] border-[#5C3317] text-white shadow-sm" 
                : "border-[#E2DDD7] bg-white hover:border-[#5C3317]"
            }`}>
              {formData.isPrimary && (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </div>
            <span className="text-sm text-gray-700 font-medium">
              Set as default address
            </span>
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
