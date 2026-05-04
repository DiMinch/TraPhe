import { Button } from "@/components/ui/button";
import { userAddresses } from "@/data/mockData";
import { PencilLine, Plus } from "lucide-react";

export default function AddressTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Address</h2>
        <Button
          variant="ghost"
          className="text-black hover:bg-gray-100 font-medium gap-2"
        >
          <Plus className="w-4 h-4" /> Add New
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userAddresses.map((addr) => (
          <div
            key={addr.id}
            className="border border-gray-200 rounded-lg p-6 flex flex-col justify-between hover:border-black transition-colors bg-white"
          >
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-base">{addr.title}</h3>
                <a
                  href="#"
                  className="text-xs text-gray-400 hover:text-black flex items-center gap-1"
                >
                  <PencilLine className="w-3 h-3" /> Edit
                </a>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-black">{addr.name}</p>
                <p>{addr.phone}</p>
                <p>{addr.address}</p>
              </div>
            </div>
          </div>
        ))}
        <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 hover:text-black hover:border-gray-400 cursor-pointer transition-all min-h-[180px]">
          <Plus className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Add Address</span>
        </div>
      </div>
    </div>
  );
}
