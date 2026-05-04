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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Edit,
  Trash2,
  Bell,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { format } from "date-fns";
import { CURRENT_USER } from "@/constants/user";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";

interface Service {
  id: number;
  name: string;
  description: string;
  estimatedDuration: string;
  unitPrice: number;
  additionalCost: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

interface WarrantyTicketData {
  ticketNo: string;
  customer: string;
  product: string;
  serial: string;
  problemDescription: string;
  receivedDate: Date;
  expectedDate: Date;
  technician: string;
  status:
    | "RECEIVED"
    | "PROCESSING"
    | "WAITING_FOR_PARTS"
    | "COMPLETED"
    | "RETURNED";
  services: Service[];
}

export default function WarrantyTicketDetailPage() {
  const { ticketNo } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const decodedTicketNo = ticketNo ? decodeURIComponent(ticketNo) : "#WARR-001";

  const [ticketData, setTicketData] = useState<WarrantyTicketData>({
    ticketNo: decodedTicketNo,
    customer: "Phan Duy Minh",
    product: "MacBook Pro M1",
    serial: "SN12345678",
    problemDescription: "Notes",
    receivedDate: new Date("2024-11-23"),
    expectedDate: new Date("2024-12-23"),
    technician: "Phan Minh Duy",
    status: "PROCESSING",
    services: [
      {
        id: 1,
        name: "Cleaning",
        description: "Description...",
        estimatedDuration: "25 days",
        unitPrice: 19000,
        additionalCost: 1000,
        status: "PENDING",
      },
    ],
  });

  const statusSteps = [
    { key: "RECEIVED", label: "Received" },
    { key: "PROCESSING", label: "Processing" },
    { key: "WAITING_FOR_PARTS", label: "Waiting For Parts" },
    { key: "COMPLETED", label: "Completed" },
    { key: "RETURNED", label: "Returned" },
  ];

  const currentStatusIndex = statusSteps.findIndex(
    (s) => s.key === ticketData.status,
  );

  const totalCost = ticketData.services.reduce(
    (sum, service) => sum + service.unitPrice + service.additionalCost,
    0,
  );

  const handleDeleteTicket = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // Navigate back to list after deletion
    navigate("/warranty/tickets");
  };

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  const handleAddService = () => {
    const newService: Service = {
      id: ticketData.services.length + 1,
      name: "",
      description: "",
      estimatedDuration: "",
      unitPrice: 0,
      additionalCost: 0,
      status: "PENDING",
    };
    setTicketData({
      ...ticketData,
      services: [...ticketData.services, newService],
    });
  };

  const handleRemoveService = (serviceId: number) => {
    setTicketData({
      ...ticketData,
      services: ticketData.services.filter((s) => s.id !== serviceId),
    });
  };

  const handleServiceChange = (
    serviceId: number,
    field: keyof Service,
    value: any,
  ) => {
    setTicketData({
      ...ticketData,
      services: ticketData.services.map((s) =>
        s.id === serviceId ? { ...s, [field]: value } : s,
      ),
    });
  };

  return (
    <div className="p-6">
      {/* Header with Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Warranty Tickets</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/warranty/tickets"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Warranty Tickets
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-gray-900 font-medium">
                  {ticketData.ticketNo}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome {CURRENT_USER.role} {CURRENT_USER.name}
          </span>
          <Button variant="outline" size="icon">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            CN
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        <Button
          className="bg-indigo-900 hover:bg-indigo-800 text-white"
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={handleDeleteTicket}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>

      {/* Main Content */}
      <Card className="shadow-sm mb-6 bg-white">
        <CardContent className="pt-6">
          {/* General Section with Status Progress */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-base font-semibold text-gray-900">General</h2>
            </div>

            {/* Status Progress */}
            <div className="mb-10 px-4">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
                <div
                  className="absolute top-4 left-0 h-0.5 bg-indigo-900 -z-10 transition-all"
                  style={{
                    width: `${
                      (currentStatusIndex / (statusSteps.length - 1)) * 100
                    }%`,
                  }}
                />
                {statusSteps.map((step, index) => (
                  <div key={step.key} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                        index < currentStatusIndex
                          ? "bg-indigo-900"
                          : index === currentStatusIndex
                            ? "bg-indigo-900"
                            : "bg-gray-300"
                      }`}
                    >
                      {index < currentStatusIndex ? (
                        <Check className="w-4 h-4 text-white  stroke-white" />
                      ) : index === currentStatusIndex ? (
                        <div className="w-3 h-3 rounded-full bg-white" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                      )}
                    </div>
                    <span
                      className={`text-xs text-center max-w-20 ${
                        index <= currentStatusIndex
                          ? "text-gray-900 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket Details */}
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Customer
                </Label>
                <Input
                  value={ticketData.customer}
                  onChange={(e) =>
                    setTicketData({ ...ticketData, customer: e.target.value })
                  }
                  disabled={!isEditing}
                  className="border-gray-300"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Product
                </Label>
                <Input
                  value={ticketData.product}
                  onChange={(e) =>
                    setTicketData({ ...ticketData, product: e.target.value })
                  }
                  disabled={!isEditing}
                  className="border-gray-300"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Serial
                </Label>
                <Input
                  value={ticketData.serial}
                  onChange={(e) =>
                    setTicketData({ ...ticketData, serial: e.target.value })
                  }
                  disabled={!isEditing}
                  className="border-gray-300"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Problem Description
                </Label>
                <Input
                  value={ticketData.problemDescription}
                  onChange={(e) =>
                    setTicketData({
                      ...ticketData,
                      problemDescription: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  className="border-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Received Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-gray-300"
                      disabled={!isEditing}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">
                        {format(ticketData.receivedDate, "dd/MM/yyyy")}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={ticketData.receivedDate}
                      onSelect={(date) =>
                        date &&
                        setTicketData({ ...ticketData, receivedDate: date })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Expected Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-gray-300"
                      disabled={!isEditing}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">
                        {format(ticketData.expectedDate, "dd/MM/yyyy")}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={ticketData.expectedDate}
                      onSelect={(date) =>
                        date &&
                        setTicketData({ ...ticketData, expectedDate: date })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Technician
                </Label>
                <Select
                  value={ticketData.technician}
                  onValueChange={(value) =>
                    setTicketData({ ...ticketData, technician: value })
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Phan Minh Duy">Phan Minh Duy</SelectItem>
                    <SelectItem value="Nguyen Van A">Nguyen Van A</SelectItem>
                    <SelectItem value="Tran Van B">Tran Van B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services and Parts & Components Tabs */}
      <Card className="shadow-sm bg-white">
        <CardContent className="pt-6 text-gray-700">
          <Tabs defaultValue="services" className="w-full ">
            <TabsList className="bg-transparent border-b border-gray-200 rounded-none w-full justify-start p-0 h-auto">
              <TabsTrigger
                value="services"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3"
              >
                Services
              </TabsTrigger>
              <TabsTrigger
                value="parts"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3"
              >
                Parts & Components
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="mt-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-4 text-gray-900">
                  Service
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <Table className="table-fixed">
                    <colgroup>
                      <col className="w-[25%]" />
                      <col className="w-[15%]" />
                      <col className="w-[12%]" />
                      <col className="w-[13%]" />
                      <col className="w-[12%]" />
                      <col className="w-[10%]" />
                      <col className="w-[13%]" />
                    </colgroup>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-gray-200">
                        <TableHead className="font-semibold text-gray-700 text-xs">
                          Name
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">
                          Estimated Duration
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">
                          Unit Price
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">
                          Additional Cost
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">
                          Total Cost
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">
                          Status
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ticketData.services.map((service) => (
                        <TableRow
                          key={service.id}
                          className="border-b border-gray-200"
                        >
                          <TableCell className="align-top">
                            {isEditing ? (
                              <div className="space-y-2 w-full">
                                <Input
                                  value={service.name}
                                  onChange={(e) =>
                                    handleServiceChange(
                                      service.id,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  className="text-sm w-full"
                                />
                                <Input
                                  value={service.description}
                                  onChange={(e) =>
                                    handleServiceChange(
                                      service.id,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Description..."
                                  className="text-sm text-gray-500 w-full"
                                />
                              </div>
                            ) : (
                              <div>
                                <div className="font-medium text-sm text-gray-900">
                                  {service.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {service.description}
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-900 align-top">
                            {isEditing ? (
                              <Input
                                value={service.estimatedDuration}
                                onChange={(e) =>
                                  handleServiceChange(
                                    service.id,
                                    "estimatedDuration",
                                    e.target.value,
                                  )
                                }
                                className="text-sm w-full"
                              />
                            ) : (
                              service.estimatedDuration
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-900 align-top">
                            {isEditing ? (
                              <Input
                                type="number"
                                value={service.unitPrice}
                                onChange={(e) =>
                                  handleServiceChange(
                                    service.id,
                                    "unitPrice",
                                    Number(e.target.value),
                                  )
                                }
                                className="text-sm w-full"
                              />
                            ) : (
                              `$ ${service.unitPrice.toLocaleString()}`
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-900 align-top">
                            {isEditing ? (
                              <Input
                                type="number"
                                value={service.additionalCost}
                                onChange={(e) =>
                                  handleServiceChange(
                                    service.id,
                                    "additionalCost",
                                    Number(e.target.value),
                                  )
                                }
                                className="text-sm w-full"
                              />
                            ) : (
                              `$ ${service.additionalCost.toLocaleString()}`
                            )}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-gray-900 align-top">
                            ${" "}
                            {(
                              service.unitPrice + service.additionalCost
                            ).toLocaleString()}
                          </TableCell>
                          <TableCell className="align-top">
                            <Badge
                              variant="secondary"
                              className="bg-gray-100 text-gray-700 hover:bg-gray-100 text-xs uppercase font-medium"
                            >
                              {service.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-gray-100"
                              >
                                <Edit className="w-4 h-4 text-gray-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-gray-100"
                                onClick={() => handleRemoveService(service.id)}
                                disabled={!isEditing}
                              >
                                <Trash2 className="w-4 h-4 text-gray-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {isEditing && (
                  <button
                    onClick={handleAddService}
                    className="w-full py-3 text-center text-[#4F46E5] hover:bg-gray-50 border border-dashed border-gray-300 rounded-md mt-4 text-sm"
                  >
                    Click here to add more services +
                  </button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="parts" className="mt-6">
              <div className="text-center py-12 text-gray-400 text-sm">
                No parts & components added yet
              </div>
            </TabsContent>
          </Tabs>

          {/* Pagination and Total */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                disabled
                className="text-sm text-gray-400"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <div className="px-3 py-1 text-sm text-gray-900 font-medium">
                1
              </div>
              <Button
                variant="ghost"
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="text-base font-semibold text-gray-900">
              Total: $ {totalCost.toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={ticketData.ticketNo}
        onConfirm={handleDeleteConfirm}
        contextMessage="warranty ticket"
      />
    </div>
  );
}
