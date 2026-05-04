import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, MapPin, Plus, Wallet, Truck, User } from "lucide-react";
import { cartItems } from "@/data/mockData";
import { cn } from "@/lib/utils";

const savedAddresses = [
  {
    id: "addr_1",
    name: "Nguyen Van A",
    phone: "0909 123 456",
    address: "123 Nguyen Van Linh, Tan Phong Ward, District 7, HCMC",
    type: "Home",
  },
  {
    id: "addr_2",
    name: "Office VITI",
    phone: "0912 999 888",
    address: "456 Le Duan, Ben Nghe Ward, District 1, HCMC",
    type: "Office",
  },
];

interface CheckoutStepProps {
  onNext: () => void;
}

export default function CheckoutStep({ onNext }: CheckoutStepProps) {
  const [selectedAddress, setSelectedAddress] = useState<string>(
    savedAddresses[0].id,
  );
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const discount = 1000000;
  const shippingFee = 0;
  const total = subtotal - discount + shippingFee;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12">
      <div className="lg:col-span-7 space-y-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-black" />
            <h3 className="font-bold text-lg text-gray-900">
              Shipping Address
            </h3>
          </div>

          <RadioGroup
            value={selectedAddress}
            onValueChange={setSelectedAddress}
            className="space-y-4"
          >
            {savedAddresses.map((addr) => {
              const isSelected = selectedAddress === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr.id)}
                  className={cn(
                    "relative flex items-start space-x-4 border rounded-lg p-4 cursor-pointer transition-all",
                    isSelected
                      ? "border-black bg-gray-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <RadioGroupItem
                    value={addr.id}
                    id={addr.id}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <Label
                        htmlFor={addr.id}
                        className="font-semibold text-base cursor-pointer"
                      >
                        {addr.name}
                        <span className="ml-2 text-xs font-normal text-gray-500 bg-white border px-2 py-0.5 rounded-full">
                          {addr.type}
                        </span>
                      </Label>
                      {isSelected && (
                        <span className="text-xs font-bold text-[#38CB89]">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{addr.phone}</p>
                    <p className="text-sm text-gray-600 mt-1">{addr.address}</p>
                  </div>
                </div>
              );
            })}

            <div
              onClick={() => setSelectedAddress("new")}
              className={cn(
                "relative flex items-center space-x-4 border rounded-lg p-4 cursor-pointer transition-all",
                selectedAddress === "new"
                  ? "border-black bg-gray-50"
                  : "border-gray-200 hover:border-gray-300 border-dashed",
              )}
            >
              <RadioGroupItem value="new" id="new_address" />
              <Label
                htmlFor="new_address"
                className="cursor-pointer font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add a new address
              </Label>
            </div>
          </RadioGroup>

          {selectedAddress === "new" && (
            <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
              <h4 className="font-medium text-sm text-gray-900 mb-4">
                New Address Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 uppercase">
                    Full Name
                  </Label>
                  <Input placeholder="Nguyen Van A" className="bg-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 uppercase">
                    Phone Number
                  </Label>
                  <Input placeholder="0909 xxx xxx" className="bg-white" />
                </div>
              </div>
              <div className="space-y-1.5 mb-4">
                <Label className="text-xs font-semibold text-gray-500 uppercase">
                  City / Province
                </Label>
                <Input placeholder="Ho Chi Minh City" className="bg-white" />
              </div>
              <div className="space-y-1.5 mb-4">
                <Label className="text-xs font-semibold text-gray-500 uppercase">
                  District & Ward
                </Label>
                <Input
                  placeholder="District 7, Tan Phong Ward"
                  className="bg-white"
                />
              </div>
              <div className="space-y-1.5 mb-4">
                <Label className="text-xs font-semibold text-gray-500 uppercase">
                  Street Address
                </Label>
                <Textarea
                  placeholder="123 Nguyen Van Linh..."
                  className="bg-white resize-none"
                  rows={2}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="save-addr" />
                <Label htmlFor="save-addr" className="text-sm text-gray-600">
                  Save this address for future use
                </Label>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Wallet className="w-5 h-5 text-black" />
            <h3 className="font-bold text-lg text-gray-900">Payment Method</h3>
          </div>

          <RadioGroup defaultValue="cod" className="space-y-3">
            <div className="flex items-center justify-between border rounded-lg px-4 py-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="cursor-pointer font-medium">
                  Cash on Delivery (COD)
                </Label>
              </div>
              <Truck className="w-5 h-5 text-gray-400" />
            </div>

            <div className="border rounded-lg px-4 py-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center justify-between mb-0">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="cursor-pointer font-medium">
                    Credit / Debit Card
                  </Label>
                </div>
                <CreditCard className="w-5 h-5 text-gray-400" />
              </div>

              <div className="hidden pl-7 pt-4 mt-2 border-t border-gray-100 text-sm text-gray-500">
                Secure payment gateway via Stripe/VNPay
              </div>
            </div>

            <div className="flex items-center justify-between border rounded-lg px-4 py-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="banking" id="banking" />
                <Label htmlFor="banking" className="cursor-pointer font-medium">
                  Internet Banking / QR Code
                </Label>
              </div>
              <div className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">
                VNPay
              </div>
            </div>
          </RadioGroup>
        </div>

        <Button
          onClick={onNext}
          className="w-full lg:hidden bg-black hover:bg-gray-800 text-white h-14 text-lg font-medium rounded-lg shadow-md"
        >
          Place Order ({total.toLocaleString("vi-VN")}₫)
        </Button>
      </div>

      <div className="lg:col-span-5">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 lg:p-8 sticky top-24">
          <h2 className="text-xl font-bold mb-6 text-gray-900">
            Order Summary
          </h2>

          <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 items-start py-2 border-b border-gray-200 last:border-0 border-dashed"
              >
                <div className="relative w-16 h-16 bg-white border border-gray-200 rounded-md flex items-center justify-center text-xs text-gray-400 shrink-0">
                  Img
                  <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Color: {item.color}
                  </p>
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Gift card or discount code"
              className="bg-white border-gray-300 focus-visible:ring-black"
            />
            <Button className="bg-gray-200 text-gray-900 hover:bg-gray-300 border border-gray-300 cursor-pointer">
              Apply
            </Button>
          </div>

          <Separator className="bg-gray-200 mb-6" />

          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">
                {subtotal.toLocaleString("vi-VN")}₫
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Shipping</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                Free
              </span>
            </div>
            <div className="flex justify-between text-[#38CB89]">
              <span>Discount (Coupon)</span>
              <span>- {discount.toLocaleString("vi-VN")}₫</span>
            </div>
          </div>

          <Separator className="bg-gray-200 mb-6" />

          <div className="flex justify-between items-end mb-8">
            <span className="text-base font-medium text-gray-900">Total</span>
            <div className="text-right">
              <span className="text-xs text-gray-500 block mb-1">
                Including VAT
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {total.toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>

          <Button
            onClick={onNext}
            className="w-full bg-black hover:bg-gray-800 text-white h-14 text-lg font-medium rounded-lg shadow-lg transition-transform active:scale-[0.99] cursor-pointer"
          >
            Place Order
          </Button>

          <div className="mt-4 flex justify-center items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Truck className="w-3 h-3" /> Free Shipping
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" /> Secure Checkout
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
