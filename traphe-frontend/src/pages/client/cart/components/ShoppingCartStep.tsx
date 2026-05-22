import { Minus, Plus, X, ShieldAlert, ArrowRight, Loader2, Lock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product.types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

/** Decode common HTML entities that may appear in stored option labels */
const decodeHtmlEntities = (text: string): string => {
  if (!text) return "";
  let decoded = text;
  let previous = "";
  const textarea = document.createElement("textarea");
  while (decoded !== previous && decoded.includes("&")) {
    previous = decoded;
    textarea.innerHTML = decoded;
    decoded = textarea.value;
  }
  return decoded;
};

interface ShoppingCartStepProps {
  onNext: () => void;
}

export default function ShoppingCartStep({ onNext }: ShoppingCartStepProps) {
  const {
    cart,
    isLoading,
    updateQuantity,
    updateCustomization,
    removeItem,
    shippingMethod,
    setShippingMethod,
    shippingFee,
  } = useCart();

  // Customize modal state
  const [selectedItemToCustomize, setSelectedItemToCustomize] = useState<any | null>(null);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  // Customization selection state
  const [selectedSizeId, setSelectedSizeId] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedToppings, setSelectedToppings] = useState<Set<string>>(new Set());
  const [customNote, setCustomNote] = useState<string>("");
  const [isUpdatingCustomization, setIsUpdatingCustomization] = useState(false);

  const handleOpenCustomizeModal = async (item: any) => {
    setSelectedItemToCustomize(item);
    setIsCustomizeModalOpen(true);
    setIsLoadingProduct(true);
    try {
      const res = await productService.getProductById(item.menuItemId);
      if (res.success && res.data) {
        setCustomizingProduct(res.data);
        
        // Initialize from cart item values
        setSelectedSizeId(item.menuItemSizeId || "");
        
        const initialOptions: Record<string, string> = {};
        if (item.selectedOptions) {
          Object.entries(item.selectedOptions).forEach(([groupId, val]: [string, any]) => {
            initialOptions[groupId] = val.includes(":") ? val.split(":")[0] : val;
          });
        }
        setSelectedOptions(initialOptions);
        
        setSelectedToppings(new Set(item.selectedToppings?.map((t: any) => t.toppingId) || []));
        setCustomNote(item.note || "");
      } else {
        toast.error("Không thể tải thông tin sản phẩm");
        setIsCustomizeModalOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi khi tải sản phẩm");
      setIsCustomizeModalOpen(false);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const toggleTopping = (toppingId: string) => {
    const next = new Set(selectedToppings);
    if (next.has(toppingId)) {
      next.delete(toppingId);
    } else {
      next.add(toppingId);
    }
    setSelectedToppings(next);
  };

  const handleSaveCustomization = async () => {
    if (!selectedItemToCustomize || !customizingProduct) return;

    // Check if anything actually changed
    const sizeChanged = (selectedItemToCustomize.menuItemSizeId || "") !== selectedSizeId;
    
    let optionsChanged = false;
    const currentOptionsClean: Record<string, string> = {};
    if (selectedItemToCustomize.selectedOptions) {
      Object.entries(selectedItemToCustomize.selectedOptions).forEach(([groupId, val]: [string, any]) => {
        currentOptionsClean[groupId] = val.includes(":") ? val.split(":")[0] : val;
      });
    }
    
    const allOptionKeys = new Set([...Object.keys(currentOptionsClean), ...Object.keys(selectedOptions)]);
    for (const key of allOptionKeys) {
      if (currentOptionsClean[key] !== selectedOptions[key]) {
        optionsChanged = true;
        break;
      }
    }
    
    const currentToppingIds = new Set(selectedItemToCustomize.selectedToppings?.map((t: any) => t.toppingId) || []);
    let toppingsChanged = currentToppingIds.size !== selectedToppings.size;
    if (!toppingsChanged) {
      for (const tId of selectedToppings) {
        if (!currentToppingIds.has(tId)) {
          toppingsChanged = true;
          break;
        }
      }
    }
    
    const noteChanged = (selectedItemToCustomize.note || "") !== customNote;
    
    if (!sizeChanged && !optionsChanged && !toppingsChanged && !noteChanged) {
      setIsCustomizeModalOpen(false);
      return;
    }

    setIsUpdatingCustomization(true);
    try {
      const formattedOptions: Record<string, string> = {};
      if (customizingProduct.optionGroups) {
        customizingProduct.optionGroups.forEach((group) => {
          const selectedValId = selectedOptions[group.id];
          if (selectedValId) {
            const val = group.values.find((v) => v.id === selectedValId);
            if (val) {
              formattedOptions[group.id] = `${val.id}:${val.label}`;
            }
          }
        });
      }

      const updateSuccess = await updateCustomization(selectedItemToCustomize.id, {
        menuItemId: customizingProduct.id,
        menuItemSizeId: selectedSizeId || undefined,
        quantity: selectedItemToCustomize.quantity,
        note: customNote || undefined,
        selectedOptions: formattedOptions,
        selectedToppings: Array.from(selectedToppings).map((id) => ({
          toppingId: id,
          quantity: 1,
        })),
      });

      if (updateSuccess) {
        toast.success("Cập nhật tùy chỉnh thành công!");
        setIsCustomizeModalOpen(false);
      } else {
        toast.error("Không thể cập nhật tùy chỉnh");
      }
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi khi lưu tùy chỉnh");
    } finally {
      setIsUpdatingCustomization(false);
    }
  };

  const cartSubtotal = cart?.totalAmount || 0;
  const shippingCost =
    shippingMethod === "delivery" ? shippingFee : 0;
  const total = cartSubtotal + shippingCost;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-roast" />
      </div>
    );
  }

  const drinks = cart?.items?.filter((item) => item.isDrink) || [];
  const merchandise = cart?.items?.filter((item) => !item.isDrink) || [];
  const hasItems = cart?.items && cart.items.length > 0;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6 font-ui-body">
      {!hasItems ? (
        <div className="bg-surface-container-lowest border border-admin-border rounded-xl p-12 text-center text-smoke shadow-sm flex flex-col items-center gap-4 max-w-lg mx-auto">
          <ShieldAlert className="w-12 h-12 text-dust" />
          <h3 className="font-ui-heading text-lg font-bold text-roast">Your cart is empty</h3>
          <p className="text-sm">Browse our artisanal beverages and premium merchandise to add items here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            {drinks.length > 0 && (
              <section>
                <h2 className="font-display-md text-display-md text-smoke mb-4 border-b border-mist pb-2">Your Drinks</h2>
                <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-admin-border flex flex-col overflow-hidden divide-y divide-mist/30">
                  {drinks.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center p-6 gap-6 hover:bg-foam transition-colors duration-200 group"
                    >
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-foam rounded-lg border border-mist overflow-hidden shrink-0 shadow-sm flex items-center justify-center text-xs text-dust">
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
                      <div className="flex-1 flex flex-col gap-2 w-full">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-ui-heading text-ui-heading text-roast">{item.menuItemName}</h3>
                            {item.sizeName && (
                              <p className="font-ui-body text-xs text-smoke mt-1">Size: {item.sizeName} • Iced</p>
                            )}
                          </div>
                          <span className="font-ui-heading text-ui-heading text-roast">
                            {item.unitPrice.toLocaleString("vi-VN")}₫
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.selectedOptions && Object.entries(item.selectedOptions).map(([key, val]) => {
                            const displayVal = val.includes(":") ? val.split(":")[1] : val;
                            return (
                              <span key={key} className="inline-flex items-center px-3 py-1 rounded-full bg-cream text-smoke font-ui-body text-xs border border-mist">
                                {decodeHtmlEntities(displayVal)}
                              </span>
                            );
                          })}
                          {item.selectedToppings && item.selectedToppings.map(t => (
                            <span key={t.toppingId} className="inline-flex items-center px-3 py-1 rounded-full bg-cream text-smoke font-ui-body text-xs border border-mist">
                              +{t.toppingName}
                            </span>
                          ))}
                        </div>
                        {item.note && (
                          <p className="text-xs text-smoke italic mt-1 font-ui-body">
                            Note: {item.note}
                          </p>
                        )}
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-mist/50">
                          <div className="text-xs text-dust">
                            Subtotal: <span className="font-semibold text-roast">{item.subtotal.toLocaleString("vi-VN")}₫</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center border border-admin-border rounded-full h-10 bg-white">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-10 h-full flex items-center justify-center text-smoke hover:text-roast hover:bg-foam rounded-l-full transition-colors disabled:opacity-30 cursor-pointer"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-ui-body text-ui-body font-semibold text-roast w-8 text-center select-none">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-10 h-full flex items-center justify-center text-smoke hover:text-roast hover:bg-foam rounded-r-full transition-colors cursor-pointer"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => handleOpenCustomizeModal(item)}
                              className="text-dust hover:text-roast transition-colors p-2 rounded-full hover:bg-foam cursor-pointer flex items-center gap-1 text-xs font-semibold"
                              title="Tùy chỉnh"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Tùy chỉnh</span>
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-dust hover:text-error transition-colors p-2 rounded-full hover:bg-error-container/20 cursor-pointer"
                              title="Remove item"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {merchandise.length > 0 && (
              <section>
                <h2 className="font-display-md text-display-md text-smoke mb-4 border-b border-mist pb-2">Merchandise</h2>
                <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-admin-border flex flex-col overflow-hidden divide-y divide-mist/30">
                  {merchandise.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center p-6 gap-6 hover:bg-foam transition-colors duration-200 group"
                    >
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-foam rounded-lg border border-mist overflow-hidden shrink-0 shadow-sm flex items-center justify-center text-xs text-dust">
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
                      <div className="flex-1 flex flex-col gap-2 w-full">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-ui-heading text-ui-heading text-roast">{item.menuItemName}</h3>
                            {item.sizeName && (
                              <p className="font-ui-body text-xs text-smoke mt-1">{item.sizeName}</p>
                            )}
                          </div>
                          <span className="font-ui-heading text-ui-heading text-roast">
                            {item.unitPrice.toLocaleString("vi-VN")}₫
                          </span>
                        </div>
                        {item.note && (
                          <p className="text-xs text-smoke italic mt-1 font-ui-body">
                            Note: {item.note}
                          </p>
                        )}
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-mist/50">
                          <div className="text-xs text-dust">
                            Subtotal: <span className="font-semibold text-roast">{item.subtotal.toLocaleString("vi-VN")}₫</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center border border-admin-border rounded-full h-10 bg-white">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-10 h-full flex items-center justify-center text-smoke hover:text-roast hover:bg-foam rounded-l-full transition-colors disabled:opacity-30 cursor-pointer"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-ui-body text-ui-body font-semibold text-roast w-8 text-center select-none">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-10 h-full flex items-center justify-center text-smoke hover:text-roast hover:bg-foam rounded-r-full transition-colors cursor-pointer"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-dust hover:text-error transition-colors p-2 rounded-full hover:bg-error-container/20 cursor-pointer"
                              title="Remove item"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-4">
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-admin-border sticky top-24 flex flex-col gap-6">
              <h2 className="font-heading-lg text-heading-lg text-roast mb-2 pb-4 border-b border-mist">
                Cart Summary
              </h2>

              {/* Delivery Methods */}
              <div>
                <Label className="font-ui-heading text-xs font-bold text-smoke uppercase tracking-wider mb-3 block">
                  Delivery Method
                </Label>
                <RadioGroup
                  value={shippingMethod}
                  onValueChange={setShippingMethod}
                  className="space-y-3"
                >
                  <div
                    onClick={() => setShippingMethod("pickup")}
                    className={cn(
                      "flex items-center justify-between bg-white border rounded-lg px-4 py-3 cursor-pointer transition-all",
                      shippingMethod === "pickup"
                        ? "border-roast bg-surface-container-low shadow-sm ring-1 ring-roast"
                        : "border-admin-border hover:border-roast/50",
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="pickup" id="pickup" className="text-roast focus:ring-roast" />
                      <Label
                        htmlFor="pickup"
                        className="cursor-pointer font-ui-heading font-medium text-sm text-roast"
                      >
                        Pick-up at Store
                      </Label>
                    </div>
                    <span className="text-sm font-semibold text-roast">Free</span>
                  </div>

                  <div
                    onClick={() => setShippingMethod("delivery")}
                    className={cn(
                      "flex items-center justify-between bg-white border rounded-lg px-4 py-3 cursor-pointer transition-all",
                      shippingMethod === "delivery"
                        ? "border-roast bg-surface-container-low shadow-sm ring-1 ring-roast"
                        : "border-admin-border hover:border-roast/50",
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="delivery" id="delivery" className="text-roast focus:ring-roast" />
                      <Label
                        htmlFor="delivery"
                        className="cursor-pointer font-ui-heading font-medium text-sm text-roast"
                      >
                        Home Delivery
                      </Label>
                    </div>
                    <span className="text-sm font-semibold text-roast">25.000₫</span>
                  </div>
                </RadioGroup>
              </div>

              <Separator className="bg-mist/30" />

              {/* Cost Calculations */}
              <div className="space-y-3 text-sm font-ui-body">
                <div className="flex justify-between text-smoke">
                  <span>Subtotal</span>
                  <span className="font-semibold text-roast">
                    {cartSubtotal.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div className="flex justify-between text-smoke">
                  <span>Shipping Fee</span>
                  <span className="font-semibold text-roast">
                    {shippingCost > 0
                      ? `+${shippingCost.toLocaleString("vi-VN")}₫`
                      : "Free"}
                  </span>
                </div>
              </div>

              <Separator className="bg-mist/30" />

              {/* Total */}
              <div className="flex justify-between items-end mb-4">
                <span className="font-ui-heading text-ui-heading text-smoke">Total</span>
                <span className="font-pos-total text-pos-total text-roast">
                  {total.toLocaleString("vi-VN")}₫
                </span>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={onNext}
                disabled={!cart || cart.items.length === 0}
                className="w-full bg-roast text-white rounded-full py-4 h-auto font-body-md text-base hover:bg-primary transition-all duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </Button>

              {/* Security Badge */}
              <div className="flex justify-center items-center gap-2 text-dust">
                <Lock className="w-4 h-4" />
                <span className="font-ui-body text-xs">Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customize Modal */}
      <Dialog open={isCustomizeModalOpen} onOpenChange={setIsCustomizeModalOpen}>
        <DialogContent className="bg-white border-[#EFE5D3] max-w-lg p-6 rounded-2xl shadow-xl overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold text-[#2C1A0E]">
              Tùy chỉnh món ăn
            </DialogTitle>
            <DialogDescription className="font-sans text-[#5C4A3C] text-sm">
              Thay đổi các tùy chọn của bạn cho {selectedItemToCustomize?.menuItemName}
            </DialogDescription>
          </DialogHeader>

          {isLoadingProduct ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-roast" />
            </div>
          ) : (
            customizingProduct && (
              <div className="space-y-6 my-4">
                {/* Size Selection */}
                {customizingProduct.sizes && customizingProduct.sizes.length > 0 && (
                  <div>
                    <h4 className="font-ui-heading font-semibold text-roast mb-2">Chọn Size</h4>
                    <div className="flex flex-wrap gap-3">
                      {customizingProduct.sizes.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => setSelectedSizeId(size.id)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer",
                            selectedSizeId === size.id
                              ? "bg-roast border-roast text-white"
                              : "bg-white border-admin-border text-[#4A3F35] hover:border-roast/50"
                          )}
                        >
                          {size.sizeName} (+{size.sellingPrice.toLocaleString("vi-VN")}₫)
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Option Groups (Sugar, Ice, Temp) */}
                {customizingProduct.optionGroups && customizingProduct.optionGroups.map((group) => (
                  <div key={group.id}>
                    <h4 className="font-ui-heading font-semibold text-roast mb-2">{group.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {group.values.map((val) => (
                        <button
                          key={val.id}
                          onClick={() =>
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [group.id]: val.id,
                            }))
                          }
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer",
                            selectedOptions[group.id] === val.id
                              ? "bg-roast border-roast text-white"
                              : "bg-[#FBF9F6] border-[#D4C9BC] text-[#5C4A3C] hover:border-roast/50"
                          )}
                        >
                          {val.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Toppings Selection */}
                {customizingProduct.allowToppings && customizingProduct.availableToppings && customizingProduct.availableToppings.filter(t => t.available).length > 0 && (
                  <div>
                    <h4 className="font-ui-heading font-semibold text-roast mb-2">Thêm Topping</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {customizingProduct.availableToppings.filter(t => t.available).map((topping) => {
                        const isSelected = selectedToppings.has(topping.id);
                        return (
                          <button
                            key={topping.id}
                            onClick={() => toggleTopping(topping.id)}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer",
                              isSelected
                                ? "bg-[#F5EAD8] border-roast text-[#2C1A0E] font-medium"
                                : "bg-white border-admin-border text-[#4A3F35] hover:border-roast/50"
                            )}
                          >
                            <span className="text-xs">{topping.name}</span>
                            <span className="text-xs text-dust">
                              +{topping.extraPrice.toLocaleString("vi-VN")}₫
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Custom Note */}
                <div>
                  <h4 className="font-ui-heading font-semibold text-roast mb-2">Ghi chú đặc biệt</h4>
                  <textarea
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Nhập ghi chú cho món ăn của bạn (ví dụ: ít ngọt, nhiều đá...)"
                    className="w-full min-h-[80px] p-3 text-sm rounded-xl border border-admin-border bg-white focus:outline-none focus:ring-1 focus:ring-roast text-[#4A3F35]"
                  />
                </div>
              </div>
            )
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="outline"
              disabled={isUpdatingCustomization}
              onClick={() => setIsCustomizeModalOpen(false)}
              className="flex-grow border-[#D4C9BC] hover:border-[#A0622A] hover:bg-[#F5EAD8] text-[#4A3F35] font-medium h-11 rounded-xl cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveCustomization}
              disabled={isUpdatingCustomization || isLoadingProduct}
              className="flex-grow bg-roast hover:bg-[#4A260F] text-white font-medium h-11 rounded-xl cursor-pointer flex items-center justify-center gap-2"
            >
              {isUpdatingCustomization ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Lưu thay đổi</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

