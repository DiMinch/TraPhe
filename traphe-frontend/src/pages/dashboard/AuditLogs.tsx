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
import {
  Search,
  Filter,
  Calendar,
  RotateCw,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";
import {
  auditLogService,
  type AuditLogResponse,
  type AuditModule,
  type AuditAction,
} from "@/services/audit-log.service";
import { toast } from "sonner";

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("all-module");
  const [selectedAction, setSelectedAction] = useState<string>("all-action");
  const [selectedActor, setSelectedActor] = useState<string>("all-actor");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {};

      if (selectedModule !== "all-module") {
        filters.module = selectedModule.toUpperCase();
      }

      if (selectedAction !== "all-action") {
        filters.action = selectedAction.toUpperCase();
      }

      if (selectedActor !== "all-actor") {
        filters.actorId = selectedActor;
      }

      if (dateRange.from) {
        filters.startDate = dateRange.from;
      }

      if (dateRange.to) {
        filters.endDate = dateRange.to;
      }

      const response = await auditLogService.getAllAuditLogs(filters);

      if (response.data) {
        setAuditLogs(response.data);
      }

      // Show error message only if there's a meaningful error
      if (
        response.statusCode >= 400 &&
        response.message &&
        !response.message.includes("not yet available")
      ) {
        const errorMsg = response.message;
        setError(errorMsg);
        toast.error(errorMsg);
      } else if (
        response.message &&
        response.message.includes("not yet available")
      ) {
        // Silently set error message without toast for "not available" case
        setError(response.message);
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Failed to fetch audit logs";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [selectedModule, selectedAction, selectedActor, dateRange]);

  const handleRefresh = () => {
    fetchAuditLogs();
  };

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.resourceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    <PageContainer>
      <PageHeader
        title="Audit Logs"
        subtitle="Track all system activities and changes"
        onRefresh={handleRefresh}
      />

      {/* Main Card */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by Resource ID, Actor or Module"
                className="pl-10 bg-white border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              className="shrink-0 border-slate-200 hover:bg-slate-50"
            >
              <Filter className="w-4 h-4" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="shrink-0 h-9 border-slate-200 hover:bg-slate-50"
                >
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

            <Select value={selectedActor} onValueChange={setSelectedActor}>
              <SelectTrigger className="w-36 border-slate-200">
                <SelectValue placeholder="All actor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-actor">All actor</SelectItem>
                {/* TODO: Populate from actual user list */}
              </SelectContent>
            </Select>

            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-36 border-slate-200">
                <SelectValue placeholder="All action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-action">All action</SelectItem>
                <SelectItem value="create">CREATE</SelectItem>
                <SelectItem value="update">UPDATE</SelectItem>
                <SelectItem value="delete">DELETE</SelectItem>
                <SelectItem value="view">VIEW</SelectItem>
                <SelectItem value="export">EXPORT</SelectItem>
                <SelectItem value="import">IMPORT</SelectItem>
                <SelectItem value="login">LOGIN</SelectItem>
                <SelectItem value="logout">LOGOUT</SelectItem>
                <SelectItem value="approve">APPROVE</SelectItem>
                <SelectItem value="reject">REJECT</SelectItem>
                <SelectItem value="cancel">CANCEL</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger className="w-36 border-slate-200">
                <SelectValue placeholder="All module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-module">All module</SelectItem>
                <SelectItem value="invoice">INVOICE</SelectItem>
                <SelectItem value="product">PRODUCT</SelectItem>
                <SelectItem value="inventory">INVENTORY</SelectItem>
                <SelectItem value="order">ORDER</SelectItem>
                <SelectItem value="customer">CUSTOMER</SelectItem>
                <SelectItem value="supplier">SUPPLIER</SelectItem>
                <SelectItem value="warranty">WARRANTY</SelectItem>
                <SelectItem value="user">USER</SelectItem>
                <SelectItem value="report">REPORT</SelectItem>
                <SelectItem value="system">SYSTEM</SelectItem>
                <SelectItem value="notification">NOTIFICATION</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="ml-3 text-slate-600">Loading audit logs...</span>
            </div>
          ) : error ? (
            <EmptyState
              icon={<ClipboardList className="w-8 h-8 text-red-400" />}
              title="Error loading audit logs"
              description={error}
            />
          ) : filteredLogs.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="w-8 h-8 text-slate-400" />}
              title="No audit logs found"
              description="Activity logs will appear here as actions are performed"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                  <TableHead className="font-semibold text-slate-600">
                    Timestamp
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Actor
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Action
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Module
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Resource ID
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Details
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-slate-600">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-slate-800">
                      {log.actorName || `User ${log.actorId}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-800">
                        {log.module}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-indigo-600">
                        {log.resourceId || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-500">
                        {log.oldValue && log.newValue ? (
                          <div className="space-y-1">
                            <div className="text-red-600">
                              Old: {log.oldValue}
                            </div>
                            <div className="text-green-600">
                              New: {log.newValue}
                            </div>
                          </div>
                        ) : log.newValue ? (
                          <div className="text-green-600">{log.newValue}</div>
                        ) : (
                          "-"
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {!loading && !error && filteredLogs.length > 0 && (
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
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
