import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import productsData from "@/data/products.json";

interface NewProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (product: (typeof productsData)[0]) => void;
}

export default function NewProductDialog({
  open,
  onOpenChange,
  onAdd,
}: NewProductDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    status: "",
    supplier: "",
    inventory: "",
    minStockThreshold: "",
    generalSpec: "",
  });

  const handleAdd = () => {
    const newProduct = {
      id: Date.now(),
      image: "📦",
      name: formData.name,
      variants: "0 variants",
      category: formData.category,
      suppliers: formData.supplier,
      inventory: Number(formData.inventory) || 0,
      status: formData.status,
      minStockThreshold: Number(formData.minStockThreshold) || 0,
      generalSpec: formData.generalSpec ? JSON.parse(formData.generalSpec) : {},
      variantList: [],
    };
    onAdd(newProduct);
    setFormData({
      name: "",
      category: "",
      status: "",
      supplier: "",
      inventory: "",
      minStockThreshold: "",
      generalSpec: "",
    });
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[70vw] max-h-[90vh] flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            New Product
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 ">
          {/* Product Information */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="MacBook Pro M1 2020"
                className="bg-white"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="bg-white w-full">
                  <SelectValue placeholder="Laptop" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="laptop">Laptop</SelectItem>
                  <SelectItem value="mouse">Mouse</SelectItem>
                  <SelectItem value="keyboard">Keyboard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="bg-white w-full">
                  <SelectValue placeholder="Active" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select
                value={formData.supplier}
                onValueChange={(value) =>
                  setFormData({ ...formData, supplier: value })
                }
              >
                <SelectTrigger className="bg-white w-full">
                  <SelectValue placeholder="ABC" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="abc">ABC</SelectItem>
                  <SelectItem value="lem">LeM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inventory">Inventory</Label>
              <Input
                id="inventory"
                className="bg-white"
                value={formData.inventory}
                onChange={(e) =>
                  setFormData({ ...formData, inventory: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Min Stock Threshold</Label>
              <Input
                id="threshold"
                placeholder="5"
                className="bg-white"
                value={formData.minStockThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minStockThreshold: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 ">
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center bg-white h-[132px] flex items-center justify-center">
                <div>
                  <Button variant="outline" size="sm">
                    Choose File
                  </Button>
                  <span className="text-sm text-gray-500 ml-2">
                    No file chosen
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="spec">General Spec</Label>
              <Textarea
                id="spec"
                className="h-[132px] bg-white font-mono text-sm resize-none"
                placeholder={`{
  "Screen_Size": "1920x1080",
  "Battery": "60Wh"
}`}
                value={formData.generalSpec}
                onChange={(e) =>
                  setFormData({ ...formData, generalSpec: e.target.value })
                }
              />
            </div>
          </div>

          {/*  */}
          <Card className="bg-white">
            <CardContent className="">
              <div className="flex items-center justify-between ">
                <h3 className="font-semibold">Variant List</h3>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Display Order</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Spec</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>MB-M1-GR-256</TableCell>
                    <TableCell>1155464853</TableCell>
                    <TableCell>
                      <pre className="text-xs font-mono">
                        {`{
  "RAM":
  "8GB"
}`}
                      </pre>
                    </TableCell>
                    <TableCell>$ 1000</TableCell>
                    <TableCell>$ 3000</TableCell>
                    <TableCell>5</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-gray-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  className="text-indigo-900 hover:underline"
                >
                  Click here to add more variants +
                </Button>
              </div>

              {/* Pagination */}
              <div className="mt-4">
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-900 hover:bg-indigo-800 text-white"
              onClick={handleAdd}
            >
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
