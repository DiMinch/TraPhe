import { useState, useEffect } from "react";
import { Star, PlusCircle, MinusCircle, Loader2, RotateCcw } from "lucide-react";
import type { UserInfo } from "@/types/user.types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axiosClient from "@/lib/axios-client";
import { promotionService } from "@/services/promotion.service";
import { format } from "date-fns";

interface LoyaltyTabProps {
  currentUser: UserInfo | null;
  onUpdateSuccess?: () => void;
}

interface RewardItem {
  id: string;
  name: string;
  points: number;
  description: string;
  image?: string;
  category: "drink" | "voucher" | "merchandise";
}

interface LoyaltyTransaction {
  id: string;
  type: string;        // EARN, REDEEM, REFUND
  points: number;
  description: string;
  orderId: string | null;
  orderNumber: string;
  createdAt: string;
}

export default function LoyaltyTab({ currentUser, onUpdateSuccess }: LoyaltyTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<"catalog" | "history">("catalog");
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch real loyalty transactions when history tab is active
  useEffect(() => {
    if (activeSubTab === "history" && transactions.length === 0) {
      const fetchTransactions = async () => {
        setIsLoadingHistory(true);
        try {
          const res = await axiosClient.get<any, any>("/loyalty/me/transactions");
          if (res.data) {
            setTransactions(res.data);
          }
        } catch (error) {
          console.error("Failed to fetch loyalty transactions", error);
        } finally {
          setIsLoadingHistory(false);
        }
      };
      fetchTransactions();
    }
  }, [activeSubTab]);

  const calculateProgress = () => {
    if (!currentUser?.loyaltyPoint) return 0;
    const { totalPoints, pointsToNextTier } = currentUser.loyaltyPoint;
    if (!pointsToNextTier || pointsToNextTier <= 0) return 100;
    const nextTierGoal = totalPoints + pointsToNextTier;
    if (nextTierGoal === 0) return 0;
    return Math.min(100, Math.max(0, (totalPoints / nextTierGoal) * 100));
  };

  const rewards: RewardItem[] = [
    { id: "rw-1", name: "Free Upsize", points: 200, description: "Upgrade any medium drink to large size for free.", category: "drink" },
    { id: "rw-2", name: "Free Topping", points: 150, description: "Add golden boba, cheese foam or jelly to your drink.", category: "drink" },
    { id: "rw-3", name: "20k Discount Voucher", points: 300, description: "Get 20,000₫ off on any order value.", category: "voucher" },
    { id: "rw-4", name: "50k Discount Voucher", points: 600, description: "Get 50,000₫ off on order from 100,000₫.", category: "voucher" },
    { id: "rw-5", name: "Free Signature Drink", points: 800, description: "Get one free cup of Egg Coffee or Phin Milk Coffee.", category: "drink" },
    { id: "rw-6", name: "TraPhe Ceramic Mug", points: 1500, description: "Limited edition luxury TraPhe handcrafted ceramic cup.", category: "merchandise" },
  ];

  const handleRedeemClick = (reward: RewardItem) => {
    const pointsAvailable = currentUser?.loyaltyPoint?.pointsAvailable || 0;
    if (pointsAvailable < reward.points) {
      toast.error(`Not enough points. You need ${reward.points - pointsAvailable} more points to redeem this reward.`);
      return;
    }
    setSelectedReward(reward);
  };

  const confirmRedeem = async () => {
    if (!selectedReward) return;
    setIsRedeeming(true);

    try {
      // Map reward to discount values for voucher creation
      const discountMap: Record<string, { value: number; type: string }> = {
        "rw-1": { value: 10000, type: "FIXED_AMOUNT" }, // Free Upsize (approx 10k)
        "rw-2": { value: 10000, type: "FIXED_AMOUNT" }, // Free Topping (approx 10k)
        "rw-3": { value: 20000, type: "FIXED_AMOUNT" },
        "rw-4": { value: 50000, type: "FIXED_AMOUNT" },
        "rw-5": { value: 45000, type: "FIXED_AMOUNT" }, // Signature Drink (approx 45k)
        "rw-6": { value: 150000, type: "FIXED_AMOUNT" }, // Mug (approx 150k)
      };
      const discount = discountMap[selectedReward.id];

      const res = await promotionService.redeemReward({
        rewardId: selectedReward.id,
        rewardName: selectedReward.name,
        pointsCost: selectedReward.points,
        rewardDescription: selectedReward.description,
        discountValue: discount?.value,
        discountType: discount?.type,
      });

      if (res.data) {
        toast.success(
          `Redeemed successfully! Your voucher code is: ${res.data.voucherCode}. Check My Vouchers tab.`,
          { duration: 8000 },
        );
        // Reset transactions so they re-fetch with the new REDEEM entry
        setTransactions([]);
      }
      setSelectedReward(null);
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "Failed to redeem reward.";
      toast.error(msg);
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-gray-200 pb-4">
        <h1 className="font-serif text-3xl font-semibold text-[#2C1A0E] mb-1">Loyalty &amp; Rewards</h1>
        <p className="text-gray-600 text-sm">Track your progress and redeem your coffee moments.</p>
      </header>

      {/* Bento Grid: Status & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Status Card */}
        <div className="bg-[#EFE5D3] rounded-xl p-6 flex flex-col justify-between relative overflow-hidden shadow-sm border border-[#D4C9BC]">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#C89A6E]/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex justify-between items-start z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#F5EAD8] text-[#5C3317] rounded-full border border-[#D4C9BC] text-xs font-bold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-[#5C3317]" />
              <span>{currentUser?.tier?.name || "Gold Member"}</span>
            </div>
          </div>
          <div className="mt-8 z-10">
            <p className="text-xs text-[#4A3F35] uppercase tracking-wider mb-1 font-semibold">Current Balance</p>
            <p className="font-serif text-4xl font-bold text-[#5C3317]">
              {currentUser?.loyaltyPoint?.pointsAvailable.toLocaleString() || 0}{" "}
              <span className="text-lg font-normal text-[#A0622A]">pts</span>
            </p>
          </div>
        </div>

        {/* Progress Card */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-[#E2DDD7] shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2C1A0E]">
                Next Tier: {currentUser?.tier?.name === "Gold" ? "Platinum" : "Gold"}
              </h2>
              <p className="text-gray-500 text-xs mt-1">Unlock exclusive reserve roasts and free delivery.</p>
            </div>
            <div className="text-right">
              <p className="font-serif text-lg font-bold text-[#A0622A]">
                {currentUser?.loyaltyPoint?.pointsToNextTier?.toLocaleString() || 0} pts
              </p>
              <p className="text-xs text-gray-500 font-semibold">needed</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden border border-[#E2DDD7]">
            <div 
              className="bg-[#A0622A] h-3 rounded-full transition-all duration-1000" 
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
            <span>{currentUser?.tier?.name || "Silver"}</span>
            <span>{currentUser?.tier?.name === "Gold" ? "Platinum" : "Gold"}</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab("catalog")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeSubTab === "catalog"
              ? "border-[#5C3317] text-[#5C3317]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Redeem Rewards
        </button>
        <button
          onClick={() => setActiveSubTab("history")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeSubTab === "history"
              ? "border-[#5C3317] text-[#5C3317]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Points History
        </button>
      </div>

      {/* Tab Contents */}
      {activeSubTab === "catalog" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => {
            const pointsAvailable = currentUser?.loyaltyPoint?.pointsAvailable || 0;
            const canAfford = pointsAvailable >= reward.points;
            return (
              <div
                key={reward.id}
                className="bg-white rounded-xl p-5 border border-[#E2DDD7] flex flex-col justify-between hover:shadow-md transition-shadow relative group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-[#A0622A] uppercase tracking-wider px-2 py-0.5 bg-[#F5EAD8] rounded-md">
                      {reward.category}
                    </span>
                    <span className="font-serif font-bold text-[#5C3317] flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[#A0622A] text-[#A0622A]" />
                      {reward.points}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#2C1A0E] mb-1">{reward.name}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-4">{reward.description}</p>
                </div>
                
                <button
                  onClick={() => handleRedeemClick(reward)}
                  className={`w-full py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    canAfford
                      ? "bg-[#5C3317] hover:bg-[#2C1A0E] text-white"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Redeem Reward
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        isLoadingHistory ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Star className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No loyalty transactions yet.</p>
            <p className="text-gray-400 text-xs mt-1">Points will appear here after your first order.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E2DDD7] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-[#E2DDD7]">
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD7]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {format(new Date(tx.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-[#2C1A0E]">
                      <div className="flex items-center gap-2">
                        {tx.type === "EARN" ? (
                          <PlusCircle className="w-4 h-4 text-green-600" />
                        ) : tx.type === "REFUND" ? (
                          <RotateCcw className="w-4 h-4 text-blue-600" />
                        ) : (
                          <MinusCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span>{tx.description || tx.type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-400 font-mono">{tx.orderNumber}</td>
                    <td className={`py-4 px-6 text-sm font-bold text-right ${
                      tx.points > 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {tx.points > 0 ? `+${tx.points}` : tx.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Confirm Redemption Dialog */}
      <Dialog open={selectedReward !== null} onOpenChange={(open) => !open && setSelectedReward(null)}>
        <DialogContent className="sm:max-w-md bg-white border border-[#E2DDD7]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-[#2C1A0E]">Confirm Reward Redemption</DialogTitle>
          </DialogHeader>
          {selectedReward && (
            <div className="py-4 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-[#FBF5EC] rounded-full flex items-center justify-center border border-[#D4C9BC]">
                <Star className="w-6 h-6 text-[#A0622A] fill-[#A0622A]" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-[#5C3317]">{selectedReward.name}</h4>
                <p className="text-gray-500 text-xs px-4 mt-1">{selectedReward.description}</p>
              </div>
              <div className="bg-[#EFE5D3] px-4 py-2 rounded-lg border border-[#D4C9BC]">
                <p className="text-xs text-[#4A3F35] font-semibold">Cost: {selectedReward.points} Loyalty Points</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Remaining Balance: {(currentUser?.loyaltyPoint?.pointsAvailable || 0) - selectedReward.points} pts</p>
              </div>
            </div>
          )}
          <DialogFooter className="flex sm:justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedReward(null)}
              className="rounded-full border border-gray-300 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmRedeem}
              disabled={isRedeeming}
              className="bg-[#5C3317] text-white hover:bg-[#2C1A0E] rounded-full px-6 cursor-pointer"
            >
              {isRedeeming && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
