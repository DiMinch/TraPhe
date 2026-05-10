import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { partService } from "@/services/part.service";
import type { PartComponent } from "@/types/part.types";

const MOCK_SUPPLIERS = [
  { id: "39696383-79b9-4899-b9d9-2f8f0ca92884", name: "ABC Company" },
  { id: "supplier-002", name: "XYZ Distributor" },
];

export default function PartsAndComponentsPage() {
  const [parts, setParts] = useState<PartComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPart, setEditingPart] = useState<PartComponent | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [partToDelete, setPartToDelete] = useState<PartComponent | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    partType: "",
    supplierId: "",
    unit: "Cái",
    unitPrice: 0,
    minStock: 5,
  });

  const fetchParts = async () => {
    setIsLoading(true);
    try {
      const res =
        filterType === "low-stock"
          ? await partService.getLowStockParts()
          : await partService.getAllParts();

      if (res.statusCode === 200 && res.data) {
        setParts(res.data);
      }
    } catch (error) {
      toast.error("Failed to load parts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, [filterType]);

  const handleOpenCreate = () => {
    setEditingPart(null);
    setFormData({
      name: "",
      partType: "",
      supplierId: "",
      unit: "Cái",
      unitPrice: 0,
      minStock: 5,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (part: PartComponent) => {
    setEditingPart(part);
    setFormData({
      name: part.name,
      partType: part.partType,
      supplierId: part.supplier?.supplierId || "",
      unit: part.unit,
      unitPrice: part.sellingPrice,
      minStock: part.minStock,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.supplierId || formData.unitPrice < 0) {
      toast.warning("Please fill required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPart) {
        await partService.updatePart(editingPart.id, formData);
        toast.success("Part updated successfully");
      } else {
        await partService.createPart(formData);
        toast.success("Part created successfully");
      }
      setIsDialogOpen(false);
      fetchParts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!partToDelete) return;
    try {
      await partService.deletePart(partToDelete.id);
      toast.success("Part deleted");
      fetchParts();
    } catch (error) {
      toast.error("Failed to delete part");
    }
    setIsDeleteOpen(false);
  };

  const filteredParts = parts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.partType.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Parts & Components</h1>
        <Button
          className="bg-indigo-900 text-white cursor-pointer"
          onClick={handleOpenCreate}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Part
        </Button>
      </div>

      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search parts by name or type..."
                className="pl-9 bg-white w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
                className={
                  filterType === "all"
                    ? "bg-indigo-900 text-white cursor-pointer"
                    : "cursor-pointe"
                }
              >
                All Parts
              </Button>
              <Button
                variant={filterType === "low-stock" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("low-stock")}
                className={
                  filterType === "low-stock"
                    ? "bg-red-600 hover:bg-red-700 cursor-pointer"
                    : "text-red-600 border-red-200 hover:bg-red-50 cursor-pointer"
                }
              >
                Low Stock Alert
              </Button>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Part Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Price (Sell)</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <Loader2 className="animate-spin inline" />
                    </TableCell>
                  </TableRow>
                ) : filteredParts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-gray-500"
                    >
                      No parts found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParts.map((part) => {
                    const isLowStock = part.currentStock <= part.minStock;
                    return (
                      <TableRow key={part.id}>
                        <TableCell className="font-medium">
                          {part.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{part.partType}</Badge>
                        </TableCell>
                        <TableCell>{part.supplier?.name || "N/A"}</TableCell>
                        <TableCell>
                          {part.sellingPrice?.toLocaleString()}₫
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-bold ${isLowStock ? "text-red-600" : "text-gray-900"}`}
                          >
                            {part.currentStock} {part.unit}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <Button
                              className="cursor-pointer"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(part)}
                            >
                              <Edit className="w-4 h-4 text-blue-600!" />
                            </Button>
                            <Button
                              className="cursor-pointer"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setPartToDelete(part);
                                setIsDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-600!" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingPart ? "Edit Part" : "Add New Part"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Part Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Part Type</Label>
                <Input
                  value={formData.partType}
                  onChange={(e) =>
                    setFormData({ ...formData, partType: e.target.value })
                  }
                  placeholder="e.g. KEYBOARD"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Selling Price *</Label>
                <Input
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unitPrice: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Stock Level</Label>
                <Input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minStock: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Supplier *</Label>
                <Select
                  value={formData.supplierId}
                  onValueChange={(val) =>
                    setFormData({ ...formData, supplierId: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_SUPPLIERS.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-indigo-900 text-white"
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}{" "}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={partToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
        contextMessage="part"
      />
    </div>
  );
}
