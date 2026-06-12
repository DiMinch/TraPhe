import { useState, useEffect } from "react";
import { Coffee, AlertCircle, Loader2, Copy, Check, Gift, Star } from "lucide-react";
import { promotionService, type PromotionResponse, type MyVoucherResponse } from "@/services/promotion.service";
import { format } from "date-fns";
import { toast } from "sonner";

interface VouchersTabProps {
  currentUser?: any;
}

export default function VouchersTab({}: VouchersTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<"promotions" | "my-vouchers">("promotions");
  const [availableVouchers, setAvailableVouchers] = useState<PromotionResponse[]>([]);
  const [myVouchers, setMyVouchers] = useState<MyVoucherResponse[]>([]);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(true);
  const [isLoadingMyVouchers, setIsLoadingMyVouchers] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch public promotions on mount
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await promotionService.getActivePromotions();
        if (res.statusCode === 200 && res.data) {
          setAvailableVouchers(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch promotions", error);
      } finally {
        setIsLoadingPromotions(false);
      }
    };
    fetchPromotions();
  }, []);

  // Fetch personal vouchers when "My Vouchers" tab is activated
  useEffect(() => {
    if (activeSubTab === "my-vouchers" && myVouchers.length === 0 && !isLoadingMyVouchers) {
      const fetchMyVouchers = async () => {
        setIsLoadingMyVouchers(true);
        try {
          const res = await promotionService.getMyVouchers();
          if (res.data) {
            setMyVouchers(res.data);
          }
        } catch (error) {
          console.error("Failed to fetch my vouchers", error);
        } finally {
          setIsLoadingMyVouchers(false);
        }
      };
      fetchMyVouchers();
    }
  }, [activeSubTab]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied code: ${code}`);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const formatDiscountVal = (voucher: { discountType: string; discountValue: number }) => {
    if (voucher.discountType === "PERCENTAGE") {
      return `${voucher.discountValue}%`;
    }
    const valInK = voucher.discountValue / 1000;
    return `${valInK}k`;
  };

  const getSourceLabel = (source: string | null) => {
    switch (source) {
      case "LOYALTY_REDEEM": return "Loyalty";
      case "ADMIN_BATCH": return "Promotion";
      case "EVENT": return "Event";
      default: return "Gift";
    }
  };

  const isLoading = activeSubTab === "promotions" ? isLoadingPromotions : isLoadingMyVouchers;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-gray-200 pb-4">
        <h1 className="font-serif text-3xl font-semibold text-[#2C1A0E] mb-1">Promotions & Vouchers</h1>
        <p className="text-gray-600 text-sm">Browse active promotions and manage your personal voucher wallet.</p>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab("promotions")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "promotions"
              ? "border-[#5C3317] text-[#5C3317]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Coffee className="w-4 h-4" />
          Promotions ({availableVouchers.length})
        </button>
        <button
          onClick={() => setActiveSubTab("my-vouchers")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "my-vouchers"
              ? "border-[#5C3317] text-[#5C3317]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Gift className="w-4 h-4" />
          My Vouchers ({myVouchers.length})
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : activeSubTab === "promotions" ? (
        /* ==================== PUBLIC PROMOTIONS ==================== */
        availableVouchers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <AlertCircle className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No active promotions at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {availableVouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="rounded-xl shadow-sm border border-[#E2DDD7] overflow-hidden flex flex-col md:flex-row relative group hover:shadow-md transition-all duration-300"
              >
                {/* Ticket Edge Effect Left */}
                <div className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r border-[#E2DDD7] z-10"></div>

                {/* Left Side Ticket Banner */}
                <div className="md:w-1/4 p-6 flex flex-col justify-center items-center text-center relative text-white bg-[#5C3317]">
                  <Coffee className="w-8 h-8 mb-2 opacity-90" />
                  <div className="font-serif text-3xl font-bold leading-none mb-1">
                    {formatDiscountVal(voucher)}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    {voucher.discountType === "PERCENTAGE" ? "Off Order" : "Discount"}
                  </div>
                  <div className="absolute right-0 top-4 bottom-4 border-r-2 border-dashed border-white/20 hidden md:block"></div>
                </div>

                {/* Right Side */}
                <div className="md:w-3/4 p-6 flex flex-col justify-between bg-white relative">
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l border-[#E2DDD7] z-10"></div>
                  <div>
                    <div className="flex justify-between items-start mb-2 gap-4">
                      <h3 className="font-serif text-lg font-bold text-[#2C1A0E]">{voucher.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider bg-green-50 text-green-700 border-green-200">
                        Active
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mb-6">
                      {voucher.description || `Use code ${voucher.code} to claim discount at checkout.`}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mt-auto pt-4 border-t border-dashed border-gray-100">
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Promo Code</div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#2C1A0E] tracking-widest bg-gray-50 border border-gray-200 px-3 py-1 rounded">
                          {voucher.code}
                        </span>
                        <button
                          onClick={() => handleCopy(voucher.code)}
                          className="p-1.5 rounded hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                          title="Copy Promo Code"
                        >
                          {copiedCode === voucher.code ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Expires on</div>
                      <div className="text-xs font-semibold text-[#5C3317]">
                        {format(new Date(voucher.endDate), "dd MMM yyyy")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* ==================== MY VOUCHERS (Personal) ==================== */
        myVouchers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Gift className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">You don't have any personal vouchers yet.</p>
            <p className="text-gray-400 text-xs mt-1">Redeem loyalty points or check out events to earn vouchers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {myVouchers.map((voucher) => {
              const isAvailable = voucher.status === "AVAILABLE";
              const isUsed = voucher.status === "USED";
              const isExpired = voucher.status === "EXPIRED";
              return (
                <div
                  key={voucher.id}
                  className={`rounded-xl shadow-sm border border-[#E2DDD7] overflow-hidden flex flex-col md:flex-row relative group hover:shadow-md transition-all duration-300 ${
                    !isAvailable ? "opacity-70" : ""
                  }`}
                >
                  <div className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r border-[#E2DDD7] z-10"></div>
                  <div className={`md:w-1/4 p-6 flex flex-col justify-center items-center text-center relative text-white ${
                    isAvailable ? "bg-[#5C3317]" : isUsed ? "bg-gray-400" : "bg-gray-300"
                  }`}>
                    <Star className="w-8 h-8 mb-2 opacity-90" />
                    <div className="font-serif text-3xl font-bold leading-none mb-1">
                      {formatDiscountVal(voucher)}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                      {voucher.discountType === "PERCENTAGE" ? "Off Order" : "Discount"}
                    </div>
                    {voucher.source && (
                      <div className="mt-2 text-[9px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                        {getSourceLabel(voucher.source)}
                      </div>
                    )}
                    <div className="absolute right-0 top-4 bottom-4 border-r-2 border-dashed border-white/20 hidden md:block"></div>
                  </div>

                  <div className="md:w-3/4 p-6 flex flex-col justify-between bg-white relative">
                    <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l border-[#E2DDD7] z-10"></div>
                    <div>
                      <div className="flex justify-between items-start mb-2 gap-4">
                        <h3 className="font-serif text-lg font-bold text-[#2C1A0E]">{voucher.name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          isAvailable
                            ? "bg-green-50 text-green-700 border-green-200"
                            : isUsed
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {voucher.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mb-6">
                        {voucher.description || `Use code ${voucher.code} at checkout.`}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mt-auto pt-4 border-t border-dashed border-gray-100">
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Your Voucher Code</div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-[#2C1A0E] tracking-widest bg-gray-50 border border-gray-200 px-3 py-1 rounded">
                            {voucher.code}
                          </span>
                          {isAvailable && (
                            <button
                              onClick={() => handleCopy(voucher.code)}
                              className="p-1.5 rounded hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                              title="Copy Voucher Code"
                            >
                              {copiedCode === voucher.code ? (
                                <Check className="w-3.5 h-3.5 text-green-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                          {isExpired ? "Expired on" : isUsed ? "Used on" : "Expires on"}
                        </div>
                        <div className="text-xs font-semibold text-[#5C3317]">
                          {isUsed && voucher.usedAt
                            ? format(new Date(voucher.usedAt), "dd MMM yyyy")
                            : format(new Date(voucher.endDate), "dd MMM yyyy")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
