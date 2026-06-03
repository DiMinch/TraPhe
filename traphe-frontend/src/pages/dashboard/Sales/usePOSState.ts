import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import type { Product, ProductVariant } from "@/types/product.types";
import {
  orderService,
  type CreateOrderRequest,
  type OrderItemRequest,
  type OrderResponse,
} from "@/services/order.service";
import { promotionService } from "@/services/promotion.service";
import { customerService } from "@/services/customer.service";
import type { Customer } from "@/types/customer.types";
import axiosClient from "@/lib/axios-client";

// ---- Types ----

export interface OrderItem {
  id: string;
  productVariantId: string;
  product: string;
  sku: string;
  price: number;
  available: number;
  quantity: number;
  image: string;
  notes?: string | null;
  options?: { optionGroupId: string; optionValueId: string; groupName?: string; valueLabel?: string }[];
  toppings?: { toppingId: string; quantity: number; name?: string; extraPrice?: number }[];
}

export interface AppliedPromotion {
  promotionId: string;
  promotionCode: string;
  discountAmount: number;
}

// ---- Hook ----

const PAGE_SIZE = 12;

export function usePOSState() {
  // Product & category state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // Cart state
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isCartVisible, setIsCartVisible] = useState(true);

  // Customer state
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [guestPhone, setGuestPhone] = useState("");

  // Payment & promo state
  const [voucherCode, setVoucherCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [appliedPromotions, setAppliedPromotions] = useState<AppliedPromotion[]>([]);
  const [discountCalculation, setDiscountCalculation] = useState<any | null>(null);
  const [applyingPromotion, setApplyingPromotion] = useState(false);
  const [activePromotions, setActivePromotions] = useState<any[]>([]);
  const [myVouchers, setMyVouchers] = useState<any[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // Order flow state
  const [processing, setProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderResponse | null>(null);
  const [copiedSerial, setCopiedSerial] = useState<string | null>(null);
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState<number>(0);
  const [orderServeType, setOrderServeType] = useState<"DINE_IN" | "TAKE_AWAY">("DINE_IN");

  // Customization modal state
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedToppings, setSelectedToppings] = useState<Set<string>>(new Set());
  const [customNote, setCustomNote] = useState<string>("");
  const [customizationQuantity, setCustomizationQuantity] = useState<number>(1);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  // ---- Data fetching ----

  const fetchProducts = useCallback(async (page: number = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page, size: PAGE_SIZE };
      if (selectedCategory !== "all") params.categoryId = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await productService.getAllProducts(params);
      setProducts(response.data?.content || []);
      setTotalPages(response.data?.totalPages || 0);
      setCurrentPage(page);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || "Failed to fetch products");
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.getAllCategories();
      const data = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.content || [];
      setCategories(data);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await customerService.getCustomers();
      const data = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.content || [];
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error fetching customers:", err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    const fetchActivePromotions = async () => {
      try {
        const response = await promotionService.getActivePromotions();
        if (response.success && response.data) {
          setActivePromotions(response.data);
        }
      } catch (err) {
        console.error("Error fetching active promotions:", err);
      }
    };
    fetchProducts(0);
    fetchCategories();
    fetchCustomers();
    fetchActivePromotions();
  }, []);

  // Fetch customer vouchers
  useEffect(() => {
    if (selectedCustomer) {
      customerService.getCustomerVouchers(selectedCustomer.id)
        .then(res => {
          if (res.success && res.data) setMyVouchers(res.data);
        })
        .catch(err => console.error("Error fetching customer vouchers:", err));
    } else {
      setMyVouchers([]);
    }
  }, [selectedCustomer]);

  // Refetch on category change
  useEffect(() => {
    setCurrentPage(0);
    fetchProducts(0);
  }, [selectedCategory]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(0);
      fetchProducts(0);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // ---- Customer handlers ----

  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.fullName?.toLowerCase() || "").includes(customerSearch.toLowerCase()) ||
      (customer.phone || "").includes(customerSearch) ||
      (customer.email?.toLowerCase() || "").includes(customerSearch.toLowerCase()),
  );

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.fullName);
    setShowCustomerDropdown(false);
    setGuestPhone("");
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerSearch("");
    setLoyaltyPointsUsed(0);
  };

  const handleCustomerLookup = async () => {
    if (!customerSearch.trim()) {
      toast.error("Please enter a phone number or email to search");
      return;
    }
    const localMatch = customers.find(
      (c) =>
        c.phone === customerSearch.trim() ||
        c.email?.toLowerCase() === customerSearch.trim().toLowerCase()
    );
    if (localMatch) {
      handleSelectCustomer(localMatch);
      toast.success(`Found customer: ${localMatch.fullName}`);
      return;
    }
    try {
      const res = await axiosClient.get<any, any>(`/pos/customers`, {
        params: { phone: customerSearch.trim() }
      });
      const data = res.data;
      if (data) {
        const customerObj: Customer = {
          id: data.customerId,
          fullName: data.fullName,
          phone: data.phoneNumber,
          email: "",
          totalPurchase: 0,
          tier: { id: "std", name: "Standard", tierLevel: 0, minSpending: 0, pointEarningRate: 1, discountRate: 0, active: true },
          loyaltyPoint: { id: "lp", totalPoints: data.loyaltyPoints, pointsAvailable: data.loyaltyPoints, pointsUsed: 0, pointRate: 1 },
          addresses: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        handleSelectCustomer(customerObj);
        toast.success(`Found customer: ${data.fullName}`);
      } else {
        toast.error("Không tìm thấy tài khoản");
      }
    } catch (err: any) {
      console.error("Lookup error:", err);
      toast.error("Không tìm thấy tài khoản");
    }
  };

  // ---- Product & cart handlers ----

  const handleProductClick = (product: Product) => {
    if (!product.variants || product.variants.length === 0) {
      toast.error("No variants available for this product");
      return;
    }
    setExpandedProductId(expandedProductId === product.id ? null : product.id);
  };

  const addDirectVariantToCart = (variant: ProductVariant, product: Product) => {
    const cartItemId = variant.id;
    const existingItem = orderItems.find((item) => item.id === cartItemId);
    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
      toast.success(`Increased quantity of ${variant.variantName}`);
    } else {
      const newItem: OrderItem = {
        id: cartItemId,
        productVariantId: variant.id,
        product: `${product.name} - ${variant.variantName}`,
        sku: variant.sku || "",
        price: variant.sellingPrice || 0,
        available: (variant as any).stockQuantity ?? 999,
        quantity: 1,
        image: product.imageUrl || "📦",
      };
      setOrderItems([...orderItems, newItem]);
      toast.success(`Added ${variant.variantName} to cart`);
    }
  };

  const handleAddVariantToCart = async (variant: ProductVariant, product: Product) => {
    const isCustomizable = product.isDrink || product.allowToppings || (product.optionGroups && product.optionGroups.length > 0);
    if (isCustomizable) {
      setIsLoadingProduct(true);
      setIsCustomizeModalOpen(true);
      setSelectedVariant(variant);
      try {
        const res = await productService.getProductById(product.id);
        const detailedProd = res.data;
        if (detailedProd) {
          setCustomizingProduct(detailedProd);
          const defaults: Record<string, string> = {};
          detailedProd.optionGroups?.forEach((group) => {
            const defaultVal = group.values.find((v) => v.default) || group.values[0];
            if (defaultVal) defaults[group.id] = defaultVal.id;
          });
          setSelectedOptions(defaults);
          setSelectedToppings(new Set());
          setCustomNote("");
          setCustomizationQuantity(1);
        } else {
          toast.error("Failed to load product details");
          setIsCustomizeModalOpen(false);
        }
      } catch (err: any) {
        console.error("Error loading product detail:", err);
        toast.error("Error loading product detail");
        setIsCustomizeModalOpen(false);
      } finally {
        setIsLoadingProduct(false);
      }
    } else {
      addDirectVariantToCart(variant, product);
    }
  };

  const handleSaveCustomization = () => {
    if (!customizingProduct || !selectedVariant) return;

    const optionsList: OrderItem["options"] = [];
    customizingProduct.optionGroups?.forEach((group) => {
      const selectedValId = selectedOptions[group.id];
      if (selectedValId) {
        const valObj = group.values.find((v) => v.id === selectedValId);
        optionsList!.push({
          optionGroupId: group.id,
          optionValueId: selectedValId,
          groupName: group.name,
          valueLabel: valObj?.label,
        });
      }
    });

    const toppingsList: OrderItem["toppings"] = [];
    let toppingsExtraPrice = 0;
    selectedToppings.forEach((toppingId) => {
      const toppingObj = customizingProduct.availableToppings?.find((t) => t.id === toppingId);
      if (toppingObj) {
        toppingsList!.push({ toppingId, quantity: 1, name: toppingObj.name, extraPrice: toppingObj.extraPrice });
        toppingsExtraPrice += toppingObj.extraPrice;
      }
    });

    const basePrice = selectedVariant.sellingPrice || 0;
    const finalUnitPrice = basePrice + toppingsExtraPrice;

    const optionsHash = optionsList!.map((o) => `${o.optionGroupId}:${o.optionValueId}`).sort().join(",");
    const toppingsHash = toppingsList!.map((t) => t.toppingId).sort().join(",");
    const cartItemId = `${selectedVariant.id}_opt_${optionsHash}_top_${toppingsHash}_note_${customNote}`;

    const existingItem = orderItems.find((item) => item.id === cartItemId);
    const optionsDesc = optionsList!.map((o) => o.valueLabel).filter(Boolean).join(", ");
    const toppingsDesc = toppingsList!.map((t) => t.name).filter(Boolean).join(", ");
    const customDetailsDesc = [
      selectedVariant.variantName,
      optionsDesc || "",
      toppingsDesc ? `Topping: ${toppingsDesc}` : "",
    ].filter(Boolean).join(" | ");

    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + customizationQuantity } : item
        )
      );
      toast.success(`Increased quantity of ${customizingProduct.name}`);
    } else {
      const newItem: OrderItem = {
        id: cartItemId,
        productVariantId: selectedVariant.id,
        product: `${customizingProduct.name} (${customDetailsDesc})`,
        sku: selectedVariant.sku || "",
        price: finalUnitPrice,
        available: 999,
        quantity: customizationQuantity,
        image: customizingProduct.imageUrl || "📦",
        notes: customNote || null,
        options: optionsList,
        toppings: toppingsList,
      };
      setOrderItems([...orderItems, newItem]);
      toast.success(`Added ${customizingProduct.name} to cart`);
    }
    setIsCustomizeModalOpen(false);
  };

  const toggleTopping = (toppingId: string) => {
    setSelectedToppings((prev) => {
      const next = new Set(prev);
      if (next.has(toppingId)) next.delete(toppingId);
      else next.add(toppingId);
      return next;
    });
  };

  const handleQuantityChange = (id: string, delta: number) => {
    setOrderItems(
      orderItems.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          if (newQuantity < 1) return item;
          if (newQuantity > item.available) {
            toast.error("Not enough stock available");
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }),
    );
  };

  const handleRemoveItem = (id: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
    setAppliedPromotions([]);
    setDiscountCalculation(null);
    setVoucherCode("");
  };

  // ---- Promotion handlers ----

  const handleApplyPromotion = async () => {
    if (!voucherCode.trim()) { toast.error("Please enter a promotion code"); return; }
    if (orderItems.length === 0) { toast.error("Please add items to cart first"); return; }

    setApplyingPromotion(true);
    try {
      const items = orderItems.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        unitPrice: item.price,
      }));
      const response = await promotionService.calculateCartDiscount({
        items,
        code: voucherCode.trim(),
        customerId: selectedCustomer?.id,
      });
      const calculation = response.data;
      setDiscountCalculation({ totalDiscount: calculation.totalDiscount, finalAmount: calculation.finalAmount });
      if (calculation.orderPromotion) {
        setAppliedPromotions([{
          promotionId: calculation.orderPromotion.promotionId,
          promotionCode: calculation.orderPromotion.code,
          discountAmount: calculation.orderPromotion.discountAmount,
        }]);
      }
      toast.success(`Promotion "${voucherCode}" applied successfully!`);
    } catch (err: any) {
      console.error("Error applying promotion:", err);
      toast.error(err.message || "Invalid promotion code");
    } finally {
      setApplyingPromotion(false);
    }
  };

  const handleRemovePromotion = async (promotionCode: string) => {
    setApplyingPromotion(true);
    try {
      setDiscountCalculation(null);
      setAppliedPromotions([]);
      if (voucherCode === promotionCode) setVoucherCode("");
      toast.success(`Promotion "${promotionCode}" removed`);
    } finally {
      setApplyingPromotion(false);
    }
  };

  // ---- Calculated values ----

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tierDiscount = selectedCustomer?.tier ? subtotal * (selectedCustomer.tier.discountRate / 100) : 0;
  const loyaltyDiscount = loyaltyPointsUsed * 1000;
  const promotionDiscount = discountCalculation?.totalDiscount || 0;
  const discount = promotionDiscount + tierDiscount + loyaltyDiscount;
  const total = Math.max(0, subtotal - discount);

  // ---- Order flow handlers ----

  const handleProceed = () => {
    if (orderItems.length === 0) { toast.error("Please add items to cart"); return; }
    if (!paymentMethod) { toast.error("Please select a payment method"); return; }
    if (!selectedCustomer && !guestPhone.trim()) {
      toast.error("Please select a customer or enter guest phone number");
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmOrder = async () => {
    setProcessing(true);
    try {
      const serveLabel = orderServeType === "TAKE_AWAY" ? "[Mang về] " : "[Tại chỗ] ";
      const items: OrderItemRequest[] = orderItems.map((item) => {
        const currentNote = item.notes ? item.notes : "";
        const updatedNote = serveLabel + currentNote;
        return {
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          unitPrice: item.price,
          notes: updatedNote.trim(),
          options: item.options?.map((o) => ({ optionGroupId: o.optionGroupId, optionValueId: o.optionValueId })),
          toppings: item.toppings?.map((t) => ({ toppingId: t.toppingId, quantity: t.quantity })),
        };
      });

      const orderData: CreateOrderRequest & { voucherCode?: string; loyaltyPointsUsed?: number } = {
        customerId: selectedCustomer?.id || undefined,
        guestPhone: selectedCustomer ? undefined : guestPhone,
        items,
        orderType: "OFFLINE",
        paymentMethod: paymentMethod as "CASH" | "QR",
        promotionIds: appliedPromotions.map((p) => p.promotionId),
        voucherCode: voucherCode || undefined,
        loyaltyPointsUsed: loyaltyPointsUsed || undefined,
      };

      const response = await orderService.createOrder(orderData);
      const createdOrder = response.data;
      toast.success("Order created successfully!");

      setCompletedOrder(createdOrder);
      setShowOrderSuccess(true);
      setShowConfirmation(false);

      // Reset form
      setOrderItems([]);
      setSelectedCustomer(null);
      setCustomerSearch("");
      setGuestPhone("");
      setVoucherCode("");
      setPaymentMethod("");
      setAppliedPromotions([]);
      setDiscountCalculation(null);
      setLoyaltyPointsUsed(0);
      setOrderServeType("DINE_IN");

      fetchProducts(currentPage);
    } catch (err: any) {
      console.error("Error creating order:", err);
      toast.error(err.response?.data?.message || "Failed to create order");
    } finally {
      setProcessing(false);
    }
  };

  // ---- Clipboard helpers ----

  const handleCopySerial = (serial: string) => {
    navigator.clipboard.writeText(serial);
    setCopiedSerial(serial);
    setTimeout(() => setCopiedSerial(null), 2000);
    toast.success("Serial number copied!");
  };

  const handleCopyAllSerials = () => {
    if (!completedOrder) return;
    const serials = completedOrder.items
      .filter((item: any) => item.serialNumber)
      .map((item: any) => `${item.menuItemName} - ${item.sizeName || ''}: ${item.serialNumber}`)
      .join("\n");
    navigator.clipboard.writeText(serials);
    toast.success("All serial numbers copied!");
  };

  // ---- Return ----

  return {
    // Product & catalog
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    categories,
    products,
    loading, error,
    currentPage, totalPages,
    expandedProductId, setExpandedProductId,
    fetchProducts,
    handleProductClick,

    // Cart
    orderItems, setOrderItems,
    isCartVisible, setIsCartVisible,
    handleQuantityChange,
    handleRemoveItem,
    handleAddVariantToCart,
    addDirectVariantToCart,

    // Customer
    customerSearch, setCustomerSearch,
    selectedCustomer,
    filteredCustomers,
    showCustomerDropdown, setShowCustomerDropdown,
    guestPhone, setGuestPhone,
    handleSelectCustomer,
    handleClearCustomer,
    handleCustomerLookup,

    // Customization modal
    customizingProduct,
    selectedVariant,
    selectedOptions, setSelectedOptions,
    selectedToppings,
    customNote, setCustomNote,
    customizationQuantity, setCustomizationQuantity,
    isCustomizeModalOpen, setIsCustomizeModalOpen,
    isLoadingProduct,
    handleSaveCustomization,
    toggleTopping,

    // Payment & promotion
    voucherCode, setVoucherCode,
    paymentMethod, setPaymentMethod,
    appliedPromotions,
    applyingPromotion,
    activePromotions,
    myVouchers,
    showVoucherModal, setShowVoucherModal,
    handleApplyPromotion,
    handleRemovePromotion,

    // Calculated values
    subtotal, tierDiscount, loyaltyDiscount,
    promotionDiscount, discount, total,

    // Loyalty
    loyaltyPointsUsed, setLoyaltyPointsUsed,
    orderServeType, setOrderServeType,

    // Order flow
    processing,
    showConfirmation, setShowConfirmation,
    showOrderSuccess, setShowOrderSuccess,
    completedOrder,
    copiedSerial,
    handleProceed,
    handleConfirmOrder,
    handleCopySerial,
    handleCopyAllSerials,

    // Constants
    pageSize: PAGE_SIZE,
  };
}
