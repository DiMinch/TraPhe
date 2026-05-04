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
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Edit,
  Trash2,
  BellIcon,
  ChevronRight,
  Calendar,
  Check,
  Save,
} from "lucide-react";
import { useState } from "react";
import { purchaseOrderItems as initialItems } from "@/data/mockData";
import { useNavigate } from "react-router";
import { CURRENT_USER } from "@/constants/user";

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

export default function PurchaseOrderDetailPage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [orderData, setOrderData] = useState({
    poNumber: "1",
    supplier: "ABC",
    status: "RECEIVED",
    createdDate: "23/11/2024",
    expectedDate: "23/12/2024",
    actualDate: "23/11/2025",
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialItems);

  const totalQuantity = orderItems.reduce(
    (sum, item) => sum + item.quantityReceived,
    0,
  );
  const totalAmount = orderItems.reduce((sum, item) => {
    const subtotal = parseFloat(item.subtotal.replace(/[$,]/g, ""));
    return sum + subtotal;
  }, 0);

  const handleSave = () => {
    console.log("Saving purchase order changes...");
    setIsEditing(false);
  };

  const handleClosePurchaseOrder = () => {
    // Handle close purchase order logic
    console.log("Closing purchase order");
  };

  const handleDelete = () => {
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    console.log("Deleting purchase order");
    setIsDeleteOpen(false);
    navigate("/procurement/purchase-orders");
  };

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

  const handleItemChange = (
    id: number,
    field: keyof OrderItem,
    value: unknown,
  ) => {
    setOrderItems(
      orderItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Purchase Order Detail</h1>
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

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
        <button
          onClick={() => navigate("/procurement/purchase-orders")}
          className="hover:text-gray-900"
        >
          Purchase Orders
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{orderData.poNumber}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        {isEditing ? (
          <Button
            className="bg-indigo-900 hover:bg-indigo-800 text-white"
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        ) : (
          <>
            <Button
              className="bg-indigo-900 hover:bg-indigo-800 text-white"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
              onClick={handleClosePurchaseOrder}
            >
              <Check className="w-4 h-4 mr-2" />
              Close Purchase Order
            </Button>
          </>
        )}
        <Button
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>

      {/* Order Information Card */}
      <Card className="shadow-md mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                PO Number
              </Label>
              <Input
                value={orderData.poNumber}
                onChange={(e) =>
                  setOrderData({ ...orderData, poNumber: e.target.value })
                }
                disabled={!isEditing}
                className="mt-1 bg-gray-50"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Supplier
              </Label>
              <Select
                value={orderData.supplier}
                onValueChange={(value) =>
                  setOrderData({ ...orderData, supplier: value })
                }
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ABC">ABC</SelectItem>
                  <SelectItem value="LeM">LeM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Status
              </Label>
              <Select
                value={orderData.status}
                onValueChange={(value) =>
                  setOrderData({ ...orderData, status: value })
                }
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORDERED">ORDERED</SelectItem>
                  <SelectItem value="RECEIVED">RECEIVED</SelectItem>
                  <SelectItem value="CLOSED">CLOSED</SelectItem>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Created Date
              </Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={orderData.createdDate}
                  onChange={(e) =>
                    setOrderData({ ...orderData, createdDate: e.target.value })
                  }
                  disabled={!isEditing}
                  className="pl-10 bg-gray-50"
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
                  value={orderData.expectedDate}
                  onChange={(e) =>
                    setOrderData({ ...orderData, expectedDate: e.target.value })
                  }
                  disabled={!isEditing}
                  className="pl-10 bg-gray-50"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Actual Date
              </Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={orderData.actualDate}
                  onChange={(e) =>
                    setOrderData({ ...orderData, actualDate: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder={isEditing ? "Select" : ""}
                  className="pl-10 bg-gray-50"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items Card */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-6">Order Items</h2>

          {/* Table */}
          <div className="rounded-md ">
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
                          handleItemChange(item.id, "product", e.target.value)
                        }
                        placeholder="Product name"
                        disabled={!isEditing}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.sku}
                        onChange={(e) =>
                          handleItemChange(item.id, "sku", e.target.value)
                        }
                        placeholder="SKU"
                        disabled={!isEditing}
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
                        disabled={!isEditing}
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
                            parseInt(e.target.value),
                          )
                        }
                        disabled={!isEditing}
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
                          handleItemChange(item.id, "quantityReceived", val);
                        }}
                        placeholder="Unknown"
                        disabled={!isEditing}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(item.id, "unitPrice", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.subtotal}
                        onChange={(e) =>
                          handleItemChange(item.id, "subtotal", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {isEditing && (
            <div className="mt-4 text-center">
              <Button variant="link" onClick={handleAddItem}>
                Click here to add more order items +
              </Button>
            </div>
          )}

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
          <div className="flex justify-end mt-6 space-y-2">
            <div className="w-64 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Total Quantity:
                </span>
                <span className="font-semibold text-gray-900">
                  $ {totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Total Amount:
                </span>
                <span className="font-semibold text-gray-900">
                  {totalQuantity}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete purchase order #
              {orderData.poNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
