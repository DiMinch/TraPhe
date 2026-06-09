import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Wallet, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

type PaymentMethodType = "cod" | "banking";

interface PaymentMethodProps {
  paymentMethod: PaymentMethodType;
  onChange: (value: PaymentMethodType) => void;
}

export default function PaymentMethod({
  paymentMethod,
  onChange,
}: PaymentMethodProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Wallet className="w-5 h-5 text-black" />
        <h3 className="font-bold text-lg text-gray-900">Payment Method</h3>
      </div>
      <RadioGroup
        value={paymentMethod}
        onValueChange={onChange}
        className="space-y-3"
      >
        <div
          className={cn(
            "flex items-center justify-between border rounded-lg px-4 py-4 cursor-pointer",
            paymentMethod === "cod" && "border-black bg-gray-50",
          )}
        >
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="cod" id="cod" />
            <Label htmlFor="cod" className="cursor-pointer font-medium">
              Cash on Delivery (COD)
            </Label>
          </div>
          <Truck className="w-5 h-5 text-gray-400" />
        </div>
        {/* Future: add banking option when available */}
      </RadioGroup>
    </div>
  );
}
