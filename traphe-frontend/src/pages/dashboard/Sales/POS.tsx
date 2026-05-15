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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/dialog";
import {
  promotionService,
  type CartDiscountCalculationResponse,
} from "@/services/promotion.service";
import { customerService } from "@/services/customer.service";
import type { Customer } from "@/types/customer.types";

interface OrderItem {
  id: string;
  productVariantId: string;
  product: string;
  sku: string;
  price: number;
  available: number;
  quantity: number;
  image: string;
}

interface AppliedPromotion {
  promotionId: string;
  promotionCode: string;
  discountAmount: number;
}

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categorySearch, setCategorySearch] = useState("");
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
    useState<CartDiscountCalculationResponse | null>(null);
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
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;

  // Order success dialog state
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderResponse | null>(
    null,
  );
  const [copiedSerial, setCopiedSerial] = useState<string | null>(null);

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
      setTotalElements(response.data?.totalElements || 0);
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

  // Fetch data on component mount
  useEffect(() => {
    fetchProducts(0);
    fetchCategories();
    fetchCustomers();
  }, []);

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
  };

  // Handle product click - toggle expansion
  const handleProductClick = (product: Product) => {
    if (!product.variants || product.variants.length === 0) {
      toast.error("No variants available for this product");
      return;
    }
    setExpandedProductId(expandedProductId === product.id ? null : product.id);
  };

  // Add variant to cart
  const handleAddVariantToCart = (
    variant: ProductVariant,
    product: Product,
  ) => {
    const existingItem = orderItems.find(
      (item) => item.productVariantId === variant.id,
    );

    if (existingItem) {
      // Increase quantity if already in cart
      setOrderItems(
        orderItems.map((item) =>
          item.productVariantId === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
      toast.success(`Increased quantity of ${variant.variantName}`);
    } else {
      // Add new item to cart
      const newItem: OrderItem = {
        id: variant.id,
        productVariantId: variant.id,
        product: `${product.name} - ${variant.variantName}`,
        sku: variant.sku,
        price: variant.sellingPrice || 0,
        available: 999, // TODO: Get from inventory
        quantity: 1,
        image: product.imageUrl || "📦",
      };
      setOrderItems([...orderItems, newItem]);
      toast.success(`Added ${variant.variantName} to cart`);
    }
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

      const response = await promotionService.applyPromotionCode({
        items,
        code: voucherCode.trim(),
      });

      const calculation = (response.data as any)?.data || response.data;
      setDiscountCalculation(calculation);
      setAppliedPromotions(calculation.appliedPromotions || []);
      toast.success(`Promotion "${voucherCode}" applied successfully!`);
    } catch (err: any) {
      console.error("Error applying promotion:", err);
      toast.error(err.response?.data?.message || "Invalid promotion code");
    } finally {
      setApplyingPromotion(false);
    }
  };

  const handleRemovePromotion = async (promotionCode: string) => {
    setApplyingPromotion(true);
    try {
      const items = orderItems.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        unitPrice: item.price,
      }));

      // Remove the promotion
      const response = await promotionService.removePromotionCode({
        items,
        code: promotionCode,
      });

      const calculation = (response.data as any)?.data || response.data;
      setDiscountCalculation(calculation);
      setAppliedPromotions(calculation.appliedPromotions || []);

      // Clear voucher code if it matches
      if (voucherCode === promotionCode) {
        setVoucherCode("");
      }

      toast.success(`Promotion "${promotionCode}" removed`);
    } catch (err: any) {
      console.error("Error removing promotion:", err);
      toast.error(err.response?.data?.message || "Failed to remove promotion");
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

  // Total discount includes both promotion and tier discounts
  const promotionDiscount = discountCalculation?.totalDiscount || 0;
  const discount = promotionDiscount + tierDiscount;

  // Final total after all discounts
  const total = subtotal - discount;

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
      const items: OrderItemRequest[] = orderItems.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        unitPrice: item.price,
      }));

      const orderData: CreateOrderRequest = {
        customerId: selectedCustomer?.id || undefined,
        guestPhone: selectedCustomer ? undefined : guestPhone,
        items,
        orderType: "OFFLINE",
        paymentMethod: paymentMethod as "CASH" | "TRANSFER" | "COD",
        promotionIds: appliedPromotions.map((p) => p.promotionId),
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
      .filter((item) => item.serialNumber)
      .map(
        (item) =>
          `${item.productName} - ${item.variantName}: ${item.serialNumber}`,
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

      <div className="flex h-[calc(100vh-100px)] relative">
        {/* Left Side - Product Catalog */}
        <div className="flex-1 flex flex-col bg-slate-50/50 transition-all duration-300">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm m-4 flex-1 flex flex-col overflow-hidden rounded-2xl">
            <CardContent className="p-6 flex flex-col h-full">
              {/* Catalog Header */}
              <h2 className="text-lg font-semibold mb-4 text-slate-800">
                Catalog
              </h2>

              {/* Search and Filter */}
              <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Product Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg h-10 shadow-sm"
                  />
                </div>

                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[200px] bg-white border-slate-200 rounded-lg h-10 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                    <div className="px-2 pb-2 sticky top-0 bg-white border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400" />
                        <Input
                          placeholder="Search categories..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="pl-7 h-8 text-sm rounded-lg"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories
                      .filter((cat) =>
                        cat.name
                          .toLowerCase()
                          .includes(categorySearch.toLowerCase()),
                      )
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    {categories.filter((cat) =>
                      cat.name
                        .toLowerCase()
                        .includes(categorySearch.toLowerCase()),
                    ).length === 0 &&
                      categorySearch && (
                        <div className="px-2 py-6 text-center text-sm text-gray-500">
                          No categories found
                        </div>
                      )}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-lg h-10 w-10 border-slate-200 hover:bg-slate-50 hover:border-indigo-500 transition-all duration-200 shadow-sm"
                >
                  <QrCode className="w-4 h-4" />
                </Button>
              </div>

              {/* Products List - Scrollable Area */}
              <div className="flex-1 overflow-y-auto -mx-6 px-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center animate-pulse">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                    <span className="mt-4 text-slate-600 font-medium">
                      Loading products...
                    </span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500 bg-red-50 rounded-xl">
                    {error}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-slate-600">
                        Showing {products.length} of {totalElements} products
                      </p>
                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg hover:bg-slate-100 transition-colors"
                            onClick={() => fetchProducts(currentPage - 1)}
                            disabled={currentPage === 0 || loading}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <span className="text-sm text-slate-600 min-w-[80px] text-center font-medium">
                            Page {currentPage + 1} / {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg hover:bg-slate-100 transition-colors"
                            onClick={() => fetchProducts(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1 || loading}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {products
                        .sort((a, b) => {
                          // Put expanded product at the top
                          if (a.id === expandedProductId) return -1;
                          if (b.id === expandedProductId) return 1;
                          return 0;
                        })
                        .map((product) => {
                          const isExpanded = expandedProductId === product.id;
                          return (
                            <Card
                              key={product.id}
                              className={`relative cursor-pointer hover:shadow-xl transition-all duration-200 rounded-xl border-slate-200/60 ${
                                isExpanded
                                  ? "col-span-3 ring-2 ring-indigo-500"
                                  : "hover:border-indigo-200"
                              }`}
                              onClick={() => handleProductClick(product)}
                            >
                              <CardContent className="p-4">
                                {!isExpanded ? (
                                  // Collapsed view - show product only
                                  <>
                                    <div className="absolute top-2 left-2">
                                      <Badge className="bg-indigo-600 text-white rounded-full px-3">
                                        {product.categoryName || "Product"}
                                      </Badge>
                                    </div>
                                    <div className="flex flex-col items-center pt-8">
                                      <div className="w-24 h-24 bg-slate-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden border border-slate-200">
                                        {product.imageUrl ? (
                                          <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <span className="text-4xl">📦</span>
                                        )}
                                      </div>
                                      <h3 className="font-medium text-slate-800 text-center line-clamp-2">
                                        {product.name}
                                      </h3>
                                      <p className="text-xs text-slate-500 mt-1">
                                        {product.variants?.length || 0}{" "}
                                        variant(s)
                                      </p>
                                    </div>
                                    <Button
                                      size="icon"
                                      className="absolute bottom-2 right-2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleProductClick(product);
                                      }}
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </>
                                ) : (
                                  // Expanded view - show product with variants
                                  <div className="flex flex-col max-h-[600px]">
                                    {/* Fixed Header */}
                                    <div className="flex items-start justify-between mb-4 pb-4 border-b flex-shrink-0">
                                      <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
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
                                          <Badge className="bg-indigo-600 text-white mb-2">
                                            {product.categoryName || "Product"}
                                          </Badge>
                                          <h3 className="font-semibold text-lg text-gray-900">
                                            {product.name}
                                          </h3>
                                          <p className="text-sm text-gray-500">
                                            {product.variants?.length || 0}{" "}
                                            variant(s) available
                                          </p>
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setExpandedProductId(null);
                                        }}
                                      >
                                        <X className="w-5 h-5" />
                                      </Button>
                                    </div>

                                    {/* Scrollable Variants Grid */}
                                    <div className="overflow-y-auto flex-1">
                                      <div className="grid grid-cols-3 gap-3 pr-2">
                                        {product.variants?.map((variant) => (
                                          <div
                                            key={variant.id}
                                            className="border rounded-lg p-3 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleAddVariantToCart(
                                                variant,
                                                product,
                                              );
                                            }}
                                          >
                                            <div className="flex flex-col h-full">
                                              <h4 className="font-semibold text-sm mb-1 line-clamp-2">
                                                {variant.variantName}
                                              </h4>
                                              <p className="text-xs text-gray-500 mb-2">
                                                SKU: {variant.sku}
                                              </p>
                                              {variant.variantSpecs && (
                                                <p className="text-xs text-gray-400 mb-2 line-clamp-1">
                                                  {variant.variantSpecs}
                                                </p>
                                              )}
                                              <div className="mt-auto">
                                                <div className="flex items-center gap-2">
                                                  <span className="text-base font-bold text-indigo-600">
                                                    {variant.sellingPrice?.toLocaleString() ||
                                                      "0"}
                                                    đ
                                                  </span>
                                                </div>
                                              </div>
                                              <Button
                                                size="sm"
                                                className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleAddVariantToCart(
                                                    variant,
                                                    product,
                                                  );
                                                }}
                                              >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Add
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      {(!product.variants ||
                                        product.variants.length === 0) && (
                                        <div className="text-center py-6 text-gray-500">
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
                      <div className="text-center py-8 text-gray-500">
                        No products found
                      </div>
                    )}

                    {/* Bottom Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchProducts(0)}
                          disabled={currentPage === 0 || loading}
                        >
                          First
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchProducts(currentPage - 1)}
                          disabled={currentPage === 0 || loading}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <span className="text-sm text-gray-600 mx-4">
                          Page {currentPage + 1} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchProducts(currentPage + 1)}
                          disabled={currentPage >= totalPages - 1 || loading}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchProducts(totalPages - 1)}
                          disabled={currentPage >= totalPages - 1 || loading}
                        >
                          Last
                        </Button>
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
          className="absolute top-4 right-4 z-10 bg-white shadow-lg rounded-xl hover:bg-indigo-50 hover:border-indigo-500 transition-all duration-200"
          onClick={() => setIsCartVisible(!isCartVisible)}
        >
          {isCartVisible ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              {orderItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {orderItems.length}
                </span>
              )}
            </>
          )}
        </Button>

        {/* Right Side - Cart & Checkout */}
        <div
          className={`bg-white/95 backdrop-blur-sm border-l border-slate-200 transition-all duration-300 flex flex-col ${
            isCartVisible ? "w-[400px]" : "w-0"
          }`}
        >
          {isCartVisible && (
            <>
              <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200 flex-shrink-0 bg-gradient-to-r from-slate-50/80 to-indigo-50/50">
                <h2 className="text-xl font-semibold text-slate-800">
                  Cart & Checkout
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg hover:bg-white transition-colors"
                  onClick={() => setIsCartVisible(false)}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Scrollable Cart Content */}
              <div className="flex-1 overflow-y-auto px-6">
                {/* Customer Section */}
                <div className="mb-6 mt-6">
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Customer
                  </Label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Find by Name, Phone or Email"
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setShowCustomerDropdown(true);
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      className="pl-10 bg-white border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg shadow-sm"
                    />
                    {selectedCustomer && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-lg hover:bg-slate-100"
                        onClick={handleClearCustomer}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Customer Dropdown */}
                  {showCustomerDropdown &&
                    customerSearch &&
                    !selectedCustomer && (
                      <div className="absolute z-10 w-[352px] bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredCustomers.length > 0 ? (
                          filteredCustomers.map((customer) => (
                            <div
                              key={customer.id}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleSelectCustomer(customer)}
                            >
                              <div className="font-medium">
                                {customer.fullName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {customer.phone} • {customer.email}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-gray-500">
                            No customers found
                          </div>
                        )}
                      </div>
                    )}

                  {/* Guest Phone Input */}
                  {!selectedCustomer && (
                    <Input
                      placeholder="Guest Phone Number *"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="bg-white"
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Required for guest checkout
                  </p>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Order Items ({orderItems.length})
                  </Label>
                  {orderItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 border rounded-md">
                      No items in cart
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orderItems.map((item) => (
                        <Card key={item.id}>
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                                {item.image.startsWith("http") ? (
                                  <img
                                    src={item.image}
                                    alt={item.product}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-2xl">{item.image}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">
                                  {item.product}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {item.sku}
                                </p>
                                <p className="text-sm font-semibold text-indigo-600">
                                  {item.price.toLocaleString()}đ
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-red-600 hover:bg-red-50"
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() =>
                                      handleQuantityChange(item.id, -1)
                                    }
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="w-8 text-center text-sm">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() =>
                                      handleQuantityChange(item.id, 1)
                                    }
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Promotions */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Promotions
                  </Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Enter Voucher Code"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      className="bg-white"
                    />
                    <Button
                      onClick={handleApplyPromotion}
                      disabled={applyingPromotion || !voucherCode.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Apply
                    </Button>
                  </div>
                  {appliedPromotions.length > 0 && (
                    <div className="space-y-1">
                      {appliedPromotions.map((promo) => (
                        <div
                          key={promo.promotionId}
                          className="flex items-center justify-between bg-green-50 p-2 rounded"
                        >
                          <div>
                            <span className="text-sm font-medium text-green-700">
                              {promo.promotionCode}
                            </span>
                            <span className="text-xs text-green-600 ml-2">
                              -{promo.discountAmount.toLocaleString()}đ
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-600"
                            onClick={() =>
                              handleRemovePromotion(promo.promotionCode)
                            }
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="space-y-2 mb-6 p-4 bg-gray-50 rounded-md">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-semibold">
                      {subtotal.toLocaleString()}đ
                    </span>
                  </div>
                  {tierDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Tier Discount:</span>
                      <span>-{tierDiscount.toLocaleString()}đ</span>
                    </div>
                  )}
                  {promotionDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Promotion Discount:</span>
                      <span>-{promotionDiscount.toLocaleString()}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-indigo-600">
                      {total.toLocaleString()}đ
                    </span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Payment Method
                  </Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="COD">COD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Proceed Button */}
                <Button
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-6"
                  onClick={handleProceed}
                  disabled={processing || orderItems.length === 0}
                >
                  Proceed
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8" />
                  <div>
                    <h2 className="text-xl font-bold">Confirm Order</h2>
                    <p className="text-indigo-100 text-sm">
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
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Customer Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-800">
                    Customer Information
                  </h3>
                </div>
                {selectedCustomer ? (
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-gray-500">Name:</span>{" "}
                      <span className="font-medium">
                        {selectedCustomer.fullName}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Phone:</span>{" "}
                      <span className="font-medium">
                        {selectedCustomer.phone}
                      </span>
                    </p>
                    {selectedCustomer.email && (
                      <p>
                        <span className="text-gray-500">Email:</span>{" "}
                        <span className="font-medium">
                          {selectedCustomer.email}
                        </span>
                      </p>
                    )}
                    {selectedCustomer.tier && (
                      <p>
                        <span className="text-gray-500">Tier:</span>{" "}
                        <Badge className="ml-1">
                          {selectedCustomer.tier.name}
                        </Badge>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-sm">
                    <p>
                      <span className="text-gray-500">Guest Phone:</span>{" "}
                      <span className="font-medium">{guestPhone}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-800">
                    Order Items ({orderItems.length})
                  </h3>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">
                                {item.product}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.sku}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.price.toLocaleString()}đ
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {(item.price * item.quantity).toLocaleString()}đ
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-800">
                    Payment Details
                  </h3>
                </div>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-gray-500">Payment Method:</span>{" "}
                    <Badge variant="outline" className="ml-1">
                      {paymentMethod}
                    </Badge>
                  </p>
                  <p>
                    <span className="text-gray-500">Order Type:</span>{" "}
                    <Badge variant="outline" className="ml-1">
                      In-Store (OFFLINE)
                    </Badge>
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      {subtotal.toLocaleString()}đ
                    </span>
                  </div>
                  {tierDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>
                        Tier Discount ({selectedCustomer?.tier?.discountRate}%):
                      </span>
                      <span>-{tierDiscount.toLocaleString()}đ</span>
                    </div>
                  )}
                  {promotionDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Promotion Discount:</span>
                      <span>-{promotionDiscount.toLocaleString()}đ</span>
                    </div>
                  )}
                  {appliedPromotions.length > 0 && (
                    <div className="text-xs text-gray-500">
                      Applied:{" "}
                      {appliedPromotions.map((p) => p.promotionCode).join(", ")}
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-indigo-200">
                    <span>Total Amount:</span>
                    <span className="text-indigo-600">
                      {total.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-gray-50 border-t flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirmation(false)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Edit
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
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
                    Confirm & Create Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Order Success Dialog with Serial Numbers */}
      <Dialog open={showOrderSuccess} onOpenChange={setShowOrderSuccess}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  Order Created Successfully!
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Order #{completedOrder?.orderNumber}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {completedOrder && (
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Order Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Customer:</span>
                      <p className="font-medium">
                        {completedOrder.customer?.fullName ||
                          completedOrder.guestName ||
                          "Guest"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <p className="font-medium">
                        {completedOrder.customer?.phone ||
                          completedOrder.guestPhone ||
                          "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment Method:</span>
                      <p className="font-medium capitalize">
                        {completedOrder.paymentMethod?.toLowerCase() || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Amount:</span>
                      <p className="font-bold text-green-600">
                        {completedOrder.finalAmount?.toLocaleString() || 0}đ
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items with Serial Numbers */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      Items to Pick ({completedOrder.items?.length || 0})
                    </h3>
                    {completedOrder.items?.some(
                      (item) => item.serialNumber,
                    ) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyAllSerials}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy All Serials
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {completedOrder.items?.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="border rounded-lg p-4 bg-white"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 line-clamp-1">
                              {item.productName}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {item.variantName}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-sm">
                              <span className="text-gray-500">
                                SKU:{" "}
                                <span className="font-mono">{item.sku}</span>
                              </span>
                              <span className="text-gray-500">
                                Qty:{" "}
                                <span className="font-semibold">
                                  {item.quantity}
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-gray-900">
                              {item.subtotal?.toLocaleString() || 0}đ
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.unitPrice?.toLocaleString()}đ ×{" "}
                              {item.quantity}
                            </p>
                          </div>
                        </div>

                        {/* Serial Number - Highlighted */}
                        {item.serialNumber && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                              <div>
                                <p className="text-xs text-amber-700 font-medium mb-1">
                                  📦 SERIAL NUMBER (Pick this item)
                                </p>
                                <p className="font-mono text-lg font-bold text-amber-900">
                                  {item.serialNumber}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-4"
                                onClick={() =>
                                  handleCopySerial(item.serialNumber!)
                                }
                              >
                                {copiedSerial === item.serialNumber ? (
                                  <>
                                    <Check className="w-4 h-4 mr-1 text-green-600" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 mr-1" />
                                    Copy
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Warranty info if available */}
                        {item.warrantyExpireDate && (
                          <div className="mt-2 text-sm text-gray-500">
                            Warranty until:{" "}
                            {new Date(
                              item.warrantyExpireDate,
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Points Earned */}
                {completedOrder.loyaltyPointsEarned > 0 && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🎉</span>
                      <div>
                        <p className="font-semibold text-purple-900">
                          +{completedOrder.loyaltyPointsEarned} Points Earned!
                        </p>
                        <p className="text-sm text-purple-700">
                          Customer loyalty points have been added
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex-shrink-0 gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-600 to-indigo-700"
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
    </PageContainer>
  );
}
