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
import { Search, Plus, Edit, Trash2, Settings } from "lucide-react";
import { useState } from "react";
import { configurations as initialConfigs } from "@/data/mockData";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";

interface Configuration {
  id: number;
  key: string;
  value: string;
  dataType: string;
  description: string;
  isEncrypted: boolean;
  createdBy: string;
}

export default function ConfigurationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<{
    id: number;
    key: string;
  } | null>(null);
  const [configurations, setConfigurations] =
    useState<Configuration[]>(initialConfigs);

  const filteredConfigurations = configurations.filter(
    (config) =>
      config.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDeleteClick = (config: { id: number; key: string }) => {
    setConfigToDelete(config);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (configToDelete) {
      setConfigurations(
        configurations.filter((c) => c.id !== configToDelete.id),
      );
      setIsDeleteDialogOpen(false);
      setConfigToDelete(null);
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
          {filteredConfigurations.length === 0 ? (
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
                      {config.key}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {config.value}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {config.dataType}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {config.description}
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={config.isEncrypted}
                        disabled
                        className="border-slate-300"
                      />
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {config.createdBy}
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
                              key: config.key,
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
