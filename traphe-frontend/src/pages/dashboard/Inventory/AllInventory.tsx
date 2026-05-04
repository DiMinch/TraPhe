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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BellIcon,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Minus,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  physical: number;
  reserved: number;
  available: number;
  status: "Active" | "Inactive";
}

export default function AllInventoryPage() {
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newQuantity, setNewQuantity] = useState(0);
  const [reason, setReason] = useState("Data Entry Error");
  const [note, setNote] = useState("");

  const inventoryItems: InventoryItem[] = [
    {
      id: 1,
      name: "LCD Screen",
      sku: "MS-M1-GR-256",
      category: "Screen",
      supplier: "ABC",
      physical: 45,
      reserved: 40,
      available: 5,
      status: "Active",
    },
  ];

  const handleStockAdjustment = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewQuantity(item.physical);
    setIsStockAdjustmentOpen(true);
  };

  const handleUpdate = () => {
    // Handle update logic here
    console.log("Update stock:", {
      item: selectedItem,
      newQuantity,
      difference: newQuantity - (selectedItem?.physical || 0),
      reason,
      note,
    });
    setIsStockAdjustmentOpen(false);
  };

  const difference = selectedItem ? newQuantity - selectedItem.physical : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Inventory</h1>
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

      {/* Tabs */}
      <Tabs defaultValue="variants" className="mb-4">
        <TabsList className="bg-white">
          <TabsTrigger value="variants">Product Variants</TabsTrigger>
          <TabsTrigger value="components">Parts Component</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search" className="pl-10 bg-white" />
          </div>

          {/* Filters */}
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter className="w-4 h-4" />
          </Button>

          <Select defaultValue="all-days">
            <SelectTrigger className="w-[140px] bg-white borderColor:#E5E5E5">
              <SelectValue placeholder="All days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-days">All days</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-categories">
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">All categories</SelectItem>
              <SelectItem value="laptop">Laptop</SelectItem>
              <SelectItem value="screen">Screen</SelectItem>
              <SelectItem value="mouse">Mouse</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-status">
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
            Export Excel
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Suppliers</TableHead>
                  <TableHead>Physical</TableHead>
                  <TableHead>Reserved</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.sku}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {item.category}
                    </TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>{item.physical}</TableCell>
                    <TableCell>{item.reserved}</TableCell>
                    <TableCell>{item.available}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          item.status === "Active"
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleStockAdjustment(item)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="w-4 h-4" />
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

      {/* Stock Adjustment Dialog */}
      <Dialog
        open={isStockAdjustmentOpen}
        onOpenChange={setIsStockAdjustmentOpen}
      >
        <DialogContent className="max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Stock Adjustment
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Product Variant */}
            <div className="space-y-2">
              <Label>Product Variant</Label>
              <Select defaultValue="macbook">
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="macbook">
                    MacBook Air M1 (Ram 8GB, 256GB)
                  </SelectItem>
                  <SelectItem value="other">Other Product</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">SKU: MB-M1-GR-256</p>
            </div>

            {/* Quantity Adjustment */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Current Stock</Label>
                <Input
                  value={selectedItem?.physical || 0}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label>New Quantity</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setNewQuantity(Math.max(0, newQuantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={newQuantity}
                    onChange={(e) =>
                      setNewQuantity(parseInt(e.target.value) || 0)
                    }
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setNewQuantity(newQuantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Difference</Label>
                <Input
                  value={difference > 0 ? `+${difference}` : difference}
                  disabled
                  className={`bg-gray-50 ${
                    difference > 0
                      ? "text-green-600"
                      : difference < 0
                        ? "text-red-600"
                        : ""
                  }`}
                />
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Data Entry Error">
                    Data Entry Error
                  </SelectItem>
                  <SelectItem value="Damaged">Damaged</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                  <SelectItem value="Recount">Recount</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea
                placeholder="None"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-white h-20 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsStockAdjustmentOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-indigo-900 hover:bg-indigo-800 text-white"
                onClick={handleUpdate}
              >
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
