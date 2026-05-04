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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Search, Filter, Calendar, BellIcon, RotateCw } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { CURRENT_USER } from "@/constants/user";

interface AuditLog {
  id: number;
  timestamp: string;
  actor: string;
  action: string;
  module: string;
  moduleId: string;
  oldValue: {
    label: string;
    value: string;
  };
  newValue: {
    label: string;
    value: string;
  };
  status: "SUCCESS" | "FAILED" | "PENDING";
}

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const [auditLogs] = useState<AuditLog[]>([
    {
      id: 1,
      timestamp: "5:30PM\n27/11/2026",
      actor: "Phan Duy M",
      action: "CREATE",
      module: "INVOICE",
      moduleId: "#ORD-001",
      oldValue: {
        label: "Status",
        value: "Pending",
      },
      newValue: {
        label: "Status",
        value: "Completed",
      },
      status: "SUCCESS",
    },
  ]);

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.moduleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "FAILED":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Audit Logs</h1>
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

      {/* Main Card */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by Order ID, SKU or ID Module"
                className="pl-10 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="w-4 h-4" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="shrink-0 h-9">
                  <Calendar className="w-4 h-4 mr-2" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                        {format(dateRange.to, "MMM dd, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM dd, yyyy")
                    )
                  ) : (
                    "All time range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    setDateRange({
                      from: range?.from,
                      to: range?.to,
                    });
                  }}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select defaultValue="all-actor">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All actor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-actor">All actor</SelectItem>
                <SelectItem value="phan-duy">Phan Duy M</SelectItem>
                <SelectItem value="nguyen-van">Nguyen Van A</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-action">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-action">All action</SelectItem>
                <SelectItem value="create">CREATE</SelectItem>
                <SelectItem value="update">UPDATE</SelectItem>
                <SelectItem value="delete">DELETE</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-module">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-module">All module</SelectItem>
                <SelectItem value="invoice">INVOICE</SelectItem>
                <SelectItem value="order">ORDER</SelectItem>
                <SelectItem value="product">PRODUCT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Old Value</TableHead>
                <TableHead>New Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-pre-line">
                    {log.timestamp}
                  </TableCell>
                  <TableCell>{log.actor}</TableCell>
                  <TableCell>
                    <span className="font-medium">{log.action}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.module}</div>
                      <div className="text-sm text-indigo-900">
                        {log.moduleId}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">
                        {log.oldValue.label}
                      </div>
                      <div className="text-sm text-gray-600">
                        {log.oldValue.value}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">
                        {log.newValue.label}
                      </div>
                      <div className="text-sm text-gray-600">
                        {log.newValue.value}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getStatusColor(log.status)}
                      variant="secondary"
                    >
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <RotateCw className="w-4 h-4" />
                    </Button>
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
    </div>
  );
}
