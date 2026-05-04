import { useState } from "react";
import { Minus, Plus, X, Tag, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cartItems } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface ShoppingCartStepProps {
  onNext: () => void;
}

export default function ShoppingCartStep({ onNext }: ShoppingCartStepProps) {
  const [items, setItems] = useState(cartItems);
  const [shippingMethod, setShippingMethod] = useState("free");

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const shippingCost =
    shippingMethod === "express"
      ? 150000
      : shippingMethod === "pickup"
        ? 20000
        : 0;
  const total = subtotal + shippingCost;

  const updateQuantity = (id: number, delta: number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      }),
    );
  };

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12">
      <div className="lg:col-span-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 bg-gray-50 border-b border-gray-200 px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-6">Product</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-3 text-right">Subtotal</div>
          </div>

          <div className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                Your cart is empty
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 items-center px-6 py-6 hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="col-span-6 flex gap-4">
                    <div className="w-20 h-24 bg-gray-100 rounded-md border border-gray-200 shrink-0 flex items-center justify-center text-xs text-gray-400">
                      Img
                    </div>
                    <div className="flex flex-col justify-between py-0.5">
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1 group-hover:text-black transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Color: {item.color}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 md:hidden">
                          {item.price.toLocaleString("vi-VN")}₫
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex items-center text-xs font-medium text-gray-400 hover:text-red-600 transition-colors w-fit mt-2"
                      >
                        <X className="w-3 h-3 mr-1" /> Remove
                      </button>
                    </div>
                  </div>

                  <div className="col-span-3 flex justify-center">
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg h-9 shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-black rounded-l-lg transition-colors disabled:opacity-50 cursor-pointer"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-gray-900 select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-black rounded-r-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-3 text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:hidden mt-6">
          <div className="flex gap-2">
            <Input placeholder="Coupon code" className="bg-white" />
            <Button variant="outline" className="cursor-pointer">
              Apply
            </Button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 lg:p-8 sticky top-24">
          <h2 className="text-xl font-bold mb-6 text-gray-900">Cart Summary</h2>
          <div className="mb-6">
            <Label className="text-xs font-bold text-gray-500 uppercase mb-3 block">
              Shipping Method
            </Label>
            <RadioGroup
              value={shippingMethod}
              onValueChange={setShippingMethod}
              className="space-y-3"
            >
              <div
                className={cn(
                  "flex items-center justify-between bg-white border rounded-lg px-4 py-3 cursor-pointer transition-all",
                  shippingMethod === "free"
                    ? "border-black shadow-sm ring-1 ring-black"
                    : "border-gray-200 hover:border-gray-300",
                )}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="free" id="free" />
                  <Label
                    htmlFor="free"
                    className="cursor-pointer font-medium text-sm"
                  >
                    Free shipping
                  </Label>
                </div>
                <span className="text-sm font-medium">0₫</span>
              </div>
              <div
                className={cn(
                  "flex items-center justify-between bg-white border rounded-lg px-4 py-3 cursor-pointer transition-all",
                  shippingMethod === "express"
                    ? "border-black shadow-sm ring-1 ring-black"
                    : "border-gray-200 hover:border-gray-300",
                )}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="express" id="express" />
                  <div className="flex flex-col">
                    <Label
                      htmlFor="express"
                      className="cursor-pointer font-medium text-sm"
                    >
                      Express
                    </Label>
                    <span className="text-[10px] text-gray-500">1-2 days</span>
                  </div>
                </div>
                <span className="text-sm font-medium">150.000₫</span>
              </div>
              <div
                className={cn(
                  "flex items-center justify-between bg-white border rounded-lg px-4 py-3 cursor-pointer transition-all",
                  shippingMethod === "pickup"
                    ? "border-black shadow-sm ring-1 ring-black"
                    : "border-gray-200 hover:border-gray-300",
                )}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label
                    htmlFor="pickup"
                    className="cursor-pointer font-medium text-sm"
                  >
                    Store Pickup
                  </Label>
                </div>
                <span className="text-sm font-medium">20.000₫</span>
              </div>
            </RadioGroup>
          </div>
          <div className="hidden lg:block mb-6">
            <Label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
              Coupon Code
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Enter code"
                  className="pl-9 bg-white border-gray-300 focus-visible:ring-black"
                />
              </div>
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-white hover:text-black hover:border-black"
              >
                Apply
              </Button>
            </div>
          </div>

          <Separator className="bg-gray-200 mb-6" />
          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">
                {subtotal.toLocaleString("vi-VN")}₫
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span className="font-medium text-gray-900">
                {shippingCost > 0
                  ? `+${shippingCost.toLocaleString("vi-VN")}₫`
                  : "Free"}
              </span>
            </div>
            <div className="flex justify-between items-end pt-2">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">
                {total.toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>

          <Button
            onClick={onNext}
            className="w-full bg-black hover:bg-gray-800 text-white h-14 text-lg font-medium rounded-lg shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            Checkout <ArrowRight className="w-5 h-5" />
          </Button>

          <div className="mt-4 flex justify-center text-xs text-gray-500 gap-2">
            <Truck className="w-4 h-4" /> Calculated at next step
          </div>
        </div>
      </div>
    </div>
  );
}
