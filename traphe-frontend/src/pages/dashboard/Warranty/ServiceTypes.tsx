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
import { Search, Plus, Edit, Trash2, Loader2, Wrench } from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { repairService } from "@/services/repair-service.service";
import type { RepairService } from "@/types/repair-service.types";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";

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
    <PageContainer>
      <PageHeader
        title="Service Types"
        subtitle="Manage repair and maintenance service offerings"
        onRefresh={fetchServices}
      />

      <div className="flex justify-end mb-6">
        <Button
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg"
          onClick={handleOpenCreate}
        >
          <Plus className="w-4 h-4 mr-2" /> New Service
        </Button>
      </div>

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search services..."
                className="pl-10 bg-white border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="mt-3 text-slate-600">Loading services...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <EmptyState
              icon={<Wrench className="w-8 h-8 text-slate-400" />}
              title="No services found"
              description="Create your first service type to get started"
            />
          ) : (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                    <TableHead className="font-semibold text-slate-600">
                      Service Name
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Description
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Standard Price
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Duration
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Status
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-600">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow key={service.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-800">
                        {service.name}
                      </TableCell>
                      <TableCell className="text-slate-500 max-w-[200px] truncate">
                        {service.description}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {service.standardPrice.toLocaleString()}₫
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {service.estimatedDuration}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            service.isActive
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : "bg-gray-50 text-gray-400 border-gray-200"
                          }
                        >
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-slate-100"
                            onClick={() => handleOpenEdit(service)}
                          >
                            <Edit className="w-4 h-4 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50"
                            onClick={() => {
                              setServiceToDelete(service);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
        itemName={serviceToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
        contextMessage="service"
      />
    </PageContainer>
  );
}
