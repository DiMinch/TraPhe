import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  MapPin,
  Loader2,
  Home,
  Briefcase,
  Pencil,
  User,
  Phone,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/services/user.service";
import type { UserAddress } from "@/types/user.types";
import AddressDialog from "@/components/common/address/AddressDialog";

export default function AddressTab() {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    null,
  );

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

  const handleAddNew = () => {
    setSelectedAddress(null);
    setIsDialogOpen(true);
  };

  const handleEditAddress = (addr: UserAddress) => {
    setSelectedAddress(addr);
    setIsDialogOpen(true);
  };

  const getAddressIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("home") || lowerType.includes("nhà")) {
      return <Home className="w-5 h-5 text-[#5C3317]" />;
    } else if (lowerType.includes("office") || lowerType.includes("work") || lowerType.includes("việc")) {
      return <Briefcase className="w-5 h-5 text-gray-500 group-hover:text-[#5C3317] transition-colors" />;
    }
    return <Heart className="w-5 h-5 text-gray-500 group-hover:text-[#5C3317] transition-colors" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#2C1A0E] mb-2">Saved Addresses</h1>
          <p className="text-gray-600 text-sm">Manage your delivery locations for faster checkout.</p>
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-[#5C3317] hover:bg-[#2C1A0E] text-white rounded-full px-6 py-3 text-xs font-bold gap-2 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Address
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin w-8 h-8 text-gray-300" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[#E2DDD7] rounded-xl bg-gray-50">
          <MapPin className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No addresses found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => {
            const isDefault = addr.isPrimary;
            return (
              <div
                key={addr.id}
                className={`rounded-xl p-6 border relative overflow-hidden group transition-all duration-300 ${
                  isDefault
                    ? "bg-[#EFE5D3] border-[#D4C9BC] shadow-md"
                    : "bg-white border-[#E2DDD7] shadow-sm hover:border-[#D4C9BC]"
                }`}
              >
                {isDefault && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#F5EAD8] rounded-bl-full opacity-50 pointer-events-none transition-transform group-hover:scale-110"></div>
                )}
                
                <div className="flex items-start gap-4 relative z-10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border flex-shrink-0 transition-colors ${
                    isDefault 
                      ? "bg-white border-[#D4C9BC]" 
                      : "bg-gray-50 border-[#E2DDD7]"
                  }`}>
                    {getAddressIcon(addr.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-base font-bold text-[#2C1A0E]">
                        {addr.type}
                      </h3>
                      {isDefault && (
                        <Badge className="bg-[#F5EAD8] hover:bg-[#F5EAD8] text-[#5C3317] text-[10px] font-bold px-2 py-0.5 rounded border border-[#D4C9BC] shadow-none">
                          Default
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1 mb-3">
                      {addr.contactName && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span>{addr.contactName}</span>
                        </div>
                      )}
                      {addr.contactPhone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{addr.contactPhone}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 text-xs leading-relaxed mb-4">
                      {addr.detailAddress || addr.street}
                      {addr.communeName && <><br />{addr.communeName}</>}
                      {addr.provinceName && <><br />{addr.provinceName}</>}
                    </p>

                    <div className={`flex gap-4 pt-4 border-t ${
                      isDefault ? "border-[#D4C9BC]/50" : "border-gray-100"
                    }`}>
                      <button
                        onClick={() => handleEditAddress(addr)}
                        className="text-xs font-bold text-[#5C3317] hover:text-[#2C1A0E] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddressDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => fetchAddresses()}
        isFirstAddress={addresses.length === 0}
        addressToEdit={selectedAddress}
      />
    </div>
  );
}
