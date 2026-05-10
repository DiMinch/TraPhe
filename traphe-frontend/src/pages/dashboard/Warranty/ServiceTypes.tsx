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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { repairService } from "@/services/repair-service.service";
import type { RepairService } from "@/types/repair-service.types";

export default function ServiceTypesPage() {
  const [services, setServices] = useState<RepairService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingService, setEditingService] = useState<RepairService | null>(
    null,
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<RepairService | null>(
    null,
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    standardPrice: 0,
    estimatedDuration: "",
    category: "",
    isActive: true,
  });

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await repairService.getAllServices();
      if (res.statusCode === 200 && res.data) {
        setServices(res.data);
      }
    } catch (error) {
      toast.error("Failed to load service types");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      standardPrice: 0,
      estimatedDuration: "",
      category: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (service: RepairService) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      standardPrice: service.standardPrice,
      estimatedDuration: service.estimatedDuration || "",
      category: service.category || "",
      isActive: !!service.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || formData.standardPrice < 0) {
      toast.warning("Please fill required fields correctly.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingService) {
        await repairService.updateService(editingService.id, formData);
        toast.success("Service updated successfully");
      } else {
        await repairService.createService(formData);
        toast.success("Service created successfully");
      }
      setIsDialogOpen(false);
      fetchServices();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    try {
      await repairService.deleteService(serviceToDelete.id);
      toast.success("Service deleted");
      fetchServices();
    } catch (error) {
      toast.error("Failed to delete service");
    }
    setIsDeleteOpen(false);
  };

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Service Types</h1>
        <Button
          className="bg-indigo-900 text-white cursor-pointer"
          onClick={handleOpenCreate}
        >
          <Plus className="w-4 h-4 mr-2" /> New Service
        </Button>
      </div>

      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search services..."
                className="pl-9 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Service Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Standard Price</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <Loader2 className="animate-spin inline" />
                    </TableCell>
                  </TableRow>
                ) : filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-10 text-gray-500"
                    >
                      No services found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        {service.name}
                      </TableCell>
                      <TableCell className="text-gray-500 max-w-[200px] truncate">
                        {service.description}
                      </TableCell>
                      <TableCell>
                        {service.standardPrice.toLocaleString()}₫
                      </TableCell>
                      <TableCell>{service.estimatedDuration}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`cursor-pointer ${service.isActive ? "text-green-600!" : "text-gray-400!"}`}
                        >
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            className="cursor-pointer"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(service)}
                          >
                            <Edit className="w-4 h-4 text-blue-600!" />
                          </Button>
                          <Button
                            className="cursor-pointer"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setServiceToDelete(service);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600!" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Service" : "New Service"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Service Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Laptop Cleaning"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (VND) *</Label>
                <Input
                  type="number"
                  value={formData.standardPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      standardPrice: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Est. Duration</Label>
                <Input
                  value={formData.estimatedDuration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedDuration: e.target.value,
                    })
                  }
                  placeholder="e.g. 2 hours"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g. Maintenance"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="active-mode"
                className="data-[state=checked]:bg-green-600 border-gray-200"
                checked={!!formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="active-mode" className="cursor-pointer">
                Active Status
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-indigo-900 text-white cursor-pointer"
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
        itemName={serviceToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
        contextMessage="service"
      />
    </div>
  );
}
