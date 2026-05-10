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
import { Search, Plus, Edit, Trash2, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { partService } from "@/services/part.service";
import type { PartComponent } from "@/types/part.types";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";

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
    <PageContainer>
      <PageHeader
        title="Parts & Components"
        subtitle="Manage spare parts and components inventory"
        onRefresh={fetchParts}
      />

      <div className="flex justify-end mb-6">
        <Button
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg"
          onClick={handleOpenCreate}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Part
        </Button>
      </div>

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4 mb-6 w-full">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search parts by name or type..."
                className="pl-10 bg-white border-slate-200 w-full"
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
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white"
                    : "border-slate-200 hover:bg-slate-50"
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
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                    : "text-red-600 border-red-200 hover:bg-red-50"
                }
              >
                Low Stock Alert
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="mt-3 text-slate-600">Loading parts...</p>
            </div>
          ) : filteredParts.length === 0 ? (
            <EmptyState
              icon={<Package className="w-8 h-8 text-slate-400" />}
              title="No parts found"
              description="Add your first part or component to get started"
            />
          ) : (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                    <TableHead className="font-semibold text-slate-600">
                      Part Name
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Type
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Supplier
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Price (Sell)
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Stock
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-600">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParts.map((part) => {
                    const isLowStock = part.currentStock <= part.minStock;
                    return (
                      <TableRow key={part.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium text-slate-800">
                          {part.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-slate-200">
                            {part.partType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {part.supplier?.name || "N/A"}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {part.sellingPrice?.toLocaleString()}₫
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-bold ${isLowStock ? "text-red-600" : "text-emerald-600"}`}
                          >
                            {part.currentStock} {part.unit}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-slate-100"
                              onClick={() => handleOpenEdit(part)}
                            >
                              <Edit className="w-4 h-4 text-slate-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-50"
                              onClick={() => {
                                setPartToDelete(part);
                                setIsDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
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
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
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
    </PageContainer>
  );
}
