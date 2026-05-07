import { useEffect, useState } from "react";
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
import { Search, Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { format } from "date-fns";
import { warrantyService } from "@/services/warranty.service";
import type { WarrantyTicket } from "@/types/warranty.types";
import { WarrantyStatus } from "@/enums/warranty.enum";
import CreateTicketDialog from "./components/CreateTicketDialog";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";

const getStatusBadge = (status: WarrantyStatus) => {
  switch (status) {
    case WarrantyStatus.RECEIVED:
      return (
        <Badge
          variant="outline"
          className="text-purple-600 border-purple-600 bg-purple-50"
        >
          Received
        </Badge>
      );
    case WarrantyStatus.PENDING:
      return (
        <Badge
          variant="outline"
          className="text-yellow-600 border-yellow-600 bg-yellow-50"
        >
          Pending
        </Badge>
      );
    case WarrantyStatus.IN_PROGRESS:
      return (
        <Badge
          variant="outline"
          className="text-blue-600 border-blue-600 bg-blue-50"
        >
          Processing
        </Badge>
      );
    case WarrantyStatus.COMPLETED:
      return (
        <Badge
          variant="outline"
          className="text-green-600 border-green-600 bg-green-50"
        >
          Completed
        </Badge>
      );
    case WarrantyStatus.RETURNED:
      return (
        <Badge
          variant="outline"
          className="text-gray-600 border-gray-600 bg-gray-50"
        >
          Returned
        </Badge>
      );
    case WarrantyStatus.CANCELED:
      return <Badge variant="destructive">Canceled</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default function WarrantyTicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<WarrantyTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<WarrantyTicket | null>(
    null,
  );

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await warrantyService.getAllTickets();
      if (res.statusCode === 200 && res.data) {
        setTickets(res.data);
      }
    } catch (error) {
      toast.error("Failed to load warranty tickets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!ticketToDelete) return;
    try {
      await warrantyService.deleteTicket(ticketToDelete.id);
      toast.success("Ticket deleted");
      fetchTickets();
    } catch (error) {
      toast.error("Failed to delete ticket");
    }
    setIsDeleteOpen(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Warranty Tickets</h1>
        <Button
          className="bg-indigo-900 cursor-pointer text-white"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by Ticket No, Serial, Customer..."
                className="pl-9 bg-white"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Ticket No</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product / Serial</TableHead>
                  <TableHead>Received Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Technician</TableHead>
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
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-gray-500"
                    >
                      No tickets found
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/warranty/tickets/${ticket.id}`)}
                    >
                      <TableCell className="font-medium text-indigo-600">
                        {ticket.ticketNumber}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{ticket.customerName}</div>
                        <div className="text-xs text-gray-500">
                          {ticket.customerPhone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="truncate max-w-[150px]">
                          {ticket.productName}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {ticket.serialNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(ticket.receivedDate), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>
                        {ticket.technicianName || "Unassigned"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation(); /* Edit logic */
                            }}
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTicketToDelete(ticket);
                              setIsDeleteOpen(true);
                            }}
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
        </CardContent>
      </Card>

      <CreateTicketDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={fetchTickets}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={ticketToDelete?.ticketNumber || ""}
        onConfirm={handleDeleteConfirm}
        contextMessage="ticket"
      />
    </div>
  );
}
