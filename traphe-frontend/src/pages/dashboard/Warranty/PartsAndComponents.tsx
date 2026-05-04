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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Upload,
  Edit,
  Trash2,
  MoreHorizontal,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { CURRENT_USER } from "@/constants/user";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { partsAndComponents as initialParts } from "@/data/mockData";

interface PartComponent {
  id: number;
  name: string;
  partNumber: string;
  category: string;
  unitPrice: string;
  quantityInStock: number;
  reorderLevel: number;
  supplier: string;
}

export default function PartsAndComponentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewPartDialogOpen, setIsNewPartDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<PartComponent | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [parts, setParts] = useState<PartComponent[]>(initialParts);

  const [formData, setFormData] = useState<Partial<PartComponent>>({
    name: "",
    partNumber: "",
    category: "",
    unitPrice: "",
    quantityInStock: 0,
    reorderLevel: 0,
    supplier: "",
  });

  const filteredParts = parts.filter(
    (part) =>
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.supplier.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredParts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentParts = filteredParts.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleAddPart = () => {
    if (formData.name && formData.partNumber) {
      const newPart: PartComponent = {
        id: parts.length + 1,
        name: formData.name,
        partNumber: formData.partNumber,
        category: formData.category || "",
        unitPrice: formData.unitPrice || "$ 0",
        quantityInStock: formData.quantityInStock || 0,
        reorderLevel: formData.reorderLevel || 0,
        supplier: formData.supplier || "",
      };
      setParts([...parts, newPart]);
      setIsNewPartDialogOpen(false);
      resetForm();
    }
  };

  const handleEditClick = (part: PartComponent) => {
    setSelectedPart(part);
    setFormData(part);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePart = () => {
    if (selectedPart && formData.name && formData.partNumber) {
      setParts(
        parts.map((p) =>
          p.id === selectedPart.id
            ? ({ ...p, ...formData } as PartComponent)
            : p,
        ),
      );
      setIsEditDialogOpen(false);
      resetForm();
    }
  };

  const handleDeleteClick = (part: PartComponent) => {
    setSelectedPart(part);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedPart) {
      setParts(parts.filter((p) => p.id !== selectedPart.id));
      setIsDeleteDialogOpen(false);
      setSelectedPart(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      partNumber: "",
      category: "",
      unitPrice: "",
      quantityInStock: 0,
      reorderLevel: 0,
      supplier: "",
    });
    setSelectedPart(null);
  };

  const handleImportCSV = () => {
    // Implement CSV import logic
    alert("CSV Import functionality will be implemented");
  };

  const handleBulkUpdate = () => {
    // Implement bulk update logic
    alert("Bulk Update functionality will be implemented");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Parts & Components</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome {CURRENT_USER.role} {CURRENT_USER.name}
          </span>
          <Button variant="outline" size="icon">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            CN
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        <Button
          className="bg-indigo-900 hover:bg-indigo-800 text-white"
          onClick={() => setIsNewPartDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Part/Component
        </Button>
        <Button
          className="bg-indigo-900 hover:bg-indigo-800 text-white"
          onClick={handleImportCSV}
        >
          <Upload className="w-4 h-4 mr-2" />
          Import CSV
        </Button>
        <Button
          className="bg-[#F59E0B] hover:bg-[#D97706] text-white"
          onClick={handleBulkUpdate}
        >
          Bulk Update
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-sm bg-white">
        <CardContent className="pt-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by Ticket No, Phone or Serial"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-700 text-sm">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm">
                    Part Number
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm">
                    Category
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm">
                    Supplier
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm">
                    Unit Price
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm">
                    Quantity In Stock
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm">
                    Reorder Level
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentParts.map((part) => (
                  <TableRow key={part.id} className="border-b border-gray-200">
                    <TableCell className="font-medium text-sm text-gray-900">
                      {part.name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {part.partNumber}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {part.category}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {part.supplier}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {part.unitPrice}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {part.quantityInStock}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {part.reorderLevel}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-gray-100"
                          onClick={() => handleEditClick(part)}
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-gray-100"
                          onClick={() => handleDeleteClick(part)}
                        >
                          <Trash2 className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-gray-100"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center mt-6 gap-3">
            <Button
              variant="ghost"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="text-sm text-gray-700"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <div className="px-3 py-1 text-sm text-gray-900 font-medium">
              {currentPage}
            </div>
            <Button
              variant="ghost"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="text-sm text-gray-700"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* New Part Dialog */}
      <Dialog open={isNewPartDialogOpen} onOpenChange={setIsNewPartDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>New Part/Component</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Name *
              </Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter part name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Part Number *
              </Label>
              <Input
                value={formData.partNumber}
                onChange={(e) =>
                  setFormData({ ...formData, partNumber: e.target.value })
                }
                placeholder="Enter part number"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Category
              </Label>
              <Input
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Enter category"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Supplier
              </Label>
              <Input
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                placeholder="Enter supplier"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Unit Price
              </Label>
              <Input
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unitPrice: e.target.value,
                  })
                }
                placeholder="Enter unit price (e.g., $ 250,000)"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Quantity In Stock
              </Label>
              <Input
                type="number"
                value={formData.quantityInStock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantityInStock: Number(e.target.value),
                  })
                }
                placeholder="Enter quantity"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Reorder Level
              </Label>
              <Input
                type="number"
                value={formData.reorderLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reorderLevel: Number(e.target.value),
                  })
                }
                placeholder="Enter reorder level"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsNewPartDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white"
              onClick={handleAddPart}
            >
              Add Part
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Part Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Edit Part/Component</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Name *
              </Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter part name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Part Number *
              </Label>
              <Input
                value={formData.partNumber}
                onChange={(e) =>
                  setFormData({ ...formData, partNumber: e.target.value })
                }
                placeholder="Enter part number"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Category
              </Label>
              <Input
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Enter category"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Supplier
              </Label>
              <Input
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                placeholder="Enter supplier"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Unit Price
              </Label>
              <Input
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unitPrice: e.target.value,
                  })
                }
                placeholder="Enter unit price (e.g., $ 250,000)"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Quantity In Stock
              </Label>
              <Input
                type="number"
                value={formData.quantityInStock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantityInStock: Number(e.target.value),
                  })
                }
                placeholder="Enter quantity"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Reorder Level
              </Label>
              <Input
                type="number"
                value={formData.reorderLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reorderLevel: Number(e.target.value),
                  })
                }
                placeholder="Enter reorder level"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white"
              onClick={handleUpdatePart}
            >
              Update Part
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={selectedPart?.name || ""}
        onConfirm={handleDeleteConfirm}
        contextMessage="part/component"
      />
    </div>
  );
}
