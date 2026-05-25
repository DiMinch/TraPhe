import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Search,
  QrCode,
  Plus,
  Minus,
  Trash2,
  X,
  Loader2,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  CheckCircle,
  User,
  CreditCard,
  Package,
  Printer,
  Copy,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import type { Product, ProductVariant } from "@/types/product.types";
import {
  orderService,
  type CreateOrderRequest,
  type OrderItemRequest,
  type OrderResponse,
} from "@/services/order.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { promotionService } from "@/services/promotion.service";
import { customerService } from "@/services/customer.service";
import type { Customer } from "@/types/customer.types";
import axiosClient from "@/lib/axios-client";

interface OrderItem {
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

interface AppliedPromotion {
  promotionId: string;
  promotionCode: string;
  discountAmount: number;
}

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [categories, setCategories] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [guestPhone, setGuestPhone] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const [appliedPromotions, setAppliedPromotions] = useState<
    AppliedPromotion[]
  >([]);
  const [discountCalculation, setDiscountCalculation] =
    useState<any | null>(null);
  const [applyingPromotion, setApplyingPromotion] = useState(false);

  // Product expansion state
  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    null,
  );

  // Cart visibility state
  const [isCartVisible, setIsCartVisible] = useState(true);

  // Confirmation step state
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const pageSize = 12;

  // Order success dialog state
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderResponse | null>(
    null,
  );
  const [copiedSerial, setCopiedSerial] = useState<string | null>(null);

  // Loyalty Points State
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState<number>(0);
  const [orderServeType, setOrderServeType] = useState<"DINE_IN" | "TAKE_AWAY">("DINE_IN");

  // Customization modal state
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({}); // group.id -> val.id
  const [selectedToppings, setSelectedToppings] = useState<Set<string>>(new Set()); // topping.id
  const [customNote, setCustomNote] = useState<string>("");
  const [customizationQuantity, setCustomizationQuantity] = useState<number>(1);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  // Fetch products from API with pagination
  const fetchProducts = async (page: number = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        size: pageSize,
      };
      if (selectedCategory !== "all") {
        params.categoryId = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const response = await productService.getAllProducts(params);
      const productsData = response.data?.content || [];
      setProducts(productsData);
      setTotalPages(response.data?.totalPages || 0);

      setCurrentPage(page);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || "Failed to fetch products");
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      const categoriesData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.content || [];
      setCategories(categoriesData);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await customerService.getCustomers();
      const customerData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.content || [];
      setCustomers(Array.isArray(customerData) ? customerData : []);
    } catch (err: any) {
      console.error("Error fetching customers:", err);
    }
  };

  const [activePromotions, setActivePromotions] = useState<any[]>([]);
  const [myVouchers, setMyVouchers] = useState<any[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    const fetchActivePromotions = async () => {
      try {
        const response = await promotionService.getActivePromotions();
        // Since axios interceptor returns the JSON payload directly:
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

  // Fetch customer specific vouchers
  useEffect(() => {
    if (selectedCustomer) {
      customerService.getCustomerVouchers(selectedCustomer.id)
        .then(res => {
          if (res.success && res.data) {
            setMyVouchers(res.data);
          }
        })
        .catch(err => console.error("Error fetching customer vouchers:", err));
    } else {
      setMyVouchers([]);
    }
  }, [selectedCustomer]);

  // Refetch when category changes - reset to page 0
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

  // Filter customers based on search
  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.fullName?.toLowerCase() || "").includes(
        customerSearch.toLowerCase(),
      ) ||
      (customer.phone || "").includes(customerSearch) ||
      (customer.email?.toLowerCase() || "").includes(
        customerSearch.toLowerCase(),
      ),
  );

  // Handle customer selection
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.fullName);
    setShowCustomerDropdown(false);
    setGuestPhone(""); // Clear guest phone when customer is selected
  };

  // Handle clear customer
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
    
    // Check local list first
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
    
    // If not found locally, call the backend lookup (by phone)
    try {
      const res = await axiosClient.get<any, any>(`/pos/customers`, {
        params: { phone: customerSearch.trim() }
      });
      const data = res.data;
      if (data) {
        // Map the PosCustomerResponse to Customer
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

  // Handle product click - toggle expansion
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
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
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

  // Add variant to cart (customized or direct)
  const handleAddVariantToCart = async (
    variant: ProductVariant,
    product: Product,
  ) => {
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
            if (defaultVal) {
              defaults[group.id] = defaultVal.id;
            }
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

    const optionsList: { optionGroupId: string; optionValueId: string; groupName?: string; valueLabel?: string }[] = [];
    customizingProduct.optionGroups?.forEach((group) => {
      const selectedValId = selectedOptions[group.id];
      if (selectedValId) {
        const valObj = group.values.find((v) => v.id === selectedValId);
        optionsList.push({
          optionGroupId: group.id,
          optionValueId: selectedValId,
          groupName: group.name,
          valueLabel: valObj?.label,
        });
      }
    });

    const toppingsList: { toppingId: string; quantity: number; name?: string; extraPrice?: number }[] = [];
    let toppingsExtraPrice = 0;
    selectedToppings.forEach((toppingId) => {
      const toppingObj = customizingProduct.availableToppings?.find((t) => t.id === toppingId);
      if (toppingObj) {
        toppingsList.push({
          toppingId,
          quantity: 1,
          name: toppingObj.name,
          extraPrice: toppingObj.extraPrice,
        });
        toppingsExtraPrice += toppingObj.extraPrice;
      }
    });

    const basePrice = selectedVariant.sellingPrice || 0;
    const finalUnitPrice = basePrice + toppingsExtraPrice;

    const optionsHash = optionsList.map((o) => `${o.optionGroupId}:${o.optionValueId}`).sort().join(",");
    const toppingsHash = toppingsList.map((t) => t.toppingId).sort().join(",");
    const cartItemId = `${selectedVariant.id}_opt_${optionsHash}_top_${toppingsHash}_note_${customNote}`;

    const existingItem = orderItems.find((item) => item.id === cartItemId);
    
    const optionsDesc = optionsList.map((o) => o.valueLabel).filter(Boolean).join(", ");
    const toppingsDesc = toppingsList.map((t) => t.name).filter(Boolean).join(", ");
    const customDetailsDesc = [
      selectedVariant.variantName,
      optionsDesc ? `${optionsDesc}` : "",
      toppingsDesc ? `Topping: ${toppingsDesc}` : "",
    ].filter(Boolean).join(" | ");

    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + customizationQuantity }
            : item
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
      if (next.has(toppingId)) {
        next.delete(toppingId);
      } else {
        next.add(toppingId);
      }
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
    // Clear promotions when items change
    setAppliedPromotions([]);
    setDiscountCalculation(null);
    setVoucherCode("");
  };

  const handleApplyPromotion = async () => {
    if (!voucherCode.trim()) {
      toast.error("Please enter a promotion code");
      return;
    }

    if (orderItems.length === 0) {
      toast.error("Please add items to cart first");
      return;
    }

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
      setDiscountCalculation({
        totalDiscount: calculation.totalDiscount,
        finalAmount: calculation.finalAmount
      });
      
      if (calculation.orderPromotion) {
        setAppliedPromotions([{
          promotionId: calculation.orderPromotion.promotionId,
          promotionCode: calculation.orderPromotion.code,
          discountAmount: calculation.orderPromotion.discountAmount
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

      // Clear voucher code if it matches
      if (voucherCode === promotionCode) {
        setVoucherCode("");
      }

      toast.success(`Promotion "${promotionCode}" removed`);
    } finally {
      setApplyingPromotion(false);
    }
  };

  // Calculate totals
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Calculate tier discount if customer is selected
  const tierDiscount = selectedCustomer?.tier
    ? subtotal * (selectedCustomer.tier.discountRate / 100)
    : 0;

  // Calculate loyalty points discount: 1 pt = 1,000đ
  const loyaltyDiscount = loyaltyPointsUsed * 1000;

  // Total discount includes promotion, tier, and loyalty discounts
  const promotionDiscount = discountCalculation?.totalDiscount || 0;
  const discount = promotionDiscount + tierDiscount + loyaltyDiscount;

  // Final total after all discounts (ensuring total is not negative)
  const total = Math.max(0, subtotal - discount);

  // Show confirmation step
  const handleProceed = () => {
    if (orderItems.length === 0) {
      toast.error("Please add items to cart");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    // Validate customer or guest phone
    if (!selectedCustomer && !guestPhone.trim()) {
      toast.error("Please select a customer or enter guest phone number");
      return;
    }

    // Show confirmation screen
    setShowConfirmation(true);
  };

  // Create order after confirmation
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
          options: item.options?.map((o) => ({
            optionGroupId: o.optionGroupId,
            optionValueId: o.optionValueId,
          })),
          toppings: item.toppings?.map((t) => ({
            toppingId: t.toppingId,
            quantity: t.quantity,
          })),
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

      // Show order success dialog with serial numbers
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

      // Refresh products
      fetchProducts(currentPage);
    } catch (err: any) {
      console.error("Error creating order:", err);
      toast.error(err.response?.data?.message || "Failed to create order");
    } finally {
      setProcessing(false);
    }
  };

  // Copy serial number to clipboard
  const handleCopySerial = (serial: string) => {
    navigator.clipboard.writeText(serial);
    setCopiedSerial(serial);
    setTimeout(() => setCopiedSerial(null), 2000);
    toast.success("Serial number copied!");
  };

  // Copy all serial numbers
  const handleCopyAllSerials = () => {
    if (!completedOrder) return;
    const serials = completedOrder.items
      .filter((item: any) => item.serialNumber)
      .map(
        (item: any) =>
          `${item.menuItemName} - ${item.sizeName || ''}: ${item.serialNumber}`,
      )
      .join("\n");
    navigator.clipboard.writeText(serials);
    toast.success("All serial numbers copied!");
  };

  return (
    <PageContainer>
      <PageHeader
        title="POS"
        subtitle="Point of Sale System"
        onRefresh={() => fetchProducts(currentPage)}
      />

      <div className="flex flex-col lg:flex-row h-[calc(100vh-160px)] lg:h-[calc(100vh-140px)] gap-space-4 relative font-ui-body overflow-hidden">
        {/* Left Side - Product Catalog */}
        <div className="flex-1 flex flex-col bg-admin-bg transition-all duration-300 min-h-0">
          <Card className="border border-admin-border bg-admin-surface m-0 flex-1 flex flex-col overflow-hidden rounded-xl shadow-admin-sm">
            <CardContent className="p-0 flex flex-col h-full overflow-hidden">
              {/* Category tabs */}
              <div className="flex border-b border-admin-border bg-admin-surface overflow-x-auto no-scrollbar shrink-0">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-6 py-4 font-ui-heading text-sm font-bold flex-shrink-0 transition-colors ${
                    selectedCategory === "all"
                      ? "text-roast border-b-2 border-roast bg-foam/50"
                      : "text-on-surface-variant hover:bg-admin-bg"
                  }`}
                >
                  All Items
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-6 py-4 font-ui-heading text-sm font-bold flex-shrink-0 transition-colors ${
                      selectedCategory === cat.id
                        ? "text-roast border-b-2 border-roast bg-foam/50"
                        : "text-on-surface-variant hover:bg-admin-bg"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Search and Pagination bar */}
              <div className="p-space-4 border-b border-admin-border bg-admin-surface flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dust" />
                  <Input
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-admin-border focus:ring-1 focus:ring-roast focus:border-roast rounded-lg h-10 shadow-sm text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-lg h-10 w-10 border-admin-border hover:bg-foam hover:border-caramel transition-all duration-200 shadow-sm"
                  >
                    <QrCode className="w-4 h-4 text-roast" />
                  </Button>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-1 bg-foam border border-admin-border rounded-lg p-0.5 shadow-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-roast hover:bg-white rounded transition-colors"
                        onClick={() => fetchProducts(currentPage - 1)}
                        disabled={currentPage === 0 || loading}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-xs text-roast font-bold px-2 min-w-[70px] text-center">
                        {currentPage + 1} / {totalPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-roast hover:bg-white rounded transition-colors"
                        onClick={() => fetchProducts(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1 || loading}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Products Grid - Scrollable Area */}
              <div className="flex-1 overflow-y-auto p-space-4 bg-admin-bg">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-cream flex items-center justify-center animate-pulse">
                      <Loader2 className="w-8 h-8 animate-spin text-roast" />
                    </div>
                    <span className="mt-4 text-dust font-medium text-sm">
                      Loading products...
                    </span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-error bg-error-container/20 border border-error-container/40 rounded-xl text-sm font-semibold">
                    {error}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-4">
                      {products
                        .sort((a, b) => {
                          if (a.id === expandedProductId) return -1;
                          if (b.id === expandedProductId) return 1;
                          return 0;
                        })
                        .map((product) => {
                          const isExpanded = expandedProductId === product.id;
                          return (
                            <Card
                              key={product.id}
                              className={`group relative cursor-pointer hover:shadow-md transition-all duration-200 rounded-xl border border-admin-border overflow-hidden bg-white ${
                                isExpanded
                                  ? "col-span-1 sm:col-span-2 lg:col-span-3 ring-2 ring-roast"
                                  : "hover:border-caramel"
                              }`}
                              onClick={() => handleProductClick(product)}
                            >
                              <CardContent className="p-0 flex flex-col h-full">
                                {!isExpanded ? (
                                  <>
                                    <div className="h-28 w-full overflow-hidden bg-mist relative">
                                      {product.categoryName && (
                                        <Badge className="absolute top-2 left-2 bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border border-on-secondary-container/20">
                                          {product.categoryName}
                                        </Badge>
                                      )}
                                      {product.imageUrl ? (
                                        <img
                                          src={product.imageUrl}
                                          alt={product.name}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl bg-mist">
                                          📦
                                        </div>
                                      )}
                                    </div>
                                    <div className="p-3 flex-1 flex flex-col justify-between bg-white w-full">
                                      <h3 className="font-ui-heading text-xs text-on-surface line-clamp-2 font-bold">
                                        {product.name}
                                      </h3>
                                      <div className="mt-2 flex justify-between items-center">
                                        <span className="font-ui-body text-[10px] text-dust">
                                          {product.variants?.length || 0} variant(s)
                                        </span>
                                        <div className="w-6 h-6 rounded-full bg-admin-bg flex items-center justify-center border border-admin-border group-hover:bg-caramel group-hover:text-white group-hover:border-caramel transition-colors">
                                          <Plus className="w-3.5 h-3.5" />
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex flex-col w-full p-4 bg-white rounded-xl">
                                    {/* Fixed Header */}
                                    <div className="flex items-start justify-between mb-4 pb-4 border-b border-admin-border flex-shrink-0">
                                      <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 bg-mist rounded flex items-center justify-center overflow-hidden flex-shrink-0 border border-admin-border">
                                          {product.imageUrl ? (
                                            <img
                                              src={product.imageUrl}
                                              alt={product.name}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <span className="text-3xl">📦</span>
                                          )}
                                        </div>
                                        <div>
                                          <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border border-on-secondary-container/20 inline-block mb-2">
                                            {product.categoryName || "Product"}
                                          </span>
                                          <h3 className="font-ui-heading font-bold text-base text-ink">
                                            {product.name}
                                          </h3>
                                          <p className="text-xs text-dust">
                                            {product.variants?.length || 0} variant(s) available
                                          </p>
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full hover:bg-admin-bg text-dust hover:text-ink"
                                        onClick={(e: React.MouseEvent) => {
                                          e.stopPropagation();
                                          setExpandedProductId(null);
                                        }}
                                      >
                                        <X className="w-5 h-5" />
                                      </Button>
                                    </div>

                                    {/* Scrollable Variants Grid */}
                                    <div className="overflow-y-auto flex-1 max-h-[300px]">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pr-2">
                                        {product.variants?.map((variant: ProductVariant) => (
                                          <div
                                            key={variant.id}
                                            className="border border-admin-border rounded-lg p-3 hover:border-caramel hover:bg-foam transition-colors cursor-pointer flex flex-col justify-between min-h-[120px]"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleAddVariantToCart(variant, product);
                                            }}
                                          >
                                            <div>
                                              <h4 className="font-ui-heading font-bold text-xs mb-1 text-ink line-clamp-2">
                                                {variant.variantName}
                                              </h4>
                                              <p className="text-[10px] text-dust mb-2">
                                                SKU: {variant.sku}
                                              </p>
                                              {variant.variantSpecs && (
                                                <p className="text-[10px] text-dust/85 mb-2 line-clamp-1">
                                                  {variant.variantSpecs}
                                                </p>
                                              )}
                                            </div>
                                            <div className="mt-2 pt-2 border-t border-admin-border border-dashed">
                                              <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-roast">
                                                  {variant.sellingPrice?.toLocaleString() || "0"}đ
                                                </span>
                                                <Button
                                                  size="sm"
                                                  className="bg-roast hover:bg-espresso text-white text-[10px] h-6 px-2 flex items-center justify-center gap-1 rounded"
                                                  onClick={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    handleAddVariantToCart(variant, product);
                                                  }}
                                                >
                                                  <Plus className="w-3 h-3" />
                                                  Add
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      {(!product.variants || product.variants.length === 0) && (
                                        <div className="text-center py-6 text-dust">
                                          No variants available
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                    {products.length === 0 && (
                      <div className="text-center py-12 text-dust text-sm">
                        No products found
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toggle Cart Button */}
        <Button
          variant="outline"
          size="icon"
          className={`absolute top-4 z-10 bg-white border border-admin-border shadow-md rounded-xl hover:bg-foam hover:border-caramel transition-all duration-200 ${
            isCartVisible ? "right-4 lg:right-[466px]" : "right-4"
          }`}
          onClick={() => setIsCartVisible(!isCartVisible)}
        >
          {isCartVisible ? (
            <ChevronRight className="w-4 h-4 text-roast" />
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 text-roast" />
              {orderItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-roast text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {orderItems.length}
                </span>
              )}
            </>
          )}
        </Button>

        {/* Backdrop for mobile when cart is visible */}
        {isCartVisible && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setIsCartVisible(false)}
          />
        )}

        {/* Right Side - Cart & Checkout */}
        <div
          className={`bg-admin-surface transition-all duration-300 flex flex-col shadow-admin-sm overflow-hidden h-full z-30 fixed lg:relative right-0 top-0 bottom-0 lg:rounded-xl ${
            isCartVisible ? "w-full sm:w-[450px] border-l border-admin-border shadow-2xl" : "w-0 border-none"
          }`}
        >
          {isCartVisible && (
            <>
              {/* Cart Header */}
              <div className="p-space-4 border-b border-admin-border flex justify-between items-center shrink-0 bg-white">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-roast" />
                  <h2 className="font-ui-heading text-lg font-bold text-ink">
                    Current Order
                  </h2>
                  {orderItems.length > 0 && (
                    <span className="bg-foam text-roast text-xs font-bold px-2 py-0.5 rounded-full border border-admin-border ml-2">
                      Ticket #{orderItems.length}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {orderItems.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-dust hover:text-error hover:bg-error-container/50 rounded-lg transition-colors"
                      onClick={() => {
                        setOrderItems([]);
                        setAppliedPromotions([]);
                        setDiscountCalculation(null);
                        setVoucherCode("");
                        toast.success("Cart cleared");
                      }}
                      title="Clear Order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-dust hover:bg-admin-bg hover:text-ink transition-colors"
                    onClick={() => setIsCartVisible(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Customer Section */}
              <div className="p-space-4 border-b border-admin-border bg-foam/30 shrink-0">
                <Label className="text-xs font-bold text-dust uppercase tracking-wider mb-2 block">
                  Customer Info
                </Label>
                <div className="flex gap-1.5 mb-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dust" />
                    <Input
                      placeholder="Find Customer (Name, Phone, Email)"
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setShowCustomerDropdown(true);
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCustomerLookup();
                        }
                      }}
                      className="pl-9 pr-8 bg-white border-admin-border focus:ring-1 focus:ring-roast focus:border-roast rounded-lg shadow-sm text-sm"
                    />
                    {selectedCustomer && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-lg hover:bg-admin-bg text-dust"
                        onClick={handleClearCustomer}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                  <Button
                    onClick={handleCustomerLookup}
                    className="bg-roast hover:bg-espresso text-white text-xs px-2.5 rounded-lg h-10"
                  >
                    Tra cứu
                  </Button>
                </div>

                {/* Customer Dropdown */}
                {showCustomerDropdown && customerSearch && !selectedCustomer && (
                  <div className="absolute z-20 w-[416px] bg-white border border-admin-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="p-3 hover:bg-foam cursor-pointer border-b border-admin-border last:border-b-0"
                          onClick={() => handleSelectCustomer(customer)}
                        >
                          <div className="font-bold text-sm text-ink">
                            {customer.fullName}
                          </div>
                          <div className="text-xs text-dust">
                            {customer.phone || "No phone"} • {customer.email || "No email"}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-sm text-dust">
                        No customers found
                      </div>
                    )}
                  </div>
                )}

                {/* Guest Phone Input */}
                {!selectedCustomer ? (
                  <div className="space-y-1">
                    <Input
                      placeholder="Guest Phone Number *"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="bg-white border-admin-border focus:ring-1 focus:ring-roast focus:border-roast text-sm"
                    />
                    <p className="text-[10px] text-dust">
                      Required for guest checkout
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-white border border-admin-border p-2.5 rounded-lg flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-roast font-bold text-xs">
                          {selectedCustomer.fullName[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-ink">{selectedCustomer.fullName}</div>
                          <div className="text-[10px] text-dust">
                            Tier: {selectedCustomer.tier?.name || "Standard"} ({selectedCustomer.tier?.discountRate || 0}% off)
                          </div>
                        </div>
                      </div>
                      <span className="text-xs bg-foam text-roast px-2 py-0.5 rounded-full border border-admin-border font-medium">
                        {selectedCustomer.loyaltyPoint?.pointsAvailable ?? 0} pts
                      </span>
                    </div>

                    {/* Loyalty points discount control */}
                    {(selectedCustomer.loyaltyPoint?.pointsAvailable ?? 0) > 0 && (
                      <div className="bg-white border border-admin-border rounded-lg p-2.5 space-y-1.5 shadow-sm">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-semibold text-roast">Use Loyalty Points (1 pt = 1,000đ)</span>
                          <span className="text-dust">Available: {selectedCustomer.loyaltyPoint?.pointsAvailable} pts</span>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Points to use"
                            value={loyaltyPointsUsed || ""}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              const maxPoints = selectedCustomer.loyaltyPoint?.pointsAvailable || 0;
                              // Cap points so discount doesn't exceed subtotal
                              const maxPointsForTotal = Math.ceil(subtotal / 1000);
                              const cappedVal = Math.max(0, Math.min(val, maxPoints, maxPointsForTotal));
                              setLoyaltyPointsUsed(cappedVal);
                            }}
                            className="bg-white border-admin-border text-xs h-7 py-0.5 px-2 flex-1"
                          />
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => {
                              if (loyaltyPointsUsed > 0) {
                                toast.success(`Applied ${loyaltyPointsUsed} points (${(loyaltyPointsUsed * 1000).toLocaleString()}đ discount)`);
                              }
                            }}
                            className="bg-roast hover:bg-espresso text-white text-[10px] h-7 px-2"
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Scrollable Cart Content */}
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 bg-admin-bg">
                {orderItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-dust">
                    <ShoppingCart className="w-8 h-8 mb-2 opacity-40" />
                    <span className="text-xs">No items in cart</span>
                  </div>
                ) : (
                  orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-3 rounded-lg border border-admin-border shadow-sm flex flex-col gap-2 relative group cursor-pointer hover:border-caramel transition-colors"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 pr-2 min-w-0">
                          <h4 className="font-ui-heading text-sm text-on-surface font-bold truncate">
                            {item.product}
                          </h4>
                          <p className="text-xs text-dust mt-0.5">
                            SKU: {item.sku || "N/A"}
                          </p>
                          {item.notes && (
                            <p className="text-xs italic text-orange-600 mt-1">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                        <span className="font-ui-body text-sm text-roast font-bold">
                          {(item.price * item.quantity).toLocaleString()}đ
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-admin-border border-dashed">
                        <button
                          className="text-xs text-red-600 font-medium flex items-center gap-1 hover:text-red-800"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                        {/* Quantity Control */}
                        <div className="flex items-center bg-admin-bg rounded-lg border border-admin-border p-0.5">
                          <button
                            className="w-7 h-7 flex items-center justify-center text-dust hover:text-roast hover:bg-white rounded transition-colors"
                            onClick={() => handleQuantityChange(item.id, -1)}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-ui-heading text-sm text-on-surface font-bold">
                            {item.quantity}
                          </span>
                          <button
                            className="w-7 h-7 flex items-center justify-center text-dust hover:text-roast hover:bg-white rounded transition-colors"
                            onClick={() => handleQuantityChange(item.id, 1)}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Order Summary & Checkout (Fixed Bottom) */}
              <div className="bg-white border-t border-admin-border p-3 shrink-0 flex flex-col gap-3">
                {/* Promotions / Voucher input */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowVoucherModal(true)}
                    className="w-full bg-white border-admin-border border-dashed hover:border-roast hover:bg-cream text-roast text-xs font-bold py-2 h-auto"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Select or Enter Voucher
                  </Button>
                  {appliedPromotions.length > 0 && (
                    <div className="space-y-1">
                      {appliedPromotions.map((promo) => (
                        <div
                          key={promo.promotionId}
                          className="flex items-center justify-between bg-foam border border-admin-border p-2 rounded-lg"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-roast bg-cream border border-admin-border px-1.5 py-0.5 rounded uppercase">
                              {promo.promotionCode}
                            </span>
                            <span className="text-xs text-dust">
                              -{promo.discountAmount.toLocaleString()}đ
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-red-600 hover:bg-red-50"
                            onClick={() => handleRemovePromotion(promo.promotionCode)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-dust">
                    <span>Subtotal ({orderItems.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                    <span className="font-semibold text-ink">{subtotal.toLocaleString()}đ</span>
                  </div>
                  {tierDiscount > 0 && (
                    <div className="flex justify-between text-xs text-caramel">
                      <span>Tier Discount ({selectedCustomer?.tier?.discountRate || 0}%)</span>
                      <span className="font-semibold">-{tierDiscount.toLocaleString()}đ</span>
                    </div>
                  )}
                  {promotionDiscount > 0 && (
                    <div className="flex justify-between text-xs text-caramel">
                      <span>Promotion Discount</span>
                      <span className="font-semibold">-{promotionDiscount.toLocaleString()}đ</span>
                    </div>
                  )}
                  {loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-xs text-caramel">
                      <span>Loyalty Points Discount ({loyaltyPointsUsed} pts)</span>
                      <span className="font-semibold">-{loyaltyDiscount.toLocaleString()}đ</span>
                    </div>
                  )}
                  <div className="border-t border-admin-border pt-2 mt-2 flex justify-between items-end">
                    <span className="font-ui-body text-sm font-bold text-ink">Total</span>
                    <span className="font-pos-total text-2xl text-roast font-bold">
                      {total.toLocaleString()}đ
                    </span>
                  </div>
                </div>

                {/* Serving Method & Payment Methods & CTA */}
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-smoke uppercase tracking-wider mb-1.5">Hình thức phục vụ</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setOrderServeType("DINE_IN")}
                        className={`flex-1 py-1.5 text-center font-ui-heading text-xs font-bold rounded-lg border transition-all ${
                          orderServeType === "DINE_IN"
                            ? "bg-roast text-white border-roast shadow-sm"
                            : "bg-foam text-roast border-admin-border hover:bg-cream"
                        }`}
                      >
                        Tại chỗ (Dine-in)
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderServeType("TAKE_AWAY")}
                        className={`flex-1 py-1.5 text-center font-ui-heading text-xs font-bold rounded-lg border transition-all ${
                          orderServeType === "TAKE_AWAY"
                            ? "bg-roast text-white border-roast shadow-sm"
                            : "bg-foam text-roast border-admin-border hover:bg-cream"
                        }`}
                      >
                        Mang về (Take-away)
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-smoke uppercase tracking-wider mb-1.5">Phương thức thanh toán</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(["CASH", "QR"] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`py-2 px-1 text-center font-ui-heading text-xs font-bold rounded-lg border transition-all ${
                            paymentMethod === method
                              ? "bg-roast text-white border-roast shadow-sm"
                              : "bg-foam text-roast border-admin-border hover:bg-cream"
                          }`}
                        >
                          {method === "CASH" ? "Tiền mặt" : "QR Code"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full bg-roast hover:bg-espresso text-white py-6 rounded-lg font-ui-heading text-sm font-bold shadow-md transition-colors flex justify-between items-center px-4"
                    onClick={handleProceed}
                    disabled={processing || orderItems.length === 0 || !paymentMethod || (!selectedCustomer && !guestPhone.trim())}
                  >
                    <span>Confirm Order</span>
                    <div className="flex items-center gap-2">
                      <span>{total.toLocaleString()}đ</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-admin-border">
            {/* Header */}
            <div className="bg-roast text-white p-6 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-cream" />
                  <div>
                    <h2 className="text-xl font-bold font-ui-heading">Confirm Order</h2>
                    <p className="text-cream/80 text-xs">
                      Please review the order details before confirming
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => setShowConfirmation(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Customer Info */}
              <div className="p-4 bg-foam border border-admin-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-roast" />
                  <h3 className="font-bold text-ink text-sm font-ui-heading">
                    Customer Information
                  </h3>
                </div>
                {selectedCustomer ? (
                  <div className="space-y-1 text-xs text-ink">
                    <p>
                      <span className="text-dust">Name:</span>{" "}
                      <span className="font-semibold">{selectedCustomer.fullName}</span>
                    </p>
                    <p>
                      <span className="text-dust">Phone:</span>{" "}
                      <span className="font-semibold">{selectedCustomer.phone}</span>
                    </p>
                    {selectedCustomer.email && (
                      <p>
                        <span className="text-dust">Email:</span>{" "}
                        <span className="font-semibold">{selectedCustomer.email}</span>
                      </p>
                    )}
                    {selectedCustomer.tier && (
                      <p>
                        <span className="text-dust">Tier:</span>{" "}
                        <Badge className="ml-1 bg-roast text-white">
                          {selectedCustomer.tier.name}
                        </Badge>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-ink">
                    <p>
                      <span className="text-dust">Guest Phone:</span>{" "}
                      <span className="font-semibold">{guestPhone}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 text-roast" />
                  <h3 className="font-bold text-ink text-sm font-ui-heading">
                    Order Items ({orderItems.length})
                  </h3>
                </div>
                <div className="border border-admin-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-foam">
                        <TableHead className="font-bold text-roast">Product</TableHead>
                        <TableHead className="text-center font-bold text-roast">Qty</TableHead>
                        <TableHead className="text-right font-bold text-roast">Price</TableHead>
                        <TableHead className="text-right font-bold text-roast">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item) => (
                        <TableRow key={item.id} className="border-b border-admin-border last:border-b-0">
                          <TableCell>
                            <div>
                              <p className="font-bold text-xs text-ink">
                                {item.product}
                              </p>
                              <p className="text-[10px] text-dust">
                                {item.sku}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-xs text-ink">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right text-xs text-ink">
                            {item.price.toLocaleString()}đ
                          </TableCell>
                          <TableCell className="text-right font-bold text-xs text-roast">
                            {(item.price * item.quantity).toLocaleString()}đ
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Payment Details */}
              <div className="p-4 bg-foam border border-admin-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-roast" />
                  <h3 className="font-bold text-ink text-sm font-ui-heading">
                    Payment Details
                  </h3>
                </div>
                <div className="text-xs space-y-1 text-ink">
                  <p>
                    <span className="text-dust">Payment Method:</span>{" "}
                    <Badge variant="outline" className="ml-1 border-roast text-roast font-bold">
                      {paymentMethod === "CASH" ? "Tiền mặt" : paymentMethod === "QR" ? "QR Code" : paymentMethod}
                    </Badge>
                  </p>
                  <p>
                    <span className="text-dust">Order Type:</span>{" "}
                    <Badge variant="outline" className="ml-1 border-roast text-roast font-bold">
                      In-Store (OFFLINE)
                    </Badge>
                  </p>
                  <p>
                    <span className="text-dust">Serving Method:</span>{" "}
                    <Badge variant="outline" className="ml-1 border-roast text-roast font-bold">
                      {orderServeType === "DINE_IN" ? "Tại chỗ (Dine-in)" : "Mang đi (Take-away)"}
                    </Badge>
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-cream rounded-lg border border-admin-border">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-ink">
                    <span className="text-dust">Subtotal:</span>
                    <span className="font-semibold">
                      {subtotal.toLocaleString()}đ
                    </span>
                  </div>
                  {tierDiscount > 0 && (
                    <div className="flex justify-between text-xs text-caramel">
                      <span>
                        Tier Discount ({selectedCustomer?.tier?.discountRate}%):
                      </span>
                      <span className="font-semibold">-{tierDiscount.toLocaleString()}đ</span>
                    </div>
                  )}
                  {promotionDiscount > 0 && (
                    <div className="flex justify-between text-xs text-caramel">
                      <span>Promotion Discount:</span>
                      <span className="font-semibold">-{promotionDiscount.toLocaleString()}đ</span>
                    </div>
                  )}
                  {appliedPromotions.length > 0 && (
                    <div className="text-[10px] text-dust">
                      Applied:{" "}
                      {appliedPromotions.map((p) => p.promotionCode).join(", ")}
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-admin-border">
                    <span className="text-ink">Total Amount:</span>
                    <span className="text-roast text-base">
                      {total.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-foam border-t border-admin-border flex gap-4 shrink-0">
              <Button
                variant="outline"
                className="flex-1 border-admin-border text-roast hover:bg-cream"
                onClick={() => setShowConfirmation(false)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Edit
              </Button>
              <Button
                className="flex-1 bg-roast hover:bg-espresso text-white font-bold"
                onClick={handleConfirmOrder}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm & Create
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Drink Customization Dialog */}
      <Dialog open={isCustomizeModalOpen} onOpenChange={setIsCustomizeModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col border border-admin-border bg-white rounded-xl p-0">
          <DialogHeader className="flex-shrink-0 p-6 border-b border-admin-border">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-lg font-bold font-ui-heading text-ink">
                  {customizingProduct?.name || "Tùy chỉnh sản phẩm"}
                </DialogTitle>
                <DialogDescription className="text-xs text-dust mt-1">
                  Chọn size, topping và các tùy chọn hương vị cho đồ uống của bạn.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {isLoadingProduct ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-roast animate-spin" />
              <span className="text-xs text-dust mt-2">Đang tải cấu hình sản phẩm...</span>
            </div>
          ) : customizingProduct && (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Variant / Size list */}
                {customizingProduct.variants && customizingProduct.variants.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-dust uppercase tracking-wider">
                      Chọn Kích cỡ / Size
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {customizingProduct.variants.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                            selectedVariant?.id === v.id
                              ? "bg-roast text-white border-roast shadow-sm"
                              : "bg-foam text-roast border-admin-border hover:bg-cream"
                          }`}
                        >
                          {v.variantName} (+{(v.sellingPrice || 0).toLocaleString()}đ)
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Option Groups */}
                {customizingProduct.optionGroups?.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <Label className="text-xs font-bold text-dust uppercase tracking-wider">
                      {group.name}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {group.values.map((val) => (
                        <button
                          key={val.id}
                          type="button"
                          onClick={() => {
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [group.id]: val.id,
                            }));
                          }}
                          className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                            selectedOptions[group.id] === val.id
                              ? "bg-roast text-white border-roast shadow-sm"
                              : "bg-foam text-roast border-admin-border hover:bg-cream"
                          }`}
                        >
                          {val.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Toppings list */}
                {customizingProduct.availableToppings && customizingProduct.availableToppings.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-dust uppercase tracking-wider">
                      Topping (Có thể chọn nhiều)
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {customizingProduct.availableToppings.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          disabled={t.available === false}
                          onClick={() => toggleTopping(t.id)}
                          className={`p-3 text-left rounded-lg border transition-all flex justify-between items-center ${
                            t.available === false
                              ? "bg-foam/30 text-dust border-admin-border cursor-not-allowed opacity-60"
                              : selectedToppings.has(t.id)
                                ? "bg-foam text-roast border-roast shadow-sm"
                                : "bg-white text-ink border-admin-border hover:bg-foam/20"
                          }`}
                        >
                          <span className="text-xs font-semibold">{t.name}</span>
                          <span className="text-[10px] font-bold">
                            +{t.extraPrice.toLocaleString()}đ
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Instructions / Notes */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-dust uppercase tracking-wider">
                    Ghi chú đặc biệt
                  </Label>
                  <Input
                    placeholder="Ví dụ: Ít đá, nhiều sữa, không đường..."
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="bg-white border-admin-border focus:ring-1 focus:ring-roast focus:border-roast text-xs"
                  />
                </div>

                {/* Quantity Control */}
                <div className="flex items-center justify-between border-t border-admin-border pt-4">
                  <Label className="text-xs font-bold text-dust uppercase tracking-wider">
                    Số lượng
                  </Label>
                  <div className="flex items-center bg-admin-bg rounded-lg border border-admin-border p-0.5">
                    <button
                      type="button"
                      className="w-8 h-8 flex items-center justify-center text-dust hover:text-roast hover:bg-white rounded transition-colors"
                      onClick={() => setCustomizationQuantity(Math.max(1, customizationQuantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-ui-heading text-sm text-on-surface font-bold">
                      {customizationQuantity}
                    </span>
                    <button
                      type="button"
                      className="w-8 h-8 flex items-center justify-center text-dust hover:text-roast hover:bg-white rounded transition-colors"
                      onClick={() => setCustomizationQuantity(customizationQuantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-foam border-t border-admin-border flex gap-4 shrink-0 justify-end">
                <Button
                  variant="outline"
                  className="border-admin-border text-roast hover:bg-cream text-xs"
                  onClick={() => setIsCustomizeModalOpen(false)}
                >
                  Hủy bỏ
                </Button>
                <Button
                  className="bg-roast hover:bg-espresso text-white font-bold text-xs"
                  onClick={handleSaveCustomization}
                >
                  Thêm vào giỏ
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Success Dialog with Serial Numbers */}
      <Dialog open={showOrderSuccess} onOpenChange={setShowOrderSuccess}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-admin-border bg-white rounded-xl">
          <DialogHeader className="flex-shrink-0 p-6 border-b border-admin-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center border border-admin-border">
                <CheckCircle className="w-6 h-6 text-roast" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold font-ui-heading text-ink">
                  Order Created Successfully!
                </DialogTitle>
                <p className="text-xs text-dust mt-1">
                  Order #{completedOrder?.orderNumber}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {completedOrder && (
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-foam border border-admin-border rounded-lg p-4">
                  <h3 className="font-bold text-ink text-sm mb-3 font-ui-heading">
                    Order Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs text-ink">
                    <div>
                      <span className="text-dust">Customer:</span>
                      <p className="font-semibold">
                        {completedOrder.customerName || "Guest"}
                      </p>
                    </div>
                    <div>
                      <span className="text-dust">Phone:</span>
                      <p className="font-semibold">
                        {completedOrder.customerPhone || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-dust">Payment Method:</span>
                      <p className="font-semibold capitalize">
                        {completedOrder.paymentMethod?.toLowerCase() || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-dust">Total Amount:</span>
                      <p className="font-bold text-roast">
                        {completedOrder.finalAmount?.toLocaleString() || 0}đ
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items with Serial Numbers */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-ink text-sm font-ui-heading">
                      Items to Pick ({completedOrder.items?.length || 0})
                    </h3>
                    {completedOrder.items?.some(
                      (item: any) => (item as any).serialNumber,
                    ) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-admin-border text-roast hover:bg-cream text-xs h-8"
                        onClick={handleCopyAllSerials}
                      >
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copy All Serials
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {completedOrder.items?.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="border border-admin-border rounded-lg p-4 bg-white shadow-sm"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-foam border border-admin-border rounded flex items-center justify-center flex-shrink-0">
                            {(item as any).productImage ? (
                              <img
                                src={(item as any).productImage}
                                alt={item.menuItemName}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-dust" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-ink truncate">
                              {item.menuItemName}
                            </h4>
                            <p className="text-xs text-dust">
                              {item.sizeName}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-[10px]">
                              <span className="text-dust">
                                SKU:{" "}
                                <span className="font-mono font-semibold">{(item as any).sku || '-'}</span>
                              </span>
                              <span className="text-dust">
                                Qty:{" "}
                                <span className="font-bold text-ink">
                                  {item.quantity}
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-xs text-ink">
                              {item.subtotal?.toLocaleString() || 0}đ
                            </p>
                            <p className="text-[10px] text-dust">
                              {item.unitPrice?.toLocaleString()}đ × {item.quantity}
                            </p>
                          </div>
                        </div>

                        {/* Serial Number - Highlighted */}
                        {(item as any).serialNumber && (
                          <div className="mt-3 pt-3 border-t border-admin-border">
                            <div className="flex items-center justify-between bg-foam border border-admin-border rounded-lg px-4 py-3">
                              <div>
                                <p className="text-[10px] text-roast font-bold mb-1">
                                  📦 SERIAL NUMBER (Pick this item)
                                </p>
                                <p className="font-mono text-base font-bold text-roast">
                                  {(item as any).serialNumber}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-4 border-admin-border text-roast hover:bg-cream"
                                onClick={() =>
                                  handleCopySerial((item as any).serialNumber!)
                                }
                              >
                                {copiedSerial === (item as any).serialNumber ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 mr-1.5 text-green-600 font-bold" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                                    Copy
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Warranty info if available */}
                        {(item as any).warrantyExpireDate && (
                          <div className="mt-2 text-[10px] text-dust">
                            Warranty until:{" "}
                            {new Date(
                              (item as any).warrantyExpireDate,
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Points Earned */}
                {((completedOrder as any).loyaltyPointsEarned ?? 0) > 0 && (
                  <div className="bg-foam border border-admin-border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎉</span>
                      <div>
                        <p className="font-bold text-roast text-sm font-ui-heading">
                          +{(completedOrder as any).loyaltyPointsEarned} Points Earned!
                        </p>
                        <p className="text-xs text-dust">
                          Customer loyalty points have been added
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex-shrink-0 p-6 border-t border-admin-border bg-foam flex gap-2 sm:gap-2 justify-end">
            <Button variant="outline" className="border-admin-border text-roast hover:bg-cream" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
            <Button
              className="bg-roast hover:bg-espresso text-white font-bold"
              onClick={() => {
                setShowOrderSuccess(false);
                setCompletedOrder(null);
              }}
            >
              Done - New Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Voucher Selection Dialog */}
      <Dialog open={showVoucherModal} onOpenChange={setShowVoucherModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col border border-admin-border bg-white rounded-xl p-0">
          <DialogHeader className="flex-shrink-0 p-6 border-b border-admin-border">
            <DialogTitle className="text-lg font-bold font-ui-heading text-ink">
              Select or Enter Voucher
            </DialogTitle>
            <DialogDescription className="text-xs text-dust mt-1">
              Choose an active promotion or enter your custom voucher code manually.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-admin-bg">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-dust uppercase tracking-wider">
                Manual Code
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Voucher Code"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="bg-white border-admin-border focus:ring-1 focus:ring-roast focus:border-roast text-sm"
                />
                <Button
                  onClick={() => {
                    handleApplyPromotion();
                    setShowVoucherModal(false);
                  }}
                  disabled={applyingPromotion || !voucherCode.trim()}
                  className="bg-roast hover:bg-espresso text-white text-xs px-4"
                >
                  Apply
                </Button>
              </div>
            </div>

            {myVouchers.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-bold text-dust uppercase tracking-wider">
                  Vouchers của {selectedCustomer?.fullName}
                </Label>
                <div className="space-y-2">
                  {myVouchers.map((voucher) => (
                    <div
                      key={voucher.id}
                      className="p-3 bg-white border border-admin-border rounded-lg hover:border-roast cursor-pointer transition-colors flex items-center justify-between"
                      onClick={() => {
                        setVoucherCode(voucher.code);
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-ink">{voucher.name}</span>
                        <span className="text-[10px] text-dust font-mono bg-foam px-1.5 py-0.5 rounded w-fit mt-1 uppercase border border-admin-border">
                          {voucher.code}
                        </span>
                      </div>
                      <span className="text-roast font-bold text-xs">
                        {voucher.discountType === "PERCENTAGE"
                          ? `-${voucher.discountValue}%`
                          : `-${voucher.discountValue.toLocaleString()}đ`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePromotions.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-bold text-dust uppercase tracking-wider">
                  Active Promotions
                </Label>
                <div className="space-y-2">
                  {activePromotions.map((promo) => (
                    <div
                      key={promo.id}
                      className="p-3 bg-white border border-admin-border rounded-lg hover:border-roast cursor-pointer transition-colors flex items-center justify-between"
                      onClick={() => {
                        setVoucherCode(promo.code);
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-ink">{promo.name}</span>
                        <span className="text-[10px] text-dust font-mono bg-foam px-1.5 py-0.5 rounded w-fit mt-1 uppercase border border-admin-border">
                          {promo.code}
                        </span>
                      </div>
                      <span className="text-roast font-bold text-xs">
                        {promo.discountType === "PERCENTAGE"
                          ? `-${promo.discountValue}%`
                          : `-${promo.discountValue.toLocaleString()}đ`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="p-4 border-t border-admin-border bg-white">
            <Button
              variant="outline"
              className="w-full text-xs text-roast border-admin-border hover:bg-cream"
              onClick={() => setShowVoucherModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
