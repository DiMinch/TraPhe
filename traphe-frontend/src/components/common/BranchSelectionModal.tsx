import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Search, Navigation, Check, Loader2, Sparkles } from "lucide-react";
import axiosClient from "@/lib/axios-client";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { useNavigate } from "react-router";

interface BranchSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BranchSelectionModal({ isOpen, onClose }: BranchSelectionModalProps) {
  const {
    shippingMethod,
    setShippingMethod,
    selectedBranchId,
    setSelectedBranchId,
    branches,
    deliveryAddress,
    setDeliveryAddress,
    setIsBranchConfirmed,
    setShippingFee,
  } = useCart();

  const [activeTab, setActiveTab] = useState<"pickup" | "delivery">(shippingMethod);
  const [localBranchId, setLocalBranchId] = useState<string | null>(selectedBranchId);
  const [addressInput, setAddressInput] = useState<string>(deliveryAddress || "");
  const [isCalculating, setIsCalculating] = useState(false);
  const [nearestBranchData, setNearestBranchData] = useState<{
    branch: any;
    distanceKm: number;
    shippingFee: number;
  } | null>(null);

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  const user = authService.getCurrentUser();
  const isLoggedIn = !!user;
  const navigate = useNavigate();

  // Load saved addresses when modal opens
  useEffect(() => {
    const loadSavedAddresses = async () => {
      if (!isLoggedIn || !isOpen) return;
      setIsLoadingAddresses(true);
      try {
        const res = await userService.getAddresses();
        if (res.statusCode === 200 && res.data) {
          setSavedAddresses(res.data);
          
          // Pre-fill address input if no delivery address is currently set in cart
          if (!deliveryAddress) {
            const primary = res.data.find((a: any) => a.isPrimary);
            if (primary) {
              const fullAddr = `${primary.street}, ${primary.communeName}, ${primary.provinceName}`;
              setAddressInput(fullAddr);
            } else if (res.data.length > 0) {
              const first = res.data[0];
              const fullAddr = `${first.street}, ${first.communeName}, ${first.provinceName}`;
              setAddressInput(fullAddr);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load saved addresses in modal", err);
      } finally {
        setIsLoadingAddresses(false);
      }
    };
    loadSavedAddresses();
  }, [isOpen, isLoggedIn, deliveryAddress]);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(shippingMethod);
      setLocalBranchId(selectedBranchId);
      if (deliveryAddress) {
        setAddressInput(deliveryAddress);
      }
      setNearestBranchData(null);
    }
  }, [isOpen, shippingMethod, selectedBranchId, deliveryAddress]);

  const handleCalculateNearest = async (addressToUse?: string) => {
    const addr = typeof addressToUse === "string" ? addressToUse : addressInput;
    if (!addr.trim()) {
      toast.error("Vui lòng nhập địa chỉ giao hàng");
      return;
    }

    setIsCalculating(true);
    try {
      // Mock latitude and longitude based on simple city detection
      let lat = 10.7769; // HCMC Default
      let lng = 106.7009;

      const addrLower = addr.toLowerCase();
      if (addrLower.includes("hà nội") || addrLower.includes("ha noi")) {
        lat = 21.0285;
        lng = 105.8542;
      } else if (addrLower.includes("đà nẵng") || addrLower.includes("da nang")) {
        lat = 16.0544;
        lng = 108.2022;
      }

      const res = await axiosClient.get(`/branches/nearest`, {
        params: { lat, lng },
      });

      if (res.data) {
        setNearestBranchData({
          branch: res.data.branch,
          distanceKm: res.data.distanceKm,
          shippingFee: res.data.shippingFee,
        });
        setLocalBranchId(res.data.branch.id);
        toast.success(`Đã tìm thấy chi nhánh gần nhất: ${res.data.branch.name}`);
        return res.data;
      }
      return null;
    } catch (error) {
      console.error("Error calculating nearest branch", error);
      toast.error("Không thể xác định chi nhánh giao hàng. Vui lòng thử lại.");
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  const handleConfirm = async () => {
    if (activeTab === "pickup") {
      if (!localBranchId) {
        toast.error("Vui lòng chọn một chi nhánh");
        return;
      }
      setSelectedBranchId(localBranchId);
      setShippingMethod("pickup");
      setDeliveryAddress(null);
      setShippingFee(0);
      setIsBranchConfirmed(true);
      toast.success("Đã xác nhận chi nhánh lấy hàng");
      onClose();
    } else {
      if (!addressInput.trim()) {
        toast.error("Vui lòng nhập địa chỉ giao hàng");
        return;
      }
      
      let finalBranchId = localBranchId;
      let finalNearestData = nearestBranchData;

      if (!finalBranchId || (!finalNearestData && addressInput !== deliveryAddress)) {
        // Auto-calculate nearest branch if not calculated yet
        const calculated = await handleCalculateNearest(addressInput);
        if (!calculated) return; // Error handled inside calculate
        
        finalBranchId = calculated.branch.id;
        finalNearestData = calculated;
      }

      setSelectedBranchId(finalBranchId);
      setShippingMethod("delivery");
      setDeliveryAddress(addressInput);
      if (finalNearestData) {
        setShippingFee(finalNearestData.shippingFee);
      }
      setIsBranchConfirmed(true);
      toast.success("Đã xác nhận địa chỉ giao hàng");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white border-[#EFE5D3] max-w-lg p-0 overflow-hidden rounded-2xl shadow-2xl">
        {/* Header decoration */}
        <div className="h-2 bg-gradient-to-r from-[#A0622A] via-[#5C3317] to-[#2C1A0E]" />

        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-serif text-2xl font-bold text-[#2C1A0E] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#A0622A]" />
              Chọn Phương Thức Nhận Hàng
            </DialogTitle>
            <DialogDescription className="font-sans text-[#5C4A3C] text-sm">
              Để TraPhe phục vụ bạn tốt nhất, vui lòng chọn phương thức nhận đồ uống.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as "pickup" | "delivery")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-[#F5EAD8] p-1.5 rounded-xl mb-6 h-auto w-full">
              <TabsTrigger
                value="pickup"
                className="h-auto py-2.5 rounded-lg font-sans font-semibold text-sm transition-all data-[state=active]:bg-[#5C3317] data-[state=active]:text-white data-[state=active]:shadow-md cursor-pointer hover:bg-[#5C3317]/10 data-[state=active]:hover:bg-[#5C3317]"
              >
                <Navigation className="w-4 h-4 mr-2 inline-block" />
                Tự đến lấy
              </TabsTrigger>
              <TabsTrigger
                value="delivery"
                className="h-auto py-2.5 rounded-lg font-sans font-semibold text-sm transition-all data-[state=active]:bg-[#5C3317] data-[state=active]:text-white data-[state=active]:shadow-md cursor-pointer hover:bg-[#5C3317]/10 data-[state=active]:hover:bg-[#5C3317]"
              >
                <MapPin className="w-4 h-4 mr-2 inline-block" />
                Giao tận nơi
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pickup" className="space-y-4 focus-visible:outline-none">
              <div className="space-y-2">
                <Label htmlFor="branch-select" className="text-xs font-bold uppercase tracking-wider text-[#2C1A0E]">
                  Chọn chi nhánh cửa hàng
                </Label>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                  {branches.length === 0 ? (
                    <div className="text-center py-6 text-sm text-[#8C7B6E] italic">
                      Đang tải danh sách chi nhánh...
                    </div>
                  ) : (
                    branches.map((branch) => {
                      const isSelected = localBranchId === branch.id;
                      const isActive = branch.isActive !== false && !branch.name.toLowerCase().includes("đóng cửa");
                      return (
                        <button
                          key={branch.id}
                          type="button"
                          disabled={!isActive}
                          onClick={() => isActive && setLocalBranchId(branch.id)}
                          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all relative ${
                            !isActive
                              ? "border-gray-200 bg-gray-50/50 opacity-60 cursor-not-allowed"
                              : isSelected
                              ? "border-[#5C3317] bg-[#5C3317]/5 shadow-sm cursor-pointer"
                              : "border-[#D4C9BC] hover:border-[#A0622A] hover:bg-[#F5EAD8]/30 cursor-pointer"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                              !isActive ? "border-gray-300 bg-gray-100" : isSelected ? "border-[#5C3317] bg-[#5C3317]" : "border-[#D4C9BC]"
                            }`}
                          >
                            {isSelected && isActive && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className={`font-sans font-bold text-sm ${!isActive ? "text-gray-400" : "text-[#2C1A0E]"}`}>
                                {branch.name}
                              </h4>
                              {!isActive && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-600 rounded">
                                  Tạm đóng
                                </span>
                              )}
                            </div>
                            <p className={`font-sans text-xs mt-1 ${!isActive ? "text-gray-400" : "text-[#5C4A3C]"}`}>
                              {branch.address}
                            </p>
                            {branch.phone && isActive && (
                              <p className="font-sans text-[#8C7B6E] text-[11px] mt-0.5">
                                Hotline: {branch.phone}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="delivery" className="space-y-4 focus-visible:outline-none">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-[#2C1A0E]">
                      Địa chỉ nhận hàng
                    </Label>
                    {isLoggedIn && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate("/account?tab=address");
                        }}
                        className="text-xs text-[#A0622A] hover:text-[#5C3317] font-semibold flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-none p-0"
                      >
                        + Quản lý địa chỉ
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="address"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder="Số nhà, tên đường, quận/huyện, thành phố..."
                      className="border-[#D4C9BC] focus:border-[#5C3317] focus:ring-[#5C3317] bg-white rounded-xl placeholder-[#8C7B6E]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCalculateNearest();
                        }
                      }}
                    />
                    <Button
                      onClick={() => handleCalculateNearest()}
                      disabled={isCalculating}
                      className="bg-[#5C3317] hover:bg-[#2C1A0E] text-white rounded-xl px-4 shrink-0 font-medium cursor-pointer"
                    >
                      {isCalculating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Saved addresses selector */}
                {isLoggedIn && savedAddresses.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7B6E]">
                      Địa chỉ đã lưu của bạn:
                    </span>
                    <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {savedAddresses.map((addr) => {
                        const fullAddr = `${addr.street}, ${addr.communeName}, ${addr.provinceName}`;
                        const isCurrentlySelected = addressInput === fullAddr;
                        return (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setAddressInput(fullAddr);
                              handleCalculateNearest(fullAddr);
                            }}
                            className={`flex items-start gap-2 p-2 rounded-xl border text-left text-xs transition-all relative ${
                              isCurrentlySelected
                                ? "border-[#5C3317] bg-[#5C3317]/5 text-[#5C3317] font-semibold"
                                : "border-stone-200 hover:border-[#A0622A] hover:bg-[#F5EAD8]/20 text-stone-700 bg-white"
                            }`}
                          >
                            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#A0622A]" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 font-semibold text-[#2C1A0E]">
                                <span>{addr.type === "Home" ? "Nhà riêng" : addr.type === "Work" ? "Văn phòng" : addr.type}</span>
                                {addr.isPrimary && (
                                  <span className="text-[9px] bg-[#A0622A]/10 text-[#A0622A] px-1 py-0.2 rounded font-sans">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                              <p className="truncate text-[#5C4A3C] mt-0.5 text-[11px]">{fullAddr}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {isLoggedIn && savedAddresses.length === 0 && !isLoadingAddresses && (
                  <div className="text-center py-3 border border-dashed border-[#D4C9BC] rounded-xl bg-[#FBF5EC]">
                    <p className="text-xs text-[#8C7B6E] mb-1">Bạn chưa lưu địa chỉ nào</p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate("/account?tab=address");
                      }}
                      className="text-xs text-[#A0622A] hover:text-[#5C3317] font-bold underline cursor-pointer bg-transparent border-none p-0"
                    >
                      + Thêm địa chỉ giao hàng mới
                    </button>
                  </div>
                )}

                {nearestBranchData && (
                  <div className="p-4 bg-[#F5EAD8]/40 border border-[#EFE5D3] rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#A0622A]">
                        Chi nhánh giao hàng
                      </span>
                      <span className="text-xs bg-[#5C3317]/10 text-[#5C3317] px-2 py-0.5 rounded-full font-bold">
                        {nearestBranchData.distanceKm} km
                      </span>
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-[#2C1A0E] text-sm">
                        {nearestBranchData.branch.name}
                      </h4>
                      <p className="font-sans text-[#5C4A3C] text-xs mt-0.5">
                        {nearestBranchData.branch.address}
                      </p>
                    </div>
                    <div className="pt-2.5 border-t border-[#EFE5D3] flex items-center justify-between">
                      <span className="text-xs font-sans text-[#5C4A3C]">Phí giao hàng:</span>
                      <span className="font-sans font-bold text-[#5C3317] text-base">
                        {nearestBranchData.shippingFee.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="bg-[#F5EAD8]/20 border-t border-[#EFE5D3] p-4 flex flex-row justify-between items-center gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-[#5C4A3C] hover:text-[#2C1A0E] hover:bg-[#F5EAD8]/40 font-medium rounded-xl cursor-pointer"
          >
            Để sau (Bỏ qua)
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-[#5C3317] hover:bg-[#2C1A0E] text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer"
          >
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
