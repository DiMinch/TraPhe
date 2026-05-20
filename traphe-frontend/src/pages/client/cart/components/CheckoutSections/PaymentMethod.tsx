import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Wallet, Truck, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentMethodType = "cod" | "vnpay" | "momo";

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
        <h3 className="font-bold text-lg text-gray-900">Phương Thức Thanh Toán</h3>
      </div>
      <RadioGroup
        value={paymentMethod}
        onValueChange={onChange}
        className="space-y-3"
      >
        {/* COD */}
        <div
          onClick={() => onChange("cod")}
          className={cn(
            "flex items-center justify-between border rounded-lg px-4 py-4 cursor-pointer transition-all hover:bg-gray-50",
            paymentMethod === "cod" ? "border-black bg-gray-50 ring-1 ring-black" : "border-gray-200",
          )}
        >
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="cod" id="cod" />
            <Label htmlFor="cod" className="cursor-pointer font-medium text-gray-900">
              Thanh toán khi nhận hàng (COD)
            </Label>
          </div>
          <Truck className="w-5 h-5 text-gray-400" />
        </div>

        {/* VNPAY */}
        <div
          onClick={() => onChange("vnpay")}
          className={cn(
            "flex items-center justify-between border rounded-lg px-4 py-4 cursor-pointer transition-all hover:bg-gray-50",
            paymentMethod === "vnpay" ? "border-red-500 bg-red-50/10 ring-1 ring-red-500" : "border-gray-200",
          )}
        >
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="vnpay" id="vnpay" />
            <Label htmlFor="vnpay" className="cursor-pointer font-medium text-gray-900 flex items-center gap-2">
              Thanh toán qua cổng <span className="font-bold text-red-600">VNPay</span>
            </Label>
          </div>
          <CreditCard className="w-5 h-5 text-red-500" />
        </div>

        {/* MOMO */}
        <div
          onClick={() => onChange("momo")}
          className={cn(
            "flex items-center justify-between border rounded-lg px-4 py-4 cursor-pointer transition-all hover:bg-gray-50",
            paymentMethod === "momo" ? "border-pink-500 bg-pink-50/10 ring-1 ring-pink-500" : "border-gray-200",
          )}
        >
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="momo" id="momo" />
            <Label htmlFor="momo" className="cursor-pointer font-medium text-gray-900 flex items-center gap-2">
              Thanh toán qua ví <span className="font-bold text-pink-600">MoMo</span>
            </Label>
          </div>
          <Wallet className="w-5 h-5 text-pink-500" />
        </div>
      </RadioGroup>
    </div>
  );
}
