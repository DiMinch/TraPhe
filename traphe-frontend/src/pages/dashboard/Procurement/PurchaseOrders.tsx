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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Edit,
  Trash2,
  Check,
  BellIcon,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

interface PurchaseOrder {
  id: number;
  poNumber: number;
  supplier: string;
  contactName: string;
  createdDate: string;
  expectedDate: string;
  actualDate: string;
  totalAmount: string;
  status: "ORDERED" | "RECEIVED" | "CLOSED" | "PENDING";
}

interface OrderItem {
  id: number;
  product: string;
  sku: string;
  referenceTicket: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: string;
  subtotal: string;
}

export default function PurchaseOrdersPage() {
  const navigate = useNavigate();
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [purchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 1,
      poNumber: 1,
      supplier: "ABC",
      contactName: "Nguyen Van A",
      createdDate: "23/11/2024",
      expectedDate: "23/12/2024",
      actualDate: "23/11/2025",
      totalAmount: "$ 100,000",
      status: "ORDERED",
    },
  ]);

  const [newOrder, setNewOrder] = useState({
    poNumber: "",
    supplier: "",
    createdDate: "",
    expectedDate: "",
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      id: 1,
      product: "",
      sku: "",
      referenceTicket: "",
      quantityOrdered: 0,
      quantityReceived: 0,
      unitPrice: "",
      subtotal: "",
    },
  ]);

  const handleAddItem = () => {
    const newItem: OrderItem = {
      id: orderItems.length + 1,
      product: "",
      sku: "",
      referenceTicket: "",
      quantityOrdered: 0,
      quantityReceived: 0,
      unitPrice: "",
      subtotal: "",
    };
    setOrderItems([...orderItems, newItem]);
  };

  const handleRemoveItem = (id: number) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: number, field: keyof OrderItem, value: any) => {
    setOrderItems(
      orderItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleSaveDraft = () => {
    console.log("Saving draft...", newOrder, orderItems);
    setIsNewOrderOpen(false);
  };

  const handleMarkAsOrdered = () => {
    console.log("Marking as ordered...", newOrder, orderItems);
    setIsNewOrderOpen(false);
  };

  const totalQuantity = orderItems.reduce(
    (sum, item) => sum + item.quantityOrdered,
    0,
  );
  const totalAmount = orderItems.reduce((sum, item) => {
    const subtotal = parseFloat(item.subtotal.replace(/[$,]/g, "") || "0");
    return sum + subtotal;
  }, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Purchase Orders</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome Admin Nguyen Van A
          </span>
          <Button variant="outline" size="icon">
            <BellIcon className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            CN
          </Button>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end mb-6">
        <Button
          className="bg-indigo-900 hover:bg-indigo-800 text-white"
          onClick={() => setIsNewOrderOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Purchase Order
        </Button>
      </div>

      {/* Main Card */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search" className="pl-10 bg-white" />
            </div>

            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="w-4 h-4" />
            </Button>

            <Button variant="outline" className="shrink-0">
              <Calendar className="w-4 h-4 mr-2" />
              All days
            </Button>

            <Select defaultValue="all-suppliers">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-suppliers">All suppliers</SelectItem>
                <SelectItem value="abc">ABC</SelectItem>
                <SelectItem value="lem">LeM</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-status">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All status</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Expected Date</TableHead>
                  <TableHead>Actual Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell>
                      <button
                        onClick={() =>
                          navigate(
                            `/procurement/purchase-orders/${po.poNumber}`,
                          )
                        }
                        className="font-medium text-indigo-900 hover:underline cursor-pointer"
                      >
                        {po.poNumber}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {po.supplier}
                        </div>
                        <div className="text-sm text-gray-500">
                          {po.contactName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {po.createdDate}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {po.expectedDate}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {po.actualDate}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {po.totalAmount}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          po.status === "ORDERED"
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                            : po.status === "RECEIVED"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : po.status === "CLOSED"
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                        }
                      >
                        {po.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* New Purchase Order Dialog */}
      <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              New Product
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNewOrderOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Order Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  PO Number
                </Label>
                <Input
                  value={newOrder.poNumber}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, poNumber: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Supplier
                </Label>
                <Select
                  value={newOrder.supplier}
                  onValueChange={(value) =>
                    setNewOrder({ ...newOrder, supplier: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ABC">ABC</SelectItem>
                    <SelectItem value="LeM">LeM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Created Date
                </Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={newOrder.createdDate}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, createdDate: e.target.value })
                    }
                    placeholder="DD/MM/YYYY"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Expected Date
                </Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={newOrder.expectedDate}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, expectedDate: e.target.value })
                    }
                    placeholder="DD/MM/YYYY"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Product / Component</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Reference Ticket</TableHead>
                      <TableHead>Quantity Ordered</TableHead>
                      <TableHead>Quantity Received</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            value={item.product}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "product",
                                e.target.value,
                              )
                            }
                            placeholder="Product name"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.sku}
                            onChange={(e) =>
                              handleItemChange(item.id, "sku", e.target.value)
                            }
                            placeholder="SKU"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.referenceTicket}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "referenceTicket",
                                e.target.value,
                              )
                            }
                            placeholder="Ticket #"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantityOrdered}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "quantityOrdered",
                                parseInt(e.target.value) || 0,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantityReceived || ""}
                            onChange={(e) => {
                              const val =
                                e.target.value === ""
                                  ? 0
                                  : parseInt(e.target.value) || 0;
                              handleItemChange(
                                item.id,
                                "quantityReceived",
                                val,
                              );
                            }}
                            placeholder="Unknown"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "unitPrice",
                                e.target.value,
                              )
                            }
                            placeholder="$ 0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.subtotal}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "subtotal",
                                e.target.value,
                              )
                            }
                            placeholder="$ 0"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 text-center">
                <Button variant="link" onClick={handleAddItem}>
                  Click here to add more order items +
                </Button>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>

              {/* Totals */}
              <div className="flex justify-end mt-6">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Total Quantity:
                    </span>
                    <span className="font-semibold text-gray-900">
                      {totalQuantity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Total Amount:
                    </span>
                    <span className="font-semibold text-gray-900">
                      $ {totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsNewOrderOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-indigo-900 hover:bg-indigo-800 text-white"
                onClick={handleSaveDraft}
              >
                Save Draft
              </Button>
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                onClick={handleMarkAsOrdered}
              >
                Mark as Ordered
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
