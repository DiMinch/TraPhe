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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Plus,
  Search,
  Upload,
  Edit,
  Trash2,
  TrendingUp,
  Loader2,
  Users,
  UserPlus,
  Crown,
  RefreshCw,
  Download,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { customerService } from "@/services/customer.service";
import { customerTierService } from "@/services/customer-tier.service";
import type { Customer, CustomerTier } from "@/types/customer.types";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";
import { exportService, type ExportColumn } from "@/services/export.service";

export default function CustomerPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeTiers, setActiveTiers] = useState<CustomerTier[]>([]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [newCustomer, setNewCustomer] = useState({
    fullName: "",
    phone: "",
    email: "",
    tierId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODO: implement pagination later
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [custRes, tierRes] = await Promise.all([
        customerService.getCustomers(),
        customerTierService.getActiveTiers(),
      ]);

      if (custRes.statusCode === 200 && custRes.data) {
        // Handle both direct array and paginated response
        const customersData = Array.isArray(custRes.data)
          ? custRes.data
          : (custRes.data as any)?.content || [];

        // Sort by createdAt descending (newest first)
        customersData.sort((a: Customer, b: Customer) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

        setCustomers(customersData);
      }
      if (tierRes.statusCode === 200 && tierRes.data) {
        // Handle both direct array and paginated response
        const tiersData = Array.isArray(tierRes.data)
          ? tierRes.data
          : (tierRes.data as any)?.content || [];
        setActiveTiers(tiersData);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteClick = (customer: { id: string; name: string }) => {
    setCustomerToDelete(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (customerToDelete) {
      try {
        await customerService.deleteCustomer(customerToDelete.id);
        toast.success("Customer deleted successfully");
        setCustomers(customers.filter((c) => c.id !== customerToDelete.id));
      } catch (error) {
        toast.error("Failed to delete customer");
      }
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.fullName || !newCustomer.phone || !newCustomer.tierId) {
      toast.warning("Please fill required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await customerService.createCustomer({
        fullName: newCustomer.fullName,
        phone: newCustomer.phone,
        email: newCustomer.email,
        tierId: newCustomer.tierId,
      });

      if (res.statusCode === 200 || res.statusCode === 201) {
        toast.success("Customer added successfully");
        setIsNewCustomerOpen(false);
        setNewCustomer({ fullName: "", phone: "", email: "", tierId: "" });
        fetchData();
      } else {
        toast.error(res.message || "Failed to add customer");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error adding customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  // TODO: delete after implementing pagination
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const currentCustomers = customers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Export customers to Excel
  const handleExportExcel = () => {
    if (customers.length === 0) {
      toast.warning("No customers to export");
      return;
    }

    const columns: ExportColumn<Customer>[] = [
      { key: "fullName", header: "Customer Name" },
      { key: "email", header: "Email" },
      { key: "phone", header: "Phone" },
      { key: "tier.name", header: "Tier" },
      { key: "totalOrders", header: "Total Orders" },
      {
        key: "totalSpent",
        header: "Total Spent",
        formatter: (value) => (value ? `$${value.toLocaleString()}` : "$0"),
      },
      {
        key: "createdAt",
        header: "Created Date",
        formatter: (value) =>
          value ? format(new Date(value), "dd/MM/yyyy") : "",
      },
    ];

    try {
      exportService.exportToExcel(customers, columns, "customers_export");
      toast.success("Customers exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export customers");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Customer List"
        subtitle="Manage your customers and memberships"
        onRefresh={fetchData}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-sm text-blue-100">Total Customer</p>
              </div>
              <p className="text-3xl font-bold">{customers.length}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs text-blue-100">
                  25% (vs last 3 months)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <p className="text-sm text-emerald-100">New Customer</p>
              </div>
              <p className="text-3xl font-bold">10</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs text-emerald-100">
                  25% (vs last 3 months)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Crown className="w-5 h-5" />
                </div>
                <p className="text-sm text-amber-100">VIP Customer</p>
              </div>
              <p className="text-3xl font-bold">2</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-amber-100">
                  0% (vs last 3 months)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-end gap-3 mb-6">
        <Button
          onClick={handleExportExcel}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Excel
        </Button>
        <Button
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md"
          onClick={() => setIsNewCustomerOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Customer
        </Button>
        <Button
          variant="outline"
          className="border-slate-200 hover:bg-slate-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Import CSV
        </Button>
        <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md">
          <Upload className="w-4 h-4 mr-2" />
          Bulk Update
        </Button>
      </div>

      {/* Main Table */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Search */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by Name, Phone or Email"
                className="pl-10 bg-white border-slate-200 focus:border-primary"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <span className="mt-3 text-slate-500 font-medium">
                Loading customers...
              </span>
            </div>
          ) : customers.length === 0 ? (
            <EmptyState
              icon={<Users className="w-8 h-8 text-slate-400" />}
              title="No customers found"
              description="Start by adding your first customer"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                    <TableHead className="font-semibold text-slate-600">
                      Customer
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Tier
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Total Spent
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Points
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">
                      Created At
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-600">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell>
                        <button
                          onClick={() => navigate(`/customer/${customer.id}`)}
                          className="text-left hover:text-primary cursor-pointer transition-colors"
                        >
                          <div className="font-medium text-slate-800">
                            {customer.fullName}
                          </div>
                          <div className="text-sm text-slate-500">
                            {customer.phone}
                          </div>
                          <div className="text-xs text-slate-400">
                            {customer.email}
                          </div>
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">
                          {customer.tier?.name || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-800">
                        {customer.totalPurchase?.toLocaleString("vi-VN")}₫
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-200"
                        >
                          {customer.loyaltyPoint?.pointsAvailable || 0} pts
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {customer.createdAt
                          ? format(new Date(customer.createdAt), "dd/MM/yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-600 hover:text-primary hover:bg-primary/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-600 hover:text-red-600 hover:bg-red-50"
                            onClick={() =>
                              handleDeleteClick({
                                id: customer.id,
                                name: customer.fullName,
                              })
                            }
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
          )}

          {/* Pagination */}
          {customers.length > 0 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="cursor-pointer hover:bg-slate-100"
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="cursor-pointer hover:bg-slate-100"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Customer Dialog */}
      <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
        <DialogContent className="max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>New Customer</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={newCustomer.fullName}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, fullName: e.target.value })
                }
                placeholder="Enter customer name"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Phone *</Label>
              <Input
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
                placeholder="Enter phone number"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
                placeholder="Enter email address"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Tier *</Label>
              <Select
                value={newCustomer.tierId}
                onValueChange={(value) =>
                  setNewCustomer({ ...newCustomer, tierId: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a tier" />
                </SelectTrigger>
                <SelectContent>
                  {activeTiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewCustomerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-indigo-900 hover:bg-indigo-800 text-white"
              onClick={handleAddCustomer}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={customerToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
        contextMessage="from the customer list"
      />
    </PageContainer>
  );
}
