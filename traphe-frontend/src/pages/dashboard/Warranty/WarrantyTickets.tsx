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
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";

export const getStatusBadge = (status: WarrantyStatus) => {
  switch (status) {
    case WarrantyStatus.RECEIVED:
      return (
        <Badge className="text-purple-700 border-0 bg-purple-100 hover:bg-purple-100">
          Received
        </Badge>
      );
    case WarrantyStatus.PENDING:
      return (
        <Badge className="text-amber-700 border-0 bg-amber-100 hover:bg-amber-100">
          Pending
        </Badge>
      );
    case WarrantyStatus.IN_PROGRESS:
      return (
        <Badge className="text-blue-700 border-0 bg-blue-100 hover:bg-blue-100">
          Processing
        </Badge>
      );
    case WarrantyStatus.COMPLETED:
      return (
        <Badge className="text-green-700 border-0 bg-green-100 hover:bg-green-100">
          Completed
        </Badge>
      );
    case WarrantyStatus.RETURNED:
      return (
        <Badge className="text-slate-700 border-0 bg-slate-100 hover:bg-slate-100">
          Returned
        </Badge>
      );
    case WarrantyStatus.CANCELED:
      return (
        <Badge className="text-red-700 border-0 bg-red-100 hover:bg-red-100">
          Canceled
        </Badge>
      );
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

      console.log("Tickets API Response:", ticketsRes);

      // Handle response - ticketsRes is ApiResponse<WarrantyTicket[]>
      // ticketsRes.data should be the array or paginated object
      let ticketsData: WarrantyTicket[] = [];

      if (ticketsRes && ticketsRes.statusCode === 200) {
        const responseData = ticketsRes.data;

        if (Array.isArray(responseData)) {
          // Direct array response
          ticketsData = responseData;
        } else if (responseData && typeof responseData === "object") {
          // Cast to any to check various shapes
          const data = responseData as any;
          // Check for paginated response with 'content' field
          if (Array.isArray(data.content)) {
            ticketsData = data.content;
          }
        }
      } else if (Array.isArray(ticketsRes)) {
        // Response might already be unwrapped to just the array
        ticketsData = ticketsRes as unknown as WarrantyTicket[];
      }

      console.log("Parsed tickets:", ticketsData.length, ticketsData);

      // Sort by createdAt descending (newest first)
      if (ticketsData.length > 0) {
        ticketsData.sort((a: WarrantyTicket, b: WarrantyTicket) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
      }

      setTickets(ticketsData);

      if (statsRes && statsRes.statusCode === 200 && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      toast.error("Failed to load data");
      console.error("Error fetching warranty data:", error);
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
    <PageContainer>
      <PageHeader
        title="Warranty Tickets"
        subtitle="Manage warranty requests and repairs"
        onRefresh={fetchData}
      />
      <div className="flex justify-end mb-6">
        <Button
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden">
            <CardContent className="p-4 relative">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">
                    Total Tickets
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    {stats.totalTickets}
                  </h3>
                  <p className="text-xs text-blue-100 mt-1 flex items-center">
                    <Activity className="w-3 h-3 mr-1" />+
                    {stats.ticketsThisMonth} this month
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Ticket className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden">
            <CardContent className="p-4 relative">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-100">
                    Total Revenue
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    {stats.totalRevenue.toLocaleString()}₫
                  </h3>
                  <div className="text-xs text-emerald-100 mt-1 space-x-2">
                    <span>
                      Svc: {(stats.totalServiceRevenue / 1000).toFixed(0)}k
                    </span>
                    <span className="text-emerald-200">|</span>
                    <span>
                      Part: {(stats.totalPartRevenue / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white overflow-hidden">
            <CardContent className="p-4 relative">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-amber-100">
                    Active Work
                  </p>
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex justify-between text-sm mt-3">
                  <div className="text-center">
                    <span className="block font-bold text-lg">
                      {stats.processingCount}
                    </span>
                    <span className="text-xs text-amber-100">Processing</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-lg">
                      {stats.waitingForPartsCount}
                    </span>
                    <span className="text-xs text-amber-100">Waiting</span>
                  </div>
                  <div className="text-center">
                    <span
                      className={`block font-bold text-lg ${stats.overdueCount > 0 ? "text-white" : ""}`}
                    >
                      {stats.overdueCount}
                    </span>
                    <span className="text-xs text-amber-100">Overdue</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-rose-500 to-rose-600 text-white overflow-hidden">
            <CardContent className="p-4 relative flex flex-col justify-between h-full gap-2">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {stats.lowStockPartsCount}
                      </p>
                      <p className="text-xs text-rose-100">Low Stock Parts</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/20 pt-2 mt-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-rose-100" />
                    <span className="text-xs text-rose-100">
                      Avg Repair Time:
                    </span>
                  </div>
                  <span className="text-xs font-semibold">
                    {stats.avgRepairDays} days
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50/80 to-indigo-50/50 border-b border-slate-200/60">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by Ticket No, Serial, Customer..."
                className="pl-10 bg-white border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg h-10 shadow-sm"
              />
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center animate-pulse">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
                <span className="mt-4 text-slate-600 font-medium">
                  Loading tickets...
                </span>
              </div>
            ) : tickets.length === 0 ? (
              <EmptyState
                icon={<Ticket className="w-8 h-8 text-slate-400" />}
                title="No tickets found"
                description="Create your first warranty ticket"
              />
            ) : (
              <div className="rounded-xl border border-slate-200/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/50">
                      <TableHead className="font-semibold text-slate-700">
                        Ticket No
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Customer
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Product / Serial
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Received Date
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Technician
                      </TableHead>
                      <TableHead className="text-center font-semibold text-slate-700">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        className="cursor-pointer border-slate-100 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-indigo-50/30 transition-all duration-200"
                        onClick={() =>
                          navigate(`/warranty/tickets/${ticket.id}`)
                        }
                      >
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="font-mono bg-indigo-50 text-indigo-700 border-indigo-200 rounded-full px-3"
                          >
                            {ticket.ticketNumber}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-800">
                            {ticket.customerName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {ticket.customerPhone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="truncate max-w-[150px] text-slate-800">
                            {ticket.productName}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {ticket.serialNumber}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {format(new Date(ticket.receivedDate), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell className="text-slate-600">
                          {ticket.technicianName || (
                            <span className="text-slate-400 italic">
                              Unassigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              className="cursor-pointer h-9 w-9 rounded-lg hover:bg-indigo-50 transition-colors"
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <Edit className="w-4 h-4 text-indigo-600" />
                            </Button>
                            <Button
                              className="cursor-pointer h-9 w-9 rounded-lg hover:bg-red-50 transition-colors"
                              variant="ghost"
                              size="icon"
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
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
    </PageContainer>
  );
}
