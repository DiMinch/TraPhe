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
  MoreHorizontal,
  BellIcon,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { CURRENT_USER } from "@/constants/user";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { customerService } from "@/services/customer.service";
import { customerTierService } from "@/services/customer-tier.service";
import type { Customer, CustomerTier } from "@/types/customer";
import { toast } from "sonner";
import { format } from "date-fns";

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
        setCustomers(custRes.data);
      }
      if (tierRes.statusCode === 200 && tierRes.data) {
        setActiveTiers(tierRes.data);
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Customer List</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome {CURRENT_USER.role} {CURRENT_USER.name}
          </span>
          <Button variant="outline" size="icon">
            <BellIcon className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            CN
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Customer</p>
                <p className="text-3xl font-bold text-gray-900">500</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">
                    25% (vs last 3 months)
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-gray-400">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">New Customer</p>
                <p className="text-3xl font-bold text-gray-900">10</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">
                    25% (vs last 3 months)
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-gray-400">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">VIP Customer</p>
                <p className="text-3xl font-bold text-gray-900">2</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs text-gray-600">
                    0% (vs last 3 months)
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-gray-400">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        <Button
          className="bg-indigo-900 hover:bg-indigo-800 text-white"
          onClick={() => setIsNewCustomerOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Customer
        </Button>
        <Button className="bg-indigo-900 hover:bg-indigo-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Import CSV
        </Button>
        <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
          <Upload className="w-4 h-4 mr-2" />
          Bulk Update
        </Button>
      </div>

      {/* Main Table */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          {/* Search */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by Name, Phone or Email"
                className="pl-10 bg-white"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Customer</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <button
                          onClick={() => navigate(`/customer/${customer.id}`)}
                          className="text-left hover:text-indigo-900 cursor-pointer"
                        >
                          <div className="font-medium text-gray-900">
                            {customer.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.phone}
                          </div>
                          <div className="text-xs text-gray-400">
                            {customer.email}
                          </div>
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100"
                        >
                          {customer.tier?.name || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {customer.totalPurchase?.toLocaleString("vi-VN")}₫
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {customer.loyaltyPoint?.pointsAvailable || 0}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {customer.createdAt
                          ? format(new Date(customer.createdAt), "dd/MM/yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-indigo-600 cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-600 cursor-pointer"
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
          <div className="items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="cursor-pointer"
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="cursor-pointer"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
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
    </div>
  );
}
