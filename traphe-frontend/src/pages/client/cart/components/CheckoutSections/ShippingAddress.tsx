import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  MapPin,
  Plus,
  User as UserIcon,
  Phone,
  Map,
  Mail,
} from "lucide-react"; // [1] Thêm Mail icon
import { cn } from "@/lib/utils";
import { userService } from "@/services/user.service";
import type { UserAddress, Province, Commune } from "@/types/user.types";

interface GuestInfo {
  name: string;
  phone: string;
  address: string;
  email: string;
}

interface ShippingAddressProps {
  isGuest: boolean;
  savedAddresses: UserAddress[];
  selectedAddressId: string;
  isLoadingAddresses: boolean;
  onSelectAddress: (id: string) => void;
  onAddAddress: () => void;
  guestInfo: GuestInfo;
  setGuestInfo: (info: GuestInfo) => void;
}

export default function ShippingAddress({
  isGuest,
  savedAddresses,
  selectedAddressId,
  isLoadingAddresses,
  onSelectAddress,
  onAddAddress,
  guestInfo,
  setGuestInfo,
}: ShippingAddressProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [isLoadingCommunes, setIsLoadingCommunes] = useState(false);

  const [provinceCode, setProvinceCode] = useState("");
  const [communeCode, setCommuneCode] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  const isUsingNewAddress = selectedAddressId === "new_address" || isGuest;

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await userService.getProvinces();
        if (res.statusCode === 200 && res.data) {
          setProvinces(res.data);
        }
      } catch (error) {
        console.error("Failed to load provinces", error);
      }
    };
    if (isUsingNewAddress) {
      fetchProvinces();
    }
  }, [isUsingNewAddress]);

  useEffect(() => {
    if (provinceCode) {
      const fetchCommunes = async () => {
        setIsLoadingCommunes(true);
        try {
          const res = await userService.getCommunes(provinceCode);
          if (res.statusCode === 200 && res.data) {
            setCommunes(res.data);
          }
        } catch (error) {
          console.error("Failed to load communes", error);
        } finally {
          setIsLoadingCommunes(false);
        }
      };
      fetchCommunes();
    } else {
      setCommunes([]);
    }
  }, [provinceCode]);

  useEffect(() => {
    if (isUsingNewAddress) {
      const provinceName =
        provinces.find((p) => p.code === provinceCode)?.name || "";
      const communeName =
        communes.find((c) => c.code === communeCode)?.name || "";

      if (detailAddress || provinceName || communeName) {
        const parts = [detailAddress, communeName, provinceName].filter(
          Boolean,
        );
        const fullAddress = parts.join(", ");

        if (guestInfo.address !== fullAddress) {
          setGuestInfo({ ...guestInfo, address: fullAddress });
        }
      }
    }
  }, [
    provinceCode,
    communeCode,
    detailAddress,
    isUsingNewAddress,
    provinces,
    communes,
  ]);

  const handleInfoChange = (field: keyof GuestInfo, value: string) => {
    setGuestInfo({ ...guestInfo, [field]: value });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-black" />
          <h3 className="font-bold text-lg text-gray-900">Shipping Address</h3>
        </div>
      </div>

      {isLoadingAddresses ? (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {!isGuest && (
            <RadioGroup
              value={selectedAddressId}
              onValueChange={onSelectAddress}
              className="space-y-3"
            >
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => onSelectAddress(addr.id)}
                  className={cn(
                    "relative flex items-start space-x-4 border rounded-lg p-4 cursor-pointer transition-all",
                    selectedAddressId === addr.id
                      ? "border-black bg-gray-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <RadioGroupItem
                    value={addr.id}
                    id={addr.id}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={addr.id}
                      className="font-semibold text-base cursor-pointer"
                    >
                      {addr.type} - {addr.contactName}
                      {addr.isPrimary && (
                        <span className="ml-2 text-xs font-normal text-gray-500 bg-white border px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </Label>
                    <p className="text-sm text-gray-600">{addr.contactPhone}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {addr.detailAddress}
                    </p>
                  </div>
                </div>
              ))}

              <div
                onClick={() => onSelectAddress("new_address")}
                className={cn(
                  "relative flex items-center space-x-4 border rounded-lg p-4 cursor-pointer transition-all",
                  selectedAddressId === "new_address"
                    ? "border-black bg-gray-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 border-dashed",
                )}
              >
                <RadioGroupItem value="new_address" id="new_address" />
                <Label
                  htmlFor="new_address"
                  className="cursor-pointer font-medium flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddAddress();
                  }}
                >
                  <Plus className="w-4 h-4" /> Ship to a different address
                </Label>
              </div>

              {/* <Button
                variant="ghost"
                onClick={onAddAddress}
                className="w-full text-sm text-gray-500 hover:text-black hover:bg-gray-100 mt-2 cursor-pointer justify-center"
              >
                <Plus className="w-3 h-3 mr-2" /> Add permanent address to profile
              </Button> */}
            </RadioGroup>
          )}

          {isGuest && (
            <div className="pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {!isGuest && (
                <div className="border-t border-gray-100 my-4"></div>
              )}
              <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                {isGuest ? "Guest Information" : "Recipient Details"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Full Name *</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Nguyen Van A"
                      className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                      value={guestInfo.name}
                      onChange={(e) => handleInfoChange("name", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">
                    Phone Number *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="0909 xxx xxx"
                      className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                      value={guestInfo.phone}
                      onChange={(e) =>
                        handleInfoChange("phone", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <Label className="text-xs text-gray-500">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="example@domain.com"
                    className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                    value={guestInfo.email}
                    onChange={(e) => handleInfoChange("email", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">
                    Province / City *
                  </Label>
                  <Select
                    value={provinceCode}
                    onValueChange={(val) => {
                      setProvinceCode(val);
                      setCommuneCode("");
                    }}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-200 focus:bg-white cursor-pointer">
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
                  <Label className="text-xs text-gray-500">
                    District / Commune *
                  </Label>
                  <Select
                    value={communeCode}
                    onValueChange={setCommuneCode}
                    disabled={!provinceCode || isLoadingCommunes}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-200 focus:bg-white cursor-pointer">
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
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-500">
                  Street Address *
                </Label>
                <div className="relative">
                  <Map className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="House number, Street name"
                    className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                  />
                </div>
              </div>

              {guestInfo.address && (
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 italic">
                  Preview: {guestInfo.address}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
