import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Wallet, Truck, CreditCard, Store } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentMethodType = "cod" | "vnpay" | "momo";

interface PaymentMethodProps {
  paymentMethod: PaymentMethodType;
  onChange: (value: PaymentMethodType) => void;
  shippingMethod?: "pickup" | "delivery";
}

export default function PaymentMethod({
  paymentMethod,
  onChange,
  shippingMethod,
}: PaymentMethodProps) {
  return (
    <div className="bg-surface-container-lowest border border-admin-border rounded-xl p-6 shadow-sm font-ui-body">
      <div className="flex items-center gap-2 mb-6 border-b border-mist pb-3 text-roast">
        <Wallet className="w-5 h-5" />
        <h3 className="font-display-md text-display-md text-smoke">Payment Method</h3>
      </div>
      <RadioGroup
        value={paymentMethod}
        onValueChange={onChange}
        className="space-y-3"
      >
        {/* COD / Pay at Counter */}
        <div
          onClick={() => onChange("cod")}
          className={cn(
            "flex items-center justify-between border rounded-lg px-4 py-4 cursor-pointer transition-all",
            paymentMethod === "cod"
              ? "border-roast bg-surface-container-low shadow-sm ring-1 ring-roast"
              : "border-admin-border hover:border-roast/50",
          )}
        >
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="cod" id="cod" className="text-roast focus:ring-roast" />
            <Label htmlFor="cod" className="cursor-pointer font-ui-heading font-medium text-sm text-roast">
              {shippingMethod === "pickup" ? "Thanh toán tại quầy" : "Thanh toán khi nhận hàng (COD)"}
            </Label>
          </div>
          {shippingMethod === "pickup" ? (
            <Store className="w-5 h-5 text-smoke" />
          ) : (
            <Truck className="w-5 h-5 text-smoke" />
          )}
        </div>

        {/* VNPAY */}
        <div
          onClick={() => onChange("vnpay")}
          className={cn(
            "flex items-center justify-between border rounded-lg px-4 py-4 cursor-pointer transition-all",
            paymentMethod === "vnpay"
              ? "border-roast bg-surface-container-low shadow-sm ring-1 ring-roast"
              : "border-admin-border hover:border-roast/50",
          )}
        >
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="vnpay" id="vnpay" className="text-roast focus:ring-roast" />
            <Label htmlFor="vnpay" className="cursor-pointer font-ui-heading font-medium text-sm text-roast flex items-center gap-2">
              Thanh toán qua cổng <span className="font-bold text-red-600">VNPay</span>
            </Label>
          </div>
          <CreditCard className="w-5 h-5 text-red-500" />
        </div>

        {/* MOMO */}
        <div
          onClick={() => onChange("momo")}
          className={cn(
            "flex items-center justify-between border rounded-lg px-4 py-4 cursor-pointer transition-all",
            paymentMethod === "momo"
              ? "border-roast bg-surface-container-low shadow-sm ring-1 ring-roast"
              : "border-admin-border hover:border-roast/50",
          )}
        >
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="momo" id="momo" className="text-roast focus:ring-roast" />
            <Label htmlFor="momo" className="cursor-pointer font-ui-heading font-medium text-sm text-roast flex items-center gap-2">
              Thanh toán qua ví <span className="font-bold text-pink-600">MoMo</span>
            </Label>
          </div>
          <Wallet className="w-5 h-5 text-pink-500" />
        </div>
      </RadioGroup>
    </div>
  );
}

