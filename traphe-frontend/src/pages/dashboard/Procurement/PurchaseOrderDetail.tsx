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
  X,
  Plus,
  Check,
} from "lucide-react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";

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
  const { poNumber } = useParams();
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

  const [editData, setEditData] = useState(orderData);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      id: 1,
      product: "MacBook Pro M1 2020",
      sku: "MBP-M1-2020",
      referenceTicket: "REF-001",
      quantityOrdered: 25,
      quantityReceived: 20,
      unitPrice: "$ 1,000",
      subtotal: "$ 20,000",
    },
  ]);

  const [editItems, setEditItems] = useState<OrderItem[]>(orderItems);

  const totalQuantity = orderItems.reduce(
    (sum, item) => sum + item.quantityReceived,
    0,
  );
  const totalAmount = orderItems.reduce((sum, item) => {
    const subtotal = parseFloat(item.subtotal.replace(/[$,]/g, ""));
    return sum + subtotal;
  }, 0);

  const handleEdit = () => {
    setEditData(orderData);
    setEditItems([...orderItems]);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData(orderData);
    setEditItems([...orderItems]);
    setIsEditing(false);
  };

  const handleSaveChanges = () => {
    setOrderData(editData);
    setOrderItems(editItems);
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
      id: editItems.length + 1,
      product: "",
      sku: "",
      referenceTicket: "",
      quantityOrdered: 0,
      quantityReceived: 0,
      unitPrice: "",
      subtotal: "",
    };
    setEditItems([...editItems, newItem]);
  };

  const handleRemoveItem = (id: number) => {
    setEditItems(editItems.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: number, field: keyof OrderItem, value: any) => {
    setEditItems(
      editItems.map((item) =>
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
        {!isEditing ? (
          <>
            <Button
              className="bg-indigo-900 hover:bg-indigo-800 text-white"
              onClick={handleEdit}
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
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-900 hover:bg-indigo-800 text-white"
              onClick={handleSaveChanges}
            >
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
              <Check className="w-4 h-4 mr-2" />
              Received Goods
            </Button>
          </>
        )}
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
                value={isEditing ? editData.poNumber : orderData.poNumber}
                onChange={(e) =>
                  setEditData({ ...editData, poNumber: e.target.value })
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
                value={isEditing ? editData.supplier : orderData.supplier}
                onValueChange={(value) =>
                  setEditData({ ...editData, supplier: value })
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
                value={isEditing ? editData.status : orderData.status}
                onValueChange={(value) =>
                  setEditData({ ...editData, status: value })
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
                  value={
                    isEditing ? editData.createdDate : orderData.createdDate
                  }
                  onChange={(e) =>
                    setEditData({ ...editData, createdDate: e.target.value })
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
                  value={
                    isEditing ? editData.expectedDate : orderData.expectedDate
                  }
                  onChange={(e) =>
                    setEditData({ ...editData, expectedDate: e.target.value })
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
                  value={isEditing ? editData.actualDate : orderData.actualDate}
                  onChange={(e) =>
                    setEditData({ ...editData, actualDate: e.target.value })
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
                {(isEditing ? editItems : orderItems).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={item.product}
                          onChange={(e) =>
                            handleItemChange(item.id, "product", e.target.value)
                          }
                          placeholder="Product name"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">
                          {item.product}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={item.sku}
                          onChange={(e) =>
                            handleItemChange(item.id, "sku", e.target.value)
                          }
                          placeholder="SKU"
                        />
                      ) : (
                        <span className="text-gray-700">{item.sku}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
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
                      ) : (
                        <span className="text-gray-700">
                          {item.referenceTicket}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
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
                        />
                      ) : (
                        <span className="text-gray-700">
                          {item.quantityOrdered}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
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
                        />
                      ) : (
                        <span className="text-gray-700">
                          {item.quantityReceived}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "unitPrice",
                              e.target.value,
                            )
                          }
                        />
                      ) : (
                        <span className="text-gray-700">{item.unitPrice}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={item.subtotal}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "subtotal",
                              e.target.value,
                            )
                          }
                        />
                      ) : (
                        <span className="font-medium text-gray-900">
                          {item.subtotal}
                        </span>
                      )}
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
                        {!isEditing && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
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
