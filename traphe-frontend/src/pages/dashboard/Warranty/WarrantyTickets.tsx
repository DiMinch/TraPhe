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
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Plus,
  Filter,
} from "lucide-react";
import { useState } from "react";
import { warrantyTickets as initialTickets } from "@/data/mockData";
import { useNavigate } from "react-router";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";

interface WarrantyTicket {
  ticketNo: string;
  customer: {
    name: string;
    phone: string;
  };
  product: {
    name: string;
    serialNumber: string;
  };
  technician: {
    name: string;
    receivedDate: string;
  };
  expectedReturnDate: string;
  status: string;
  totalCost: number;
}

export default function WarrantyTicketsPage() {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<{
    ticketNo: string;
  } | null>(null);
  const [tickets, setTickets] = useState<WarrantyTicket[]>(initialTickets);

  const handleDeleteClick = (ticket: { ticketNo: string }) => {
    setTicketToDelete(ticket);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (ticketToDelete) {
      setTickets(tickets.filter((t) => t.ticketNo !== ticketToDelete.ticketNo));
      setIsDeleteDialogOpen(false);
      setTicketToDelete(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Warranty Tickets</h1>
        <div className="flex items-center gap-3">
          <Button className="bg-indigo-900 hover:bg-indigo-800 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
          <Button className="bg-[#F59E0B] hover:bg-[#D97706] text-white">
            Bulk Update
          </Button>
        </div>
      </div>

      <Card className="border-[#E5E5E5]">
        <CardContent className="p-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by Ticket No, Phone or Serial"
                className="pl-10 bg-white"
              />
            </div>

            <Button variant="outline" className="shrink-0">
              <Filter className="w-4 h-4 mr-2" />
              All status
            </Button>

            <Select defaultValue="all-technician">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-technician">All technician</SelectItem>
                <SelectItem value="technician-1">Technician 1</SelectItem>
                <SelectItem value="technician-2">Technician 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">
                    Ticket No.
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Customer
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Product
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Technician
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Expected Return Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Total Cost
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow
                    key={ticket.ticketNo}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      navigate(
                        `/warranty/tickets/${encodeURIComponent(
                          ticket.ticketNo,
                        )}`,
                      )
                    }
                  >
                    <TableCell className="font-medium">
                      {ticket.ticketNo}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {ticket.customer.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {ticket.customer.phone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {ticket.product.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {ticket.product.serialNumber}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {ticket.technician.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          Received: {ticket.technician.receivedDate}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{ticket.expectedReturnDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700 hover:bg-blue-100"
                      >
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      $ {ticket.totalCost}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/warranty/tickets/${encodeURIComponent(
                                ticket.ticketNo,
                              )}`,
                            );
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick({
                              ticketNo: ticket.ticketNo,
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-6">
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

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={ticketToDelete?.ticketNo || ""}
        onConfirm={handleDeleteConfirm}
        contextMessage="warranty ticket"
      />
    </div>
  );
}
