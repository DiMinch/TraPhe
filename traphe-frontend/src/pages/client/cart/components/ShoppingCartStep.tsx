import { Minus, Plus, X, Truck, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

interface ShoppingCartStepProps {
  onNext: () => void;
}

export default function ShoppingCartStep({ onNext }: ShoppingCartStepProps) {
  const { cart, isLoading, updateQuantity, removeItem } = useCart();
  const [shippingMethod, setShippingMethod] = useState("pickup");

  const cartSubtotal = cart?.totalAmount || 0;
  const shippingCost =
    shippingMethod === "delivery" ? 25000 : 0;
  const total = cartSubtotal + shippingCost;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12">
      <div className="lg:col-span-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 bg-gray-50 border-b border-gray-200 px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-6">Sản phẩm</div>
            <div className="col-span-3 text-center">Số lượng</div>
            <div className="col-span-3 text-right">Thành tiền</div>
          </div>

          <div className="divide-y divide-gray-100">
            {!cart?.items || cart.items.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                Giỏ hàng trống
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 items-center px-6 py-6 hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="col-span-6 flex gap-4">
                    <div className="w-20 h-24 bg-gray-100 rounded-md border border-gray-200 shrink-0 flex items-center justify-center text-xs text-gray-400 overflow-hidden">
                      {item.menuItemImageUrl ? (
                        <img
                          src={item.menuItemImageUrl}
                          alt={item.menuItemName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        "Img"
                      )}
                    </div>
                    <div className="flex flex-col justify-between py-0.5">
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1 group-hover:text-black transition-colors">
                          {item.menuItemName}
                        </h3>
                        {item.sizeName && (
                          <p className="text-xs text-gray-500">
                            Size: {item.sizeName}
                          </p>
                        )}
                        {item.selectedToppings && item.selectedToppings.length > 0 && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Topping: {item.selectedToppings.map(t => t.toppingName).join(", ")}
                          </p>
                        )}
                        {item.note && (
                          <p className="text-xs text-gray-400 italic mt-0.5">
                            Ghi chú: {item.note}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1 md:hidden">
                          {item.unitPrice.toLocaleString("vi-VN")}₫
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex items-center text-xs font-medium text-gray-400 hover:text-red-600 transition-colors w-fit mt-2"
                      >
                        <X className="w-3 h-3 mr-1" /> Xóa
                      </button>
                    </div>
                  </div>

                  <div className="col-span-3 flex justify-center">
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg h-9 shadow-sm">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-black rounded-l-lg transition-colors disabled:opacity-50 cursor-pointer"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-gray-900 select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-black rounded-r-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-3 text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {item.subtotal.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 lg:p-8 sticky top-24">
          <h2 className="text-xl font-bold mb-6 text-gray-900">
            Tóm tắt đơn hàng
          </h2>
          <div className="mb-6">
            <Label className="text-xs font-bold text-gray-500 uppercase mb-3 block">
              Phương thức nhận hàng
            </Label>
            <RadioGroup
              value={shippingMethod}
              onValueChange={setShippingMethod}
              className="space-y-3"
            >
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
                    Nhận tại quầy (Pick-up)
                  </Label>
                </div>
                <span className="text-sm font-medium text-green-600">
                  Miễn phí
                </span>
              </div>

              <div
                className={cn(
                  "flex items-center justify-between bg-white border rounded-lg px-4 py-3 cursor-pointer transition-all",
                  shippingMethod === "delivery"
                    ? "border-black shadow-sm ring-1 ring-black"
                    : "border-gray-200 hover:border-gray-300",
                )}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label
                    htmlFor="delivery"
                    className="cursor-pointer font-medium text-sm"
                  >
                    Giao hàng (Delivery)
                  </Label>
                </div>
                <span className="text-sm font-medium">25.000₫</span>
              </div>
            </RadioGroup>
          </div>

          <Separator className="bg-gray-200 mb-6" />
          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tạm tính</span>
              <span className="font-medium text-gray-900">
                {cartSubtotal.toLocaleString("vi-VN")}₫
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Phí giao hàng</span>
              <span className="font-medium text-gray-900">
                {shippingCost > 0
                  ? `+${shippingCost.toLocaleString("vi-VN")}₫`
                  : "Miễn phí"}
              </span>
            </div>
            <div className="flex justify-between items-end pt-2">
              <span className="text-base font-bold text-gray-900">
                Tổng cộng
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {total.toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>

          <Button
            onClick={onNext}
            disabled={!cart || cart.items.length === 0}
            className="w-full bg-black hover:bg-gray-800 text-white h-14 text-lg font-medium rounded-lg shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            Thanh toán <ArrowRight className="w-5 h-5" />
          </Button>

          <div className="mt-4 flex justify-center text-xs text-gray-500 gap-2">
            <Truck className="w-4 h-4" /> Phí vận chuyển tính ở bước tiếp theo
          </div>
        </div>
      </div>
    </div>
  );
}
