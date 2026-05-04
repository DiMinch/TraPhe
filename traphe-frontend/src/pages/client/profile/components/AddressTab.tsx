import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Trash2, MapPin, Loader2, Home, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/services/user.service";
import type { UserAddress, Province, Commune } from "@/types/user";

export default function AddressTab() {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [isLoadingCommunes, setIsLoadingCommunes] = useState(false);

  const [formData, setFormData] = useState({
    street: "",
    provinceCode: "",
    communeCode: "",
    postalCode: "",
    type: "Home",
    isPrimary: false,
  });

  const fetchAddresses = async () => {
    try {
      const res = await userService.getAddresses();
      if (res.statusCode === 200 && res.data) {
        setAddresses(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch addresses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (isDialogOpen && provinces.length === 0) {
      const fetchProvinces = async () => {
        try {
          const res = await userService.getProvinces();
          if (res.statusCode === 200 && res.data) {
            setProvinces(res.data);
          }
        } catch (error) {
          toast.error("Failed to load provinces");
        }
      };
      fetchProvinces();
    }
  }, [isDialogOpen]);

  useEffect(() => {
    if (formData.provinceCode) {
      const fetchCommunes = async () => {
        setIsLoadingCommunes(true);
        try {
          const res = await userService.getCommunes(formData.provinceCode);
          if (res.statusCode === 200 && res.data) {
            setCommunes(res.data);
          }
        } catch (error) {
          toast.error("Failed to load communes");
        } finally {
          setIsLoadingCommunes(false);
        }
      };
      fetchCommunes();
    } else {
      setCommunes([]);
    }
  }, [formData.provinceCode]);

  const handleOpenDialog = () => {
    setFormData({
      street: "",
      provinceCode: "",
      communeCode: "",
      postalCode: "",
      type: "Home",
      isPrimary: addresses.length === 0,
    });
    setIsDialogOpen(true);
  };

  const handleAddAddress = async () => {
    if (
      !formData.street ||
      !formData.provinceCode ||
      !formData.communeCode ||
      !formData.type
    ) {
      toast.warning("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await userService.addAddress({
        street: formData.street,
        provinceCode: formData.provinceCode,
        communeCode: formData.communeCode,
        postalCode: formData.postalCode,
        type: formData.type,
        isPrimary: formData.isPrimary,
      });

      if (res.statusCode === 200 || res.statusCode === 201) {
        toast.success("Address added successfully");
        setIsDialogOpen(false);
        fetchAddresses();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;

    try {
      await userService.deleteAddress(id);
      toast.success("Address deleted");
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">My Addresses</h2>
        <Button
          onClick={handleOpenDialog}
          className="bg-black hover:bg-gray-800 text-white font-medium gap-2"
        >
          <Plus className="w-4 h-4" /> Add New
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-lg bg-gray-50">
          <MapPin className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No addresses found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="border border-gray-200 rounded-lg p-6 flex flex-col justify-between hover:border-black transition-colors bg-white shadow-sm relative group"
            >
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {addr.type === "Home" ? (
                      <Home className="w-4 h-4" />
                    ) : (
                      <Briefcase className="w-4 h-4" />
                    )}
                    <h3 className="font-bold text-base">{addr.type}</h3>
                    {addr.isPrimary && (
                      <Badge className="bg-green-600 hover:bg-green-600 text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1 mt-2">
                  <p className="font-medium text-black">{addr.detailAddress}</p>
                  {addr.postalCode && (
                    <p className="text-xs text-gray-400">
                      Postal: {addr.postalCode}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Có thể thêm Edit sau */}
                {/* <button className="text-sm text-gray-500 hover:text-black flex items-center gap-1">
                          <PencilLine className="w-3 h-3" /> Edit
                      </button> */}
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Address Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val) =>
                    setFormData({ ...formData, type: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Home">Home</SelectItem>
                    <SelectItem value="Work">Work</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
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
                  setFormData({
                    ...formData,
                    provinceCode: val,
                    communeCode: "",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Province" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {provinces.map((p) => (
                    <SelectItem key={p.code} value={p.code}>
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
                <SelectTrigger>
                  {isLoadingCommunes ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SelectValue placeholder="Select Commune" />
                  )}
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {communes.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
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

            <div className="flex items-center space-x-2 pt-2">
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddAddress}
              disabled={isSubmitting}
              className="bg-black text-white"
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Save Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
