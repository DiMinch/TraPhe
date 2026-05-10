import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, MapPin, Loader2, Home, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/services/user.service";
import type { UserAddress } from "@/types/user.types";
import AddressDialog from "@/components/common/address/AddressDialog";

export default function AddressTab() {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">My Addresses</h2>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-black hover:bg-gray-800 text-white font-medium gap-2 cursor-pointer"
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

      <AddressDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => fetchAddresses()}
        isFirstAddress={addresses.length === 0}
      />
    </div>
  );
}
