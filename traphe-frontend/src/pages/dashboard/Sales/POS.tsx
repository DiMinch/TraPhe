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
  RefreshCw,
  X,
  Loader2,
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
} from "@/services/order.service";
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

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params =
        selectedCategory !== "all"
          ? { categoryId: selectedCategory }
          : undefined;
      const response = await productService.getAllProducts(params);
      const productsData = response.data?.content || [];
      setProducts(productsData);
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
    fetchProducts();
    fetchCategories();
    fetchCustomers();
  }, []);

  // Refetch when category changes
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

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

  // Create order
  const handleProceed = async () => {
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
        paymentMethod: paymentMethod as any,
        promotionCodes: appliedPromotions.map((p) => p.promotionCode),
      };

      await orderService.createOrder(orderData);

      toast.success("Order created successfully!");

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
      fetchProducts();
    } catch (err: any) {
      console.error("Error creating order:", err);
      toast.error(err.response?.data?.message || "Failed to create order");
    } finally {
      setProcessing(false);
    }
  };

  // Filter products by search
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <PageContainer>
      <div className="flex h-[calc(100vh-100px)]">
        {/* Left Side - Product Catalog */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <PageHeader
            title="POS"
            subtitle="Point of Sale System"
            onRefresh={fetchProducts}
            showBackButton={false}
          />

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mt-4">
            <CardContent className="p-6">
              {/* Catalog Header */}
              <h2 className="text-lg font-semibold mb-4">Catalog</h2>

              {/* Search and Filter */}
              <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Product Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white"
                  />
                </div>

                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[200px] bg-white">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 pb-2 sticky top-0 bg-white border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                        <Input
                          placeholder="Search categories..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="pl-7 h-8 text-sm"
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

                <Button variant="outline" size="icon">
                  <QrCode className="w-4 h-4" />
                </Button>
              </div>

              {/* Products List */}
              <div>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <span className="mt-3 text-slate-500 font-medium">
                      Loading products...
                    </span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">{error}</div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      Result ({filteredProducts.length} Found)
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      {filteredProducts
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
                              className={`relative cursor-pointer hover:shadow-lg transition-all ${
                                isExpanded ? "col-span-3" : ""
                              }`}
                              onClick={() => handleProductClick(product)}
                            >
                              <CardContent className="p-4">
                                {!isExpanded ? (
                                  // Collapsed view - show product only
                                  <>
                                    <div className="absolute top-2 left-2">
                                      <Badge className="bg-indigo-600 text-white">
                                        {product.categoryName || "Product"}
                                      </Badge>
                                    </div>
                                    <div className="flex flex-col items-center pt-8">
                                      <div className="w-24 h-24 bg-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden">
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
                                      <h3 className="font-medium text-gray-900 text-center line-clamp-2">
                                        {product.name}
                                      </h3>
                                      <p className="text-xs text-gray-500 mt-1">
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
                                  <div>
                                    <div className="flex items-start justify-between mb-4 pb-4 border-b">
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

                                    {/* Variants Grid */}
                                    <div className="grid grid-cols-3 gap-3">
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
                                                  $
                                                  {variant.sellingPrice?.toFixed(
                                                    2,
                                                  ) || "0.00"}
                                                </span>
                                                {variant.purchasePriceAvg && (
                                                  <span className="text-xs text-gray-500 line-through">
                                                    $
                                                    {variant.purchasePriceAvg.toFixed(
                                                      2,
                                                    )}
                                                  </span>
                                                )}
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
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                    {filteredProducts.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No products found
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Cart & Checkout */}
        <div className="w-[400px] p-6 bg-white border-l overflow-y-auto">
          <h2 className="text-xl font-semibold mb-6">Cart & Checkout</h2>

          {/* Customer Section */}
          <div className="mb-6">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Customer
            </Label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Find by Name, Phone or Email"
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                className="pl-9 bg-white"
              />
              {selectedCustomer && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={handleClearCustomer}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Customer Dropdown */}
            {showCustomerDropdown && customerSearch && !selectedCustomer && (
              <div className="absolute z-10 w-[352px] bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      <div className="font-medium">{customer.fullName}</div>
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
                          <p className="text-xs text-gray-500">{item.sku}</p>
                          <p className="text-sm font-semibold text-indigo-600">
                            ${item.price.toFixed(2)}
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
                              onClick={() => handleQuantityChange(item.id, -1)}
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
                              onClick={() => handleQuantityChange(item.id, 1)}
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
                        -${promo.discountAmount.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-600"
                      onClick={() => handleRemovePromotion(promo.promotionCode)}
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
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            {tierDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Tier Discount:</span>
                <span>-${tierDiscount.toFixed(2)}</span>
              </div>
            )}
            {promotionDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Promotion Discount:</span>
                <span>-${promotionDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span className="text-indigo-600">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Payment Method
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="E_WALLET">E-Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Proceed Button */}
          <Button
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-6"
            onClick={handleProceed}
            disabled={processing || orderItems.length === 0}
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Proceed"
            )}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
