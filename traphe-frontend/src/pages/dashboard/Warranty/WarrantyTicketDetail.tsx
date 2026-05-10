import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  ArrowLeft,
  Play,
  CheckCircle,
  RotateCcw,
  XCircle,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { warrantyService } from "@/services/warranty.service";
import type { WarrantyTicketDetail } from "@/types/warranty.types";
import { WarrantyStatus } from "@/enums/warranty.enum";
import AddServiceDialog from "./components/AddServiceDialog";
import AddPartDialog from "./components/AddPartDialog";
import OverviewTab from "./components/tabs/OverviewTab";
import ServicesTab from "./components/tabs/ServicesTab";
import PartsTab from "./components/tabs/PartsTab";
import HistoryTab from "./components/tabs/HistoryTab";
import type {
  WarrantyPartItem,
  WarrantyServiceItem,
} from "@/types/warranty.types";

export default function WarrantyTicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<WarrantyTicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isAddPartOpen, setIsAddPartOpen] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await warrantyService.getTicketDetail(id);
      if (res.statusCode === 200 && res.data) {
        setTicket(res.data);
      }
    } catch (error) {
      toast.error("Failed to load ticket details");
      navigate("/warranty/tickets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleAction = async (
    action: "start" | "complete" | "return" | "cancel",
  ) => {
    if (!ticket) return;
    try {
      if (action === "start") await warrantyService.startRepair(ticket.id);
      if (action === "complete")
        await warrantyService.completeRepair(ticket.id);
      if (action === "return") await warrantyService.returnDevice(ticket.id);
      if (action === "cancel")
        await warrantyService.cancelTicket(ticket.id, "Cancelled by Admin");

      toast.success(`Ticket ${action}ed successfully`);
      fetchDetail();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  const handleRemoveService = async (serviceId: string) => {
    if (!ticket) return;
    if (!confirm("Remove this service?")) return;
    try {
      await warrantyService.removeService(ticket.id, serviceId);
      toast.success("Service removed");
      fetchDetail();
    } catch (e) {
      toast.error("Failed to remove service");
    }
  };

  const handleRemovePart = async (partId: string) => {
    if (!ticket) return;
    if (!confirm("Remove this part?")) return;
    try {
      await warrantyService.removePart(ticket.id, partId);
      toast.success("Part removed");
      fetchDetail();
    } catch (e) {
      toast.error("Failed to remove part");
    }
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
      </div>
    );
  if (!ticket) return null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Button
            className="cursor-pointer"
            variant="outline"
            size="icon"
            onClick={() => navigate("/warranty/tickets")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
              {ticket.ticketNumber}
              <Badge
                variant={
                  ticket.status === WarrantyStatus.COMPLETED
                    ? "default"
                    : ticket.status === WarrantyStatus.CANCELED
                      ? "destructive"
                      : "secondary"
                }
                className="text-sm font-medium"
              >
                {ticket.status.replace("_", " ")}
              </Badge>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Created on {format(new Date(ticket.createdAt), "PPP p")}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {ticket.status === WarrantyStatus.PENDING && (
            <Button
              className="bg-black hover:bg-gray-800 text-white shadow-sm"
              onClick={() => handleAction("start")}
            >
              <Play className="w-4 h-4 mr-2" /> Start Repair
            </Button>
          )}
          {ticket.status === WarrantyStatus.IN_PROGRESS && (
            <Button
              className="bg-black hover:bg-gray-800 text-white shadow-sm"
              onClick={() => handleAction("complete")}
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Complete Repair
            </Button>
          )}
          {ticket.status === WarrantyStatus.COMPLETED && (
            <Button
              className="bg-black hover:bg-gray-800 text-white shadow-sm"
              onClick={() => handleAction("return")}
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Return Device
            </Button>
          )}
          {ticket.status !== WarrantyStatus.RETURNED &&
            ticket.status !== WarrantyStatus.CANCELED && (
              <Button
                variant="destructive"
                onClick={() => handleAction("cancel")}
              >
                <XCircle className="w-4 h-4 mr-2" /> Cancel
              </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Customer & Product
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wide">
                  Customer
                </span>
                <p className="font-medium text-gray-900 mt-1">
                  {ticket.customer?.name}
                </p>
                <p className="text-sm text-gray-600">
                  {ticket.customer?.phone}
                </p>
                <p className="text-sm text-gray-600">
                  {ticket.customer?.email}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wide">
                  Product
                </span>
                <p className="font-medium text-sm line-clamp-2 mt-1 text-gray-900">
                  {ticket.product.productName}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-700 border border-gray-200">
                    SN: {ticket.serialNumber}
                  </span>
                  {ticket.isUnderWarranty ? (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200 bg-green-50"
                    >
                      Under Warranty
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-gray-600 border-gray-200 bg-gray-50"
                    >
                      Out of Warranty
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Technician
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {ticket.technician?.name || "Unassigned"}
                    </p>
                    <p className="text-xs text-gray-500">Responsible</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 cursor-pointer"
                >
                  Reassign
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4 bg-gray-100 p-1">
              <TabsTrigger className="cursor-pointer" value="overview">
                Overview
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="services">
                Services & Costs
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="parts">
                Parts
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="history">
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab ticket={ticket} />
            </TabsContent>

            <TabsContent value="services">
              <ServicesTab
                services={ticket.services}
                onAddClick={() => setIsAddServiceOpen(true)}
                onRemoveClick={handleRemoveService}
              />
            </TabsContent>

            <TabsContent value="parts">
              <PartsTab
                parts={ticket.parts}
                onAddClick={() => setIsAddPartOpen(true)}
                onRemoveClick={handleRemovePart}
              />
            </TabsContent>

            <TabsContent value="history">
              <HistoryTab history={ticket.history} />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Card className="w-full md:w-1/2 bg-white text-black shadow-lg border-gray-200">
              <CardContent className="p-6">
                <div className="flex justify-between mb-2 text-sm text-gray-400">
                  <span>Service Total</span>
                  <span>
                    {ticket.services
                      ?.reduce(
                        (acc: number, s: WarrantyServiceItem) =>
                          acc + s.totalCost,
                        0,
                      )
                      .toLocaleString()}
                    ₫
                  </span>
                </div>
                <div className="flex justify-between mb-4 text-sm text-gray-400">
                  <span>Parts Total</span>
                  <span>
                    {ticket.parts
                      ?.reduce(
                        (acc: number, p: WarrantyPartItem) =>
                          acc + p.totalCost * p.quantity,
                        0,
                      )
                      .toLocaleString()}
                    ₫
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-800 pt-4 text-xl font-bold">
                  <span>Grand Total</span>
                  <span>{ticket.totalCost.toLocaleString()}₫</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {ticket && (
        <>
          <AddServiceDialog
            open={isAddServiceOpen}
            onOpenChange={setIsAddServiceOpen}
            ticketId={ticket.id}
            onSuccess={fetchDetail}
          />
          <AddPartDialog
            open={isAddPartOpen}
            onOpenChange={setIsAddPartOpen}
            ticketId={ticket.id}
            onSuccess={fetchDetail}
          />
        </>
      )}
    </div>
  );
}
