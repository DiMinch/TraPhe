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
import {
  Search,
  Edit,
  Trash2,
  Plus,
  Loader2,
  Ticket,
  DollarSign,
  AlertCircle,
  Activity,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { format } from "date-fns";
import { warrantyService } from "@/services/warranty.service";
import type {
  WarrantyTicket,
  WarrantyDashboardStats,
} from "@/types/warranty.types";
import { WarrantyStatus } from "@/enums/warranty.enum";
import CreateTicketDialog from "./components/CreateTicketDialog";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";

export const getStatusBadge = (status: WarrantyStatus) => {
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
        <Badge variant="outline" className="text-gray-600">
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
  const [stats, setStats] = useState<WarrantyDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<WarrantyTicket | null>(
    null,
  );
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        warrantyService.getAllTickets(),
        warrantyService.getDashboardStats(),
      ]);

      if (ticketsRes.statusCode === 200 && ticketsRes.data) {
        setTickets(ticketsRes.data);
      }
      if (statsRes.statusCode === 200 && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!ticketToDelete) return;
    try {
      await warrantyService.deleteTicket(ticketToDelete.id);
      toast.success("Ticket deleted");
      fetchData();
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
          className="bg-indigo-900 text-white"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Tickets
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {stats.totalTickets}
                </h3>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <Activity className="w-3 h-3 mr-1" />+{stats.ticketsThisMonth}{" "}
                  this month
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <Ticket className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {stats.totalRevenue.toLocaleString()}₫
                </h3>
                <div className="text-xs text-gray-500 mt-1 space-x-2">
                  <span>
                    Svc: {(stats.totalServiceRevenue / 1000).toFixed(0)}k
                  </span>
                  <span className="text-gray-300">|</span>
                  <span>
                    Part: {(stats.totalPartRevenue / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-full text-green-600">
                <DollarSign className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-gray-500">Active Work</p>
                <Activity className="w-4 h-4 text-orange-500" />
              </div>
              <div className="flex justify-between text-sm mt-3">
                <div className="text-center">
                  <span className="block font-bold text-lg">
                    {stats.processingCount}
                  </span>
                  <span className="text-xs text-gray-500">Processing</span>
                </div>
                <div className="text-center">
                  <span className="block font-bold text-lg">
                    {stats.waitingForPartsCount}
                  </span>
                  <span className="text-xs text-gray-500">Waiting Parts</span>
                </div>
                <div className="text-center">
                  <span
                    className={`block font-bold text-lg ${stats.overdueCount > 0 ? "text-red-600" : ""}`}
                  >
                    {stats.overdueCount}
                  </span>
                  <span className="text-xs text-gray-500">Overdue</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-50 rounded text-red-600">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-600">
                      {stats.lowStockPartsCount}
                    </p>
                    <p className="text-xs text-gray-500">Low Stock Parts</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    Avg Repair Time:
                  </span>
                </div>
                <span className="text-xs font-semibold">
                  {stats.avgRepairDays} days
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                        <div className="flex items-center justify-center">
                          <Button
                            className="cursor-pointer"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation(); /* Edit logic */
                            }}
                          >
                            <Edit className="w-4 h-4 text-blue-600!" />
                          </Button>
                          <Button
                            className="cursor-pointer"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTicketToDelete(ticket);
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

      <CreateTicketDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={fetchData}
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
