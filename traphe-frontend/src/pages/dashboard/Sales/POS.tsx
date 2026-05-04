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
  UserPlus,
  Plus,
  Minus,
  Edit,
  Trash2,
  BellIcon,
} from "lucide-react";
import { useState } from "react";
import {
  posProducts,
  posPromotions as initialPromotions,
} from "@/data/mockData";
import { CURRENT_USER } from "@/constants/user";

interface Product {
  id: number;
  category: string;
  name: string;
  sku: string;
  price: string;
  available: number;
  image: string;
}

interface OrderItem {
  id: number;
  product: string;
  sku: string;
  price: string;
  available: number;
  quantity: number;
  image: string;
}

interface Promotion {
  id: number;
  code: string;
  type: string;
  discount: string;
}

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [customerSearch, setCustomerSearch] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [exchangePoint, setExchangePoint] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const [products] = useState<Product[]>(posProducts);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      id: 1,
      product: "Product Name",
      sku: "SKU",
      price: "$ Price",
      available: 0,
      quantity: 1,
      image: "📦",
    },
  ]);

  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);

  const handleQuantityChange = (id: number, delta: number) => {
    setOrderItems(
      orderItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item,
      ),
    );
  };

  const handleRemovePromotion = (id: number) => {
    setPromotions(promotions.filter((promo) => promo.id !== id));
  };

  const subtotal = 20000;
  const discount = 20000;
  const total = subtotal - discount;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Side - Catalog */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">POS</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome {CURRENT_USER.role} {CURRENT_USER.name}
            </span>
            <Button variant="outline" size="icon">
              <BellIcon className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              CN
            </Button>
          </div>
        </div>

        <Card className="shadow-md">
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
              <p className="text-sm text-gray-600 mb-4">Result (1 Found)</p>
              <div className="grid grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="relative cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-indigo-900 text-white">
                          {product.category}
                        </Badge>
                      </div>
                      <div className="flex flex-col items-center pt-8">
                        <div className="w-24 h-24 bg-black rounded mb-3"></div>
                        <h3 className="font-medium text-gray-900 text-center">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500">{product.sku}</p>
                        <p className="text-sm text-gray-500">{product.price}</p>
                        <p className="text-sm text-gray-500">
                          Available: {product.available}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        className="absolute bottom-2 right-2 rounded-full bg-indigo-900 hover:bg-indigo-800"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Find by Name, Phone or Email"
              className="pl-10 pr-10"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Order Items
          </Label>
          <div className="space-y-3">
            {orderItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-16 h-16 bg-black rounded"></div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.product}</h3>
                  <p className="text-xs text-gray-500">{item.sku}</p>
                  <p className="text-xs text-gray-500">{item.price}</p>
                  <p className="text-xs text-gray-500">
                    Available: {item.available}
                  </p>
                  <button className="text-xs text-indigo-900 hover:underline">
                    Enter Serial
                  </button>
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
                </div>
              </div>
            ))}
          </div>
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
              />
            </div>
            <div className="relative flex-1">
              <Input
                placeholder="Exchange Point"
                className="text-sm"
                value={exchangePoint}
                onChange={(e) => setExchangePoint(e.target.value)}
              />
            </div>
          </div>

          {promotions.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs">Code</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Discount</TableHead>
                  <TableHead className="text-xs text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="text-sm">{promo.code}</TableCell>
                    <TableCell className="text-sm">{promo.type}</TableCell>
                    <TableCell className="text-sm">{promo.discount}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemovePromotion(promo.id)}
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
            <span className="font-semibold">$ {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Discount:</span>
            <span className="font-semibold">$ {discount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-base font-semibold border-t pt-2">
            <span>Total:</span>
            <span>$ {total.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Method & Proceed */}
        <div className="space-y-3">
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Credit Card</SelectItem>
              <SelectItem value="bank">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>

          <Button className="w-full bg-indigo-900 hover:bg-indigo-800 text-white">
            Proceed
          </Button>
        </div>
      </div>
    </div>
  );
}
