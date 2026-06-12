import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, ShoppingCart, Coffee, Check, Snowflake, Flame, Droplets, Settings, PlusCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SpecsSheet from "./SpecsSheet";
import type { Product, ProductVariant } from "@/types/product.types";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useNavigate, Link } from "react-router";
import { toast } from "sonner";

interface ProductSectionProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  onVariantChange: (v: ProductVariant) => void;
}

export default function ProductSection({
  product,
  selectedVariant,
  onVariantChange,
}: ProductSectionProps) {
  const images = product.imageUrl ? [product.imageUrl] : [];
  const [currentImage, setCurrentImage] = useState(0);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Option group selections: { groupId: selectedValueId }
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  // Topping selections: Set of topping IDs
  const [selectedToppings, setSelectedToppings] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCurrentImage(0);
    // Initialize default options
    if (product.optionGroups) {
      const defaults: Record<string, string> = {};
      product.optionGroups.forEach((group) => {
        const defaultVal = group.values.find((v) => v.default);
        if (defaultVal) {
          defaults[group.id] = defaultVal.id;
        } else if (group.values.length > 0) {
          defaults[group.id] = group.values[0].id;
        }
      });
      setSelectedOptions(defaults);
    }
    setSelectedToppings(new Set());
  }, [product.id]);

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const price = selectedVariant ? selectedVariant.sellingPrice : 0;

  // Calculate topping extra price
  const toppingExtra = product.availableToppings
    ? product.availableToppings
        .filter((t) => selectedToppings.has(t.id))
        .reduce((sum, t) => sum + t.extraPrice, 0)
    : 0;

  const totalPrice = price + toppingExtra;

  const handleSelectOption = (groupId: string, valueId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [groupId]: valueId }));
  };

  const handleToggleTopping = (toppingId: string) => {
    setSelectedToppings((prev) => {
      const next = new Set(prev);
      if (next.has(toppingId)) {
        next.delete(toppingId);
      } else {
        next.add(toppingId);
      }
      return next;
    });
  };

  const handleAddToCart = async () => {
    const formattedOptions: Record<string, string> = {};
    if (product.optionGroups) {
      product.optionGroups.forEach((group) => {
        const selectedValId = selectedOptions[group.id];
        if (selectedValId) {
          const val = group.values.find((v) => v.id === selectedValId);
          if (val) {
            formattedOptions[group.id] = `${val.id}:${val.label}`;
          }
        }
      });
    }

    const success = await addToCart({
      menuItemId: product.id,
      menuItemSizeId: selectedVariant?.id,
      quantity: 1,
      selectedOptions: formattedOptions,
      selectedToppings: Array.from(selectedToppings).map((id) => ({
        toppingId: id,
        quantity: 1,
      })),
    });
    if (success) {
      toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
    }
  };

  const handleBuyNow = async () => {
    const formattedOptions: Record<string, string> = {};
    if (product.optionGroups) {
      product.optionGroups.forEach((group) => {
        const selectedValId = selectedOptions[group.id];
        if (selectedValId) {
          const val = group.values.find((v) => v.id === selectedValId);
          if (val) {
            formattedOptions[group.id] = `${val.id}:${val.label}`;
          }
        }
      });
    }

    const success = await addToCart({
      menuItemId: product.id,
      menuItemSizeId: selectedVariant?.id,
      quantity: 1,
      selectedOptions: formattedOptions,
      selectedToppings: Array.from(selectedToppings).map((id) => ({
        toppingId: id,
        quantity: 1,
      })),
    });
    if (success) {
      navigate("/cart");
    }
  };

  const getOptionIcon = (type: string) => {
    switch (type) {
      case "SUGAR":
        return <Droplets className="w-4 h-4 text-[#A0622A]" />;
      case "ICE":
        return <Snowflake className="w-4 h-4 text-[#A0622A]" />;
      case "TEMPERATURE":
        return <Flame className="w-4 h-4 text-[#A0622A]" />;
      default:
        return <Settings className="w-4 h-4 text-[#A0622A]" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
      {/* Image Section */}
      <div className="flex flex-col items-center">
        <div className="relative w-full aspect-square bg-[#F5EAD8] rounded-2xl overflow-hidden group mb-6 flex items-center justify-center">
          {images.length > 0 ? (
            <img
              src={images[currentImage]}
              alt={product.name}
              className="w-full h-full object-contain p-8 transition-opacity duration-500"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-[#8C7B6E]">
              <Coffee className="w-16 h-16" />
              <span className="text-sm font-medium">Hình ảnh sản phẩm</span>
            </div>
          )}

          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 border-none shadow-md hidden group-hover:flex hover:bg-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 border-none shadow-md hidden group-hover:flex hover:bg-white"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
        <SpecsSheet product={product} selectedVariant={selectedVariant} />
      </div>

      {/* Details Section */}
      <div className="flex flex-col justify-start lg:pl-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex text-sm text-[#8C7B6E] mb-4">
          <ol className="flex items-center gap-2 font-ui-body text-xs">
            <li>
              <Link className="hover:text-[#5C3317] transition-colors" to="/">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-[#8C7B6E]" />
            </li>
            <li>
              <Link
                className="hover:text-[#5C3317] transition-colors"
                to={product.isDrink ? "/menu" : "/merchandise"}
              >
                {product.isDrink ? "Menu" : "Merchandise"}
              </Link>
            </li>
            {product.categoryName && (
              <>
                <li>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8C7B6E]" />
                </li>
                <li aria-current="page" className="text-[#5C3317] font-semibold">
                  {product.categoryName}
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* Category badge */}
        {product.categoryName && (
          <span className="text-xs font-medium text-[#A0622A] bg-[#F5EAD8] px-3 py-1 rounded-full w-fit mb-4 uppercase tracking-wider">
            {product.categoryName}
          </span>
        )}

        <h1 className="text-3xl lg:text-4xl font-serif font-semibold leading-tight mb-3 text-[#2C1A0E]">
          {product.name}
        </h1>

        <div className="flex items-end gap-3 mb-6">
          <span className="text-3xl font-bold text-[#5C3317]">
            {totalPrice.toLocaleString("vi-VN")} ₫
          </span>
          {toppingExtra > 0 && (
            <span className="text-sm text-[#8C7B6E] mb-1">
              (bao gồm +{toppingExtra.toLocaleString("vi-VN")} ₫ topping)
            </span>
          )}
        </div>

        <p className="text-[#4A3F35] mb-8 leading-relaxed text-base">
          {product.description}
        </p>

        {/* Size Selection */}
        {product.variants && product.variants.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-bold text-[#2C1A0E] mb-3 block uppercase tracking-wider">
              Chọn size
            </label>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => onVariantChange(v)}
                    className={cn(
                      "border-2 rounded-xl px-5 py-3 text-sm transition-all cursor-pointer font-medium",
                      isSelected
                        ? "border-[#5C3317] bg-[#5C3317] text-white shadow-md"
                        : "border-[#D4C9BC] hover:border-[#5C3317] text-[#4A3F35] hover:bg-[#F5EAD8]",
                    )}
                  >
                    <span className="block">{v.variantName}</span>
                    <span className="block text-xs mt-0.5 opacity-80">
                      {v.sellingPrice.toLocaleString("vi-VN")} ₫
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Option Groups (Sweetness, Ice, Temperature) */}
        {product.optionGroups && product.optionGroups.length > 0 && (
          <div className="space-y-6 mb-6">
            {product.optionGroups
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((group) => (
                <div key={group.id}>
                  <label className="text-sm font-bold text-[#2C1A0E] mb-3 flex items-center gap-2 uppercase tracking-wider">
                    {getOptionIcon(group.type)}
                    {group.name}
                    {group.required && (
                      <span className="text-[10px] bg-[#C0392B]/10 text-[#C0392B] px-2 py-0.5 rounded-full font-medium normal-case tracking-normal">
                        Bắt buộc
                      </span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {group.values
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((val) => {
                        const isSelected = selectedOptions[group.id] === val.id;
                        return (
                          <button
                            key={val.id}
                            onClick={() => handleSelectOption(group.id, val.id)}
                            className={cn(
                              "border rounded-full px-4 py-2 text-sm transition-all cursor-pointer font-medium",
                              isSelected
                                ? "border-[#5C3317] bg-[#5C3317] text-white"
                                : "border-[#D4C9BC] hover:border-[#A0622A] text-[#4A3F35] hover:bg-[#F5EAD8]",
                            )}
                          >
                            {val.label}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Toppings */}
        {product.allowToppings &&
          product.availableToppings &&
          product.availableToppings.length > 0 && (
            <div className="mb-8">
              <label className="text-sm font-bold text-[#2C1A0E] mb-3 flex items-center gap-2 uppercase tracking-wider">
                <PlusCircle className="w-4 h-4 text-[#A0622A]" />
                Topping thêm
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.availableToppings.map((topping) => {
                  const isSelected = selectedToppings.has(topping.id);
                  const isDisabled = !topping.available;
                  return (
                    <button
                      key={topping.id}
                      onClick={() => !isDisabled && handleToggleTopping(topping.id)}
                      disabled={isDisabled}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-all border",
                        isDisabled
                          ? "border-[#D4C9BC]/50 text-[#8C7B6E]/50 cursor-not-allowed bg-[#F0EBE3]/50"
                          : isSelected
                            ? "border-[#5C3317] bg-[#5C3317]/5 text-[#2C1A0E]"
                            : "border-[#D4C9BC] hover:border-[#A0622A] text-[#4A3F35] hover:bg-[#F5EAD8] cursor-pointer",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                            isSelected
                              ? "bg-[#5C3317] border-[#5C3317]"
                              : "border-[#D4C9BC]",
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </span>
                        <span className="font-medium">{topping.name}</span>
                        {isDisabled && (
                          <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                            Hết hàng
                          </span>
                        )}
                      </div>
                      <span className="text-[#A0622A] font-medium">
                        +{topping.extraPrice.toLocaleString("vi-VN")} ₫
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {/* Action Buttons */}
        {product.branchAvailable === false && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex flex-col gap-1">
            <span className="font-bold">Không khả dụng tại chi nhánh đã chọn</span>
            {product.unavailableReason && <span className="text-xs opacity-90">{product.unavailableReason}</span>}
          </div>
        )}

        <div className="flex gap-4 mt-auto pt-4 border-t border-[#EFE5D3]">
          <Button
            variant="outline"
            onClick={handleAddToCart}
            disabled={product.branchAvailable === false}
            className="h-14 w-14 border-2 border-[#5C3317] rounded-xl flex items-center justify-center hover:bg-[#F5EAD8] transition-colors cursor-pointer text-[#5C3317] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-6 h-6" />
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={product.branchAvailable === false}
            className="h-14 flex-1 bg-[#5C3317] hover:bg-[#2C1A0E] text-white text-lg font-medium rounded-xl uppercase tracking-wide transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {product.branchAvailable === false ? "Hết hàng" : `Mua ngay · ${totalPrice.toLocaleString("vi-VN")} ₫`}
          </Button>
        </div>
      </div>
    </div>
  );
}
