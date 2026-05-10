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
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  inventoryService,
  type InventoryResponse,
} from "@/services/inventory.service";
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

interface Product {
  id: string;
  variantId: string;
  category: string;
  name: string;
  sku: string;
  price: number;
  available: number;
  image: string;
}

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

  // Transform inventory to products
  const transformInventory = (inv: InventoryResponse): Product => ({
    id: inv.id,
    variantId: inv.productVariant.id,
    category: "Electronics", // Default category
    name: inv.productVariant.productName,
    sku: inv.productVariant.sku,
    price: 0, // Price will come from adding to cart
    available: inv.quantityAvailable,
    image: "📦",
  });

  // Fetch products from inventory
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getAllInventory();
      const inventoryData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.content || [];
      const transformedData = inventoryData
        .filter(
          (inv: any) =>
            inv.quantityAvailable > 0 && inv.productVariant !== null,
        )
        .map(transformInventory);
      setProducts(transformedData);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

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

  // Add product to cart
  const handleAddToCart = (product: Product) => {
    const existingItem = orderItems.find(
      (item) => item.productVariantId === product.variantId,
    );

    if (existingItem) {
      // Increase quantity if already in cart
      if (existingItem.quantity < product.available) {
        setOrderItems(
          orderItems.map((item) =>
            item.productVariantId === product.variantId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        );
      } else {
        toast.error("Not enough stock available");
      }
    } else {
      // Add new item to cart
      const newItem: OrderItem = {
        id: product.id,
        productVariantId: product.variantId,
        product: product.name,
        sku: product.sku,
        price: 100, // Default price, should come from product variant
        available: product.available,
        quantity: 1,
        image: product.image,
      };
      setOrderItems([...orderItems, newItem]);
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
      // Calculate discount per item (proportional distribution)
      const totalItemsValue = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const items: OrderItemRequest[] = orderItems.map((item) => {
        const itemTotal = item.price * item.quantity;
        const itemDiscount =
          totalItemsValue > 0 ? (itemTotal / totalItemsValue) * discount : 0;
        return {
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          unitPrice: item.price,
          discount: Math.round(itemDiscount * 100) / 100, // Round to 2 decimals
        };
      });

      const orderData: CreateOrderRequest = {
        orderType: "OFFLINE",
        paymentMethod: paymentMethod.toUpperCase() as
          | "CASH"
          | "TRANSFER"
          | "COD",
        items,
        promotionIds: appliedPromotions.map((p) => p.promotionId),
        customerId: selectedCustomer?.id,
        guestName: selectedCustomer ? undefined : customerSearch || "Guest",
        guestPhone: selectedCustomer ? undefined : guestPhone,
      };

      const response = await orderService.createOrder(orderData);

      toast.success(
        `Order created successfully! Order Number: ${response.data.orderNumber}`,
      );

      // Reset form
      setOrderItems([]);
      setSelectedCustomer(null);
      setCustomerSearch("");
      setGuestPhone("");
      setVoucherCode("");
      setPaymentMethod("");
      setAppliedPromotions([]);
      setDiscountCalculation(null);

      // Refresh products to update availability
      fetchProducts();
    } catch (err: any) {
      console.error("Error creating order:", err);
      toast.error(err.response?.data?.message || "Failed to create order");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Left Side - Catalog */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">POS</h1>
          <div className="flex items-center gap-4">
            <Button onClick={fetchProducts} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Catalog</h2>

            {/* Search Bar */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Product Name"
                  className="pl-10 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <QrCode className="w-4 h-4" />
              </Button>
            </div>

            {/* Products List */}
            <div>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading products...
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Result (
                    {
                      products.filter((p) =>
                        p.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()),
                      ).length
                    }{" "}
                    Found)
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    {products
                      .filter((p) =>
                        p.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()),
                      )
                      .map((product) => (
                        <Card
                          key={product.variantId}
                          className="relative cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => handleAddToCart(product)}
                        >
                          <CardContent className="p-4">
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-indigo-600 text-white">
                                {product.category}
                              </Badge>
                            </div>
                            <div className="flex flex-col items-center pt-8">
                              <div className="w-24 h-24 bg-black rounded mb-3 flex items-center justify-center text-4xl">
                                {product.image}
                              </div>
                              <h3 className="font-medium text-gray-900 text-center">
                                {product.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {product.sku}
                              </p>
                              <p className="text-sm text-green-600 font-semibold">
                                ${product.price.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500">
                                Available: {product.available}
                              </p>
                            </div>
                            <Button
                              size="icon"
                              className="absolute bottom-2 right-2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
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
              className="pl-10 pr-10"
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setShowCustomerDropdown(e.target.value.length > 0);
              }}
              onFocus={() => {
                if (customerSearch.length > 0) setShowCustomerDropdown(true);
              }}
            />
            {selectedCustomer && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
                onClick={handleClearCustomer}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Customer Dropdown */}
          {showCustomerDropdown && filteredCustomers.length > 0 && (
            <div className="absolute z-10 w-[368px] bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredCustomers.slice(0, 10).map((customer) => (
                <div
                  key={customer.id}
                  className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <div className="font-medium text-sm">{customer.fullName}</div>
                  <div className="text-xs text-gray-500">{customer.phone}</div>
                  <div className="text-xs text-gray-500">{customer.email}</div>
                  {customer.tier && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {customer.tier.name} - {customer.tier.discountRate}% off
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Selected Customer Info */}
          {selectedCustomer && (
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {selectedCustomer.fullName}
                  </div>
                  <div className="text-xs text-gray-600">
                    {selectedCustomer.phone}
                  </div>
                  <div className="text-xs text-gray-600">
                    {selectedCustomer.email}
                  </div>
                  {selectedCustomer.tier && (
                    <Badge className="mt-2 bg-indigo-600">
                      {selectedCustomer.tier.name} Tier -{" "}
                      {selectedCustomer.tier.discountRate}% Discount
                    </Badge>
                  )}
                  {selectedCustomer.loyaltyPoint && (
                    <div className="text-xs text-green-600 mt-1">
                      Points:{" "}
                      {selectedCustomer.loyaltyPoint.pointsAvailable.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Guest Phone Field (only show when no customer selected) */}
          {!selectedCustomer && (
            <div className="mt-2">
              <Input
                placeholder="Guest Phone Number *"
                className="text-sm"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                type="tel"
              />
              <p className="text-xs text-gray-500 mt-1">
                Required for guest checkout
              </p>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Order Items ({orderItems.length})
          </Label>
          {orderItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No items in cart
            </div>
          ) : (
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                >
                  <div className="w-16 h-16 bg-black rounded flex items-center justify-center text-2xl">
                    {item.image}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.product}
                    </h3>
                    <p className="text-xs text-gray-500">{item.sku}</p>
                    <p className="text-xs text-green-600 font-semibold">
                      ${item.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Available: {item.available}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleQuantityChange(item.id, -1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-sm w-8 text-center">
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-600 hover:text-red-700"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Promotions */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Promotions
          </Label>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Input
                placeholder="Enter Voucher Code"
                className="text-sm"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleApplyPromotion();
                  }
                }}
                disabled={applyingPromotion}
              />
            </div>
            <Button
              onClick={handleApplyPromotion}
              disabled={applyingPromotion || !voucherCode.trim()}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
            >
              {applyingPromotion ? "Applying..." : "Apply"}
            </Button>
          </div>

          {appliedPromotions.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                  <TableHead className="text-xs">Code</TableHead>
                  <TableHead className="text-xs text-right">Discount</TableHead>
                  <TableHead className="text-xs text-center w-16">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appliedPromotions.map((promo) => (
                  <TableRow key={promo.promotionId}>
                    <TableCell className="text-sm font-medium">
                      {promo.promotionCode}
                    </TableCell>
                    <TableCell className="text-sm text-right text-green-600 font-semibold">
                      -$ {promo.discountAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() =>
                            handleRemovePromotion(promo.promotionCode)
                          }
                          disabled={applyingPromotion}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Totals */}
        <div className="space-y-2 mb-6 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Subtotal:</span>
            <span className="font-semibold">$ {subtotal.toFixed(2)}</span>
          </div>
          {tierDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">
                Tier Discount ({selectedCustomer?.tier?.name} -{" "}
                {selectedCustomer?.tier?.discountRate}%):
              </span>
              <span className="font-semibold text-green-600">
                -$ {tierDiscount.toFixed(2)}
              </span>
            </div>
          )}
          {promotionDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Promotion Discount:</span>
              <span className="font-semibold text-green-600">
                -$ {promotionDiscount.toFixed(2)}
              </span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-sm font-semibold border-t pt-2">
              <span className="text-gray-700">Total Discount:</span>
              <span className="text-green-600">-$ {discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold border-t pt-2">
            <span>Total:</span>
            <span>$ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method & Proceed */}
        <div className="space-y-3">
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="TRANSFER">Bank Transfer</SelectItem>
              <SelectItem value="COD">Cash on Delivery</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md"
            onClick={handleProceed}
            disabled={processing || orderItems.length === 0}
          >
            {processing ? "Processing..." : "Proceed"}
          </Button>
        </div>
      </div>
    </div>
  );
}
