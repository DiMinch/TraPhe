import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, Phone, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BranchHour {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  isActive: boolean;
  active?: boolean;
  hours?: BranchHour[];
}

interface BranchSelectProps {
  branches: Branch[];
  selectedBranchId: string | null;
  onSelectBranch: (id: string) => void;
  isLoading: boolean;
}

function getTodayHours(hours?: BranchHour[]): string {
  if (!hours || hours.length === 0) return "07:00 - 22:00";
  const today = new Date().getDay(); // 0=Sun
  const backendDay = today === 0 ? 7 : today;
  const todayHour = hours.find((h) => h.dayOfWeek === backendDay);
  if (!todayHour) return "07:00 - 22:00";
  if (todayHour.isClosed) return "Closed today";
  const open = todayHour.openTime?.slice(0, 5) || "07:00";
  const close = todayHour.closeTime?.slice(0, 5) || "22:00";
  return `${open} - ${close}`;
}

export default function BranchSelect({
  branches,
  selectedBranchId,
  onSelectBranch,
  isLoading,
}: BranchSelectProps) {
  return (
    <div className="bg-surface-container-lowest border border-admin-border rounded-xl p-6 shadow-sm font-ui-body">
      <div className="flex items-center justify-between mb-6 border-b border-mist pb-3">
        <div className="flex items-center gap-2 text-roast">
          <MapPin className="w-5 h-5 text-roast" />
          <h3 className="font-display-md text-display-md text-smoke">Select Pickup Branch</h3>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin w-8 h-8 text-roast" />
        </div>
      ) : branches.length === 0 ? (
        <p className="text-sm text-smoke text-center py-4">No active branches found.</p>
      ) : (
        <RadioGroup
          value={selectedBranchId || ""}
          onValueChange={onSelectBranch}
          className="space-y-4"
        >
          {branches.map((branch) => {
            const isSelected = selectedBranchId === branch.id;
            const hoursStr = getTodayHours(branch.hours);
            const isActive = branch.active !== false && branch.isActive !== false;

            return (
              <div
                key={branch.id}
                onClick={() => isActive && onSelectBranch(branch.id)}
                className={cn(
                  "relative flex items-start space-x-4 border rounded-xl p-5 transition-all duration-200",
                  !isActive
                    ? "border-gray-200 bg-gray-50/50 opacity-60 cursor-not-allowed"
                    : isSelected
                    ? "border-roast bg-surface-container-low shadow-md ring-1 ring-roast scale-[1.01] cursor-pointer"
                    : "border-admin-border hover:border-roast/50 hover:bg-foam/30 cursor-pointer",
                )}
              >
                <RadioGroupItem
                  value={branch.id}
                  id={branch.id}
                  disabled={!isActive}
                  className="mt-1 text-roast focus:ring-roast"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <Label
                      htmlFor={branch.id}
                      className={cn(
                        "font-ui-heading font-bold text-base block",
                        !isActive ? "text-gray-400 cursor-not-allowed" : "text-roast cursor-pointer"
                      )}
                    >
                      {branch.name}
                    </Label>
                    {!isActive ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-600 rounded">
                        Tạm đóng
                      </span>
                    ) : isSelected ? (
                      <span className="bg-roast text-white rounded-full p-0.5 self-start">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : null}
                  </div>
                  
                  <p className={cn("text-xs font-ui-body leading-relaxed", !isActive ? "text-gray-400" : "text-smoke")}>
                    {branch.address}
                  </p>
                  
                  {isActive && (
                    <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-dust font-ui-body">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{hoursStr}</span>
                      </span>
                      {branch.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{branch.phone}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </RadioGroup>
      )}
    </div>
  );
}
