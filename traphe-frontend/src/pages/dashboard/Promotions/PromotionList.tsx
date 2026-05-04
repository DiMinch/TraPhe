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
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Download,
  Edit,
  Trash2,
  MoreHorizontal,
  BellIcon,
  Filter,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { CURRENT_USER } from "@/constants/user";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { dashboardPromotions } from "@/data/mockData";

interface Promotion {
  id: number;
  name: string;
  subtitle: string;
  type: string;
  typeDetail: string;
  scope: string;
  period: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  applicableTiers: string[];
  priority: string;
  priorityLevel: number;
}

export default function PromotionListPage() {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [promotions, setPromotions] =
    useState<Promotion[]>(dashboardPromotions);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(promotions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPromotions = promotions.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      case "EXPIRED":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const handleDeleteClick = (promotion: { id: number; name: string }) => {
    setPromotionToDelete(promotion);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (promotionToDelete) {
      setPromotions(promotions.filter((p) => p.id !== promotionToDelete.id));
      setIsDeleteDialogOpen(false);
      setPromotionToDelete(null);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Promotion List</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome {CURRENT_USER.role} {CURRENT_USER.name}
          </span>
          <Button variant="outline" size="icon">
            <BellIcon />
          </Button>
          <Button variant="outline" size="sm">
            CN
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        <Button className="bg-indigo-900 hover:bg-indigo-800 text-white">
          <Plus className="mr-2" />
          New Promotion
        </Button>
        <Button className="bg-indigo-900 hover:bg-indigo-800 text-white">
          <Plus className="mr-2" />
          Import CSV
        </Button>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <Download className="mr-2" />
          Bulk Update
        </Button>
      </div>

      {/* Main Card */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search by Name" className="pl-10 bg-white" />
            </div>

            <Button variant="outline" size="icon" className="shrink-0">
              <Filter />
            </Button>

            <Select defaultValue="all-status">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-type">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-type">All type</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
                <SelectItem value="bogo">BOGO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applicable Tiers</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPromotions.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell>
                    <div>
                      <button
                        onClick={() => navigate(`/promotions/${promo.name}`)}
                        className="font-medium text-indigo-900 hover:underline cursor-pointer"
                      >
                        {promo.name}
                      </button>
                      <div className="text-sm text-gray-500">
                        {promo.subtitle}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{promo.type}</div>
                      <div className="text-sm text-gray-500">
                        {promo.typeDetail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{promo.scope}</TableCell>
                  <TableCell className="whitespace-pre-line">
                    {promo.period}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getStatusColor(promo.status)}
                      variant="secondary"
                    >
                      {promo.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                      variant="secondary"
                    >
                      {promo.applicableTiers[0]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge
                        className="bg-gray-200 text-gray-800 hover:bg-gray-200"
                        variant="secondary"
                      >
                        {promo.priority}
                      </Badge>
                      <div className="text-sm font-medium">
                        {promo.priorityLevel}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleDeleteClick({
                            id: promo.id,
                            name: promo.name,
                          })
                        }
                      >
                        <Trash2 />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
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
                        onClick={() => setCurrentPage(page)}
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    className={
                      currentPage === totalPages
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

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={promotionToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
        contextMessage="from the promotion list"
      />
    </div>
  );
}
