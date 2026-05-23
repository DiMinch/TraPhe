import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Loader2, RefreshCw } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { customerTierService } from "@/services/customer-tier.service";
import type { CustomerTier } from "@/types/customer.types";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";

export default function CustomerTierPage() {
  const [tiers, setTiers] = useState<CustomerTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<CustomerTier | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [tierToDelete, setTierToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    name: "",
    minPoint: 0,
    discountRate: 0,
    description: "",
  });

  const fetchTiers = async () => {
    setIsLoading(true);
    try {
      const res = await customerTierService.getAllTiers();
      if (res.statusCode === 200 && res.data) {
        // Handle both direct array and paginated response
        const tiersData = Array.isArray(res.data)
          ? res.data
          : (res.data as any)?.content || [];
        setTiers(tiersData);
      }
    } catch (error) {
      toast.error("Failed to load tiers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const totalPages = Math.ceil(tiers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTiers = tiers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEditClick = (tier: CustomerTier) => {
    setEditingTier(tier);
    setFormData({
      name: tier.name,
      minPoint: tier.minPoint,
      discountRate: tier.discountRate * 100,
      description: tier.description || "",
    });
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingTier(null);
    setFormData({ name: "", minPoint: 0, discountRate: 0, description: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) return toast.warning("Name is required");

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        discountRate: formData.discountRate / 100,
      };

      let res;
      if (editingTier) {
        res = await customerTierService.updateTier(editingTier.id, payload);
      } else {
        res = await customerTierService.createTier(payload);
      }

      if (res.statusCode === 200 || res.statusCode === 201) {
        toast.success(editingTier ? "Tier updated" : "Tier created");
        setIsModalOpen(false);
        fetchTiers();
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (tier: CustomerTier) => {
    setTierToDelete({ id: tier.id, name: tier.name });
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tierToDelete) return;
    try {
      await customerTierService.deleteTier(tierToDelete.id);
      toast.success("Tier deleted");
      fetchTiers();
    } catch (error) {
      toast.error("Failed to delete tier");
    }
    setIsDeleteOpen(false);
  };

  const handleToggleStatus = async (tier: CustomerTier) => {
    try {
      await customerTierService.toggleStatus(tier.id);
      toast.success(
        `Tier ${tier.status === "ACTIVE" ? "deactivated" : "activated"}`,
      );
      fetchTiers();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleRecalculate = async () => {
    const toastId = toast.loading("Recalculating customer tiers...");
    try {
      await customerTierService.recalculateAll();
      toast.success("Recalculation completed", { id: toastId });
      fetchTiers();
    } catch (error) {
      toast.error("Failed to recalculate", { id: toastId });
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Customer Tiers"
        subtitle="Manage loyalty tiers and rewards"
      />

      <div className="flex items-center justify-end gap-2 mb-6">
        <Button variant="outline" onClick={handleRecalculate}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Recalculate All
        </Button>
        <Button
          className="bg-gradient-to-r from-roast to-roast/90 hover:from-roast/90 hover:to-roast/80 text-white shadow-md"
          onClick={handleCreateClick}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Tier
        </Button>
      </div>

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="rounded-md border border-slate-200 mb-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                  <TableHead>Tier Name</TableHead>
                  <TableHead>Min Points</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Customers</TableHead>
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
                ) : (
                  currentTiers.map((tier) => (
                    <TableRow key={tier.id}>
                      <TableCell className="font-medium">{tier.name}</TableCell>
                      <TableCell>{tier.minPoint.toLocaleString()}</TableCell>
                      <TableCell>
                        {(tier.discountRate * 100).toFixed(0)}%
                      </TableCell>
                      <TableCell>{tier.customerCount || 0}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tier.status === "ACTIVE" ? "default" : "secondary"
                          }
                          className={`cursor-pointer ${tier.status === "ACTIVE" ? "bg-green-600" : "bg-gray-400"}`}
                          onClick={() => handleToggleStatus(tier)}
                        >
                          {tier.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:text-roast cursor-pointer"
                            onClick={() => handleEditClick(tier)}
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:text-red-600 cursor-pointer"
                            onClick={() => handleDeleteClick(tier)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages || 1}
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={
                      currentPage === totalPages || totalPages === 0
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingTier ? "Edit Tier" : "Create New Tier"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tier Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Min Points *</Label>
                <Input
                  type="number"
                  value={formData.minPoint}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minPoint: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Discount Rate (%) *</Label>
              <Input
                type="number"
                value={formData.discountRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountRate: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter percentage (e.g., 10 for 10%)
              </p>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-roast to-roast/90 hover:from-roast/90 hover:to-roast/80 text-white shadow-md"
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={tierToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
        contextMessage="tier"
      />
    </PageContainer>
  );
}
