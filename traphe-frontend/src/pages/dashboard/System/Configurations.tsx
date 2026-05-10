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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Edit, Trash2, Settings, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  systemConfigService,
  type SystemConfigResponse,
} from "@/services/system-config.service";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";
import { toast } from "sonner";

export default function ConfigurationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<{
    id: string;
    key: string;
  } | null>(null);
  const [configurations, setConfigurations] = useState<SystemConfigResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await systemConfigService.getAllConfigs();
      if (response.statusCode === 200) {
        setConfigurations(response.data);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMsg =
        error.response?.data?.message || "Failed to fetch configurations";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const filteredConfigurations = configurations.filter(
    (config) =>
      config.configKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.configValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (config.description &&
        config.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleDeleteClick = (config: { id: string; key: string }) => {
    setConfigToDelete(config);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (configToDelete) {
      try {
        await systemConfigService.deleteConfig(configToDelete.id);
        setConfigurations(
          configurations.filter((c) => c.id !== configToDelete.id),
        );
        toast.success("Configuration deleted successfully");
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(
          error.response?.data?.message || "Failed to delete configuration",
        );
      } finally {
        setIsDeleteDialogOpen(false);
        setConfigToDelete(null);
      }
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Configurations"
        subtitle="Manage system configuration settings"
      />

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg">
          <Plus className="mr-2 w-4 h-4" />
          New Key
        </Button>
        <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg">
          <Plus className="mr-2 w-4 h-4" />
          Import CSV
        </Button>
      </div>

      {/* Main Card */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by Key"
                className="pl-10 bg-white border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="ml-3 text-slate-600">
                Loading configurations...
              </span>
            </div>
          ) : error ? (
            <EmptyState
              icon={<Settings className="w-8 h-8 text-red-400" />}
              title="Error loading configurations"
              description={error}
            />
          ) : filteredConfigurations.length === 0 ? (
            <EmptyState
              icon={<Settings className="w-8 h-8 text-slate-400" />}
              title="No configurations found"
              description="Add a new configuration key to get started"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                  <TableHead className="font-semibold text-slate-600">
                    Key
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Value
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Data Type
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Description
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Is Encrypted
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Created By
                  </TableHead>
                  <TableHead className="text-center font-semibold text-slate-600">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConfigurations.map((config) => (
                  <TableRow key={config.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-800">
                      {config.configKey}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {config.configValue}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {config.dataType}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {config.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={config.isEncrypted}
                        disabled
                        className="border-slate-300"
                      />
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {config.createdBy || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-slate-100"
                        >
                          <Edit className="w-4 h-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-50"
                          onClick={() =>
                            handleDeleteClick({
                              id: config.id,
                              key: config.configKey,
                            })
                          }
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

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
        itemName={configToDelete?.key || ""}
        onConfirm={handleDeleteConfirm}
        contextMessage="configuration"
      />
    </PageContainer>
  );
}
