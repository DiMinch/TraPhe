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
  ClipboardList,
  Loader2,
  ShieldAlert,
  ServerCrash,
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
  const [actors, setActors] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {};

      if (selectedModule !== "all-module") {
        filters.module = selectedModule;
      }

      if (selectedAction !== "all-action") {
        filters.action = selectedAction;
      }

      if (selectedActor !== "all-actor") {
        filters.actorId = selectedActor;
      }

      if (dateRange.from) {
        filters.startDate = dateRange.from.toISOString();
      }

      if (dateRange.to) {
        filters.endDate = dateRange.to.toISOString();
      }

      const response = await auditLogService.getAllAuditLogs(filters);

      if (response.data) {
        // Handle both direct array and paginated response
        const logsData = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.content || [];

        // Sort by createdAt descending (newest first)
        logsData.sort((a: AuditLogResponse, b: AuditLogResponse) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

        setAuditLogs(logsData);

        // Extract unique actors for the filter dropdown
        const actorMap = new Map<string, string>();
        logsData.forEach((log: AuditLogResponse) => {
          if (log.actorId && !actorMap.has(log.actorId)) {
            actorMap.set(log.actorId, log.actorName || log.actorId);
          }
        });
        setActors(Array.from(actorMap, ([id, name]) => ({ id, name })));
      }

      // Show error message only if there's a meaningful error
      if (response.statusCode >= 400 && response.message) {
        setError(response.message);
        // Don't show toast for 403/500 - just display inline error
        if (response.statusCode !== 403 && response.statusCode !== 500) {
          toast.error(response.message);
        }
      }
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      const status = axiosErr.response?.status;
      const errorMsg =
        status === 500
          ? "Server error. Please try again later or contact support."
          : axiosErr.response?.data?.message || "Failed to fetch audit logs";
      setError(errorMsg);
      // Don't show toast for 403 or 500
      if (status !== 403 && status !== 500) {
        toast.error(errorMsg);
      }
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

  return (
    <PageContainer>
      <PageHeader
        title="Audit Logs"
        subtitle="Track all system activities and changes"
        onRefresh={handleRefresh}
      />

      {/* Main Card */}
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 p-6 bg-gradient-to-r from-slate-50/80 to-foam/50 border-b border-slate-200/60">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by Resource ID, Actor or Module"
                className="pl-10 bg-white border-slate-200 focus:border-roast focus:ring-2 focus:ring-roast/20 rounded-lg h-10 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              className="shrink-0 border-slate-200 hover:bg-white hover:border-roast rounded-lg h-10 w-10 shadow-sm transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="shrink-0 h-10 border-slate-200 hover:bg-white hover:border-roast rounded-lg shadow-sm transition-all duration-200"
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
                  onSelect={(range: { from?: Date; to?: Date } | undefined) => {
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
              <SelectTrigger className="w-36 border-slate-200 bg-white rounded-lg h-10 shadow-sm focus:border-roast focus:ring-2 focus:ring-roast/20">
                <SelectValue placeholder="All actor" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                <SelectItem value="all-actor">All actor</SelectItem>
                {actors.map((actor) => (
                  <SelectItem key={actor.id} value={actor.id}>
                    {actor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-36 border-slate-200 bg-white rounded-lg h-10 shadow-sm focus:border-roast focus:ring-2 focus:ring-roast/20">
                <SelectValue placeholder="All action" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                <SelectItem value="all-action">All action</SelectItem>
                <SelectItem value="CREATE">CREATE</SelectItem>
                <SelectItem value="UPDATE">UPDATE</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="LOCK">LOCK</SelectItem>
                <SelectItem value="UNLOCK">UNLOCK</SelectItem>
                <SelectItem value="EARN_POINTS">EARN_POINTS</SelectItem>
                <SelectItem value="REDEEM_POINTS">REDEEM_POINTS</SelectItem>
                <SelectItem value="ADJUST_POINTS">ADJUST_POINTS</SelectItem>
                <SelectItem value="RESET_POINTS">RESET_POINTS</SelectItem>
                <SelectItem value="RECEIVE_GOODS">RECEIVE_GOODS</SelectItem>
                <SelectItem value="CLOSE_PO">CLOSE_PO</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger className="w-36 border-slate-200 bg-white rounded-lg h-10 shadow-sm focus:border-roast focus:ring-2 focus:ring-roast/20">
                <SelectValue placeholder="All module" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                <SelectItem value="all-module">All module</SelectItem>
                <SelectItem value="INVOICE">INVOICE</SelectItem>
                <SelectItem value="PRODUCT">PRODUCT</SelectItem>
                <SelectItem value="INVENTORY">INVENTORY</SelectItem>
                <SelectItem value="SUPPLIER">SUPPLIER</SelectItem>
                <SelectItem value="STAFF">STAFF</SelectItem>
                <SelectItem value="PROMOTION">PROMOTION</SelectItem>
                <SelectItem value="CONFIG">CONFIG</SelectItem>
                <SelectItem value="WARRANTY">WARRANTY</SelectItem>
                <SelectItem value="LOYALTY_POINTS">LOYALTY_POINTS</SelectItem>
                <SelectItem value="PURCHASE_ORDER">PURCHASE_ORDER</SelectItem>
                <SelectItem value="ORDER">ORDER</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-6">
            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-foam to-purple-100 flex items-center justify-center animate-pulse">
                  <Loader2 className="w-8 h-8 animate-spin text-roast" />
                </div>
                <span className="ml-3 text-slate-600 mt-4">
                  Loading audit logs...
                </span>
              </div>
            ) : error?.includes("permission") ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <ShieldAlert className="w-12 h-12 text-amber-500" />
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Access Restricted
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md">
                    You don't have permission to view audit logs. This feature
                    is available for administrators only.
                  </p>
                  <div className="text-xs text-slate-500 mt-4">
                    Contact your system administrator if you believe you should
                    have access.
                  </div>
                </div>
              </div>
            ) : error?.includes("Server error") ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <ServerCrash className="w-12 h-12 text-red-500" />
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Server Error
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md">
                    Unable to connect to the audit logs service. The backend
                    server may be experiencing issues.
                  </p>
                  <div className="text-xs text-slate-500 mt-4">
                    <p>Possible causes:</p>
                    <ul className="list-disc list-inside text-left mx-auto max-w-xs mt-2">
                      <li>Backend server is not running</li>
                      <li>Database connection error</li>
                      <li>API endpoint misconfiguration</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    className="border-slate-300"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      window.open(
                        "http://localhost:8080/swagger-ui/index.html",
                        "_blank",
                      )
                    }
                  >
                    Check Backend Status
                  </Button>
                </div>
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
              <div className="rounded-xl border border-slate-200/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/50">
                      <TableHead className="font-semibold text-slate-700">
                        Timestamp
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Actor
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Action
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Module
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Resource ID
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Details
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="border-slate-100 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-foam/30 transition-all duration-200"
                      >
                        <TableCell className="text-slate-600">
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-slate-800 font-medium">
                          {log.actorName || `User ${log.actorId}`}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="font-medium rounded-full px-3"
                          >
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 rounded-full px-3">
                            {log.module}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-roast font-mono">
                            {log.resourceId || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-500">
                            {log.oldValue && log.newValue ? (
                              <div className="space-y-1">
                                <div className="text-red-600 text-xs bg-red-50 rounded px-2 py-0.5 inline-block">
                                  Old: {log.oldValue}
                                </div>
                                <div className="text-green-600 text-xs bg-green-50 rounded px-2 py-0.5 inline-block">
                                  New: {log.newValue}
                                </div>
                              </div>
                            ) : log.newValue ? (
                              <div className="text-green-600 text-xs bg-green-50 rounded px-2 py-0.5 inline-block">
                                {log.newValue}
                              </div>
                            ) : (
                              "-"
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && filteredLogs.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200/60">
                <Pagination>
                  <PaginationContent className="gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        className="rounded-lg hover:bg-slate-100 transition-colors"
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        isActive
                        className="rounded-lg bg-roast text-white hover:bg-roast/90"
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        className="rounded-lg hover:bg-slate-100 transition-colors"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
