import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Trash2 } from "lucide-react";

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

interface OrderItemsTableProps {
  orderItems: OrderItem[];
  onItemChange: (id: number, field: keyof OrderItem, value: any) => void;
  onRemoveItem: (id: number) => void;
  onAddItem: () => void;
}

export default function OrderItemsTable({
  orderItems,
  onItemChange,
  onRemoveItem,
  onAddItem,
}: OrderItemsTableProps) {
  const totalQuantity = orderItems.reduce(
    (sum, item) => sum + item.quantityOrdered,
    0,
  );
  const totalAmount = orderItems.reduce((sum, item) => {
    const subtotal = parseFloat(item.subtotal.replace(/[$,]/g, "") || "0");
    return sum + subtotal;
  }, 0);

  return (
    <div className="">
      <h3 className="text-lg font-semibold mb-4">Order Items</h3>

      <div className="rounded-md border overflow-x-auto">
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
                      onItemChange(item.id, "product", e.target.value)
                    }
                    placeholder="Product name"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.sku}
                    onChange={(e) =>
                      onItemChange(item.id, "sku", e.target.value)
                    }
                    placeholder="SKU"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.referenceTicket}
                    onChange={(e) =>
                      onItemChange(item.id, "referenceTicket", e.target.value)
                    }
                    placeholder="Ticket #"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantityOrdered}
                    onChange={(e) =>
                      onItemChange(
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
                      onItemChange(item.id, "quantityReceived", val);
                    }}
                    placeholder="Unknown"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.unitPrice}
                    onChange={(e) =>
                      onItemChange(item.id, "unitPrice", e.target.value)
                    }
                    placeholder="$ 0"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.subtotal}
                    onChange={(e) =>
                      onItemChange(item.id, "subtotal", e.target.value)
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
                      onClick={() => onRemoveItem(item.id)}
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
        <Button variant="link" onClick={onAddItem}>
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
            <span className="font-semibold text-gray-900">{totalQuantity}</span>
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
  );
}
