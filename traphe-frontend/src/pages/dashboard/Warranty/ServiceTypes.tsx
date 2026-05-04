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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, MoreVertical } from "lucide-react";
import { useState } from "react";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { serviceTypes as initialServiceTypes } from "@/data/mockData";

interface ServiceType {
  id: number;
  name: string;
  description: string;
  standardPrice: string;
  estimatedDuration: string;
}

export default function ServiceTypesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewServiceOpen, setIsNewServiceOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [serviceTypes, setServiceTypes] =
    useState<ServiceType[]>(initialServiceTypes);

  const [newService, setNewService] = useState({
    name: "",
    description: "",
    standardPrice: "",
    estimatedDuration: "",
  });

  const handleSaveService = () => {
    const service: ServiceType = {
      id: serviceTypes.length + 1,
      name: newService.name,
      description: newService.description,
      standardPrice: `$ ${newService.standardPrice}`,
      estimatedDuration: newService.estimatedDuration,
    };
    setServiceTypes([...serviceTypes, service]);
    setIsNewServiceOpen(false);
    setNewService({
      name: "",
      description: "",
      standardPrice: "",
      estimatedDuration: "",
    });
  };

  const handleDeleteClick = (service: { id: number; name: string }) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (serviceToDelete) {
      setServiceTypes(serviceTypes.filter((s) => s.id !== serviceToDelete.id));
    }
    setIsDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  const filteredServices = serviceTypes.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Service Types</h1>
          <div className="flex items-center gap-3">
            <Dialog open={isNewServiceOpen} onOpenChange={setIsNewServiceOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-900 hover:bg-indigo-800 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white">
                <DialogHeader>
                  <DialogTitle>Create New Service Type</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Service Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter service name"
                      value={newService.name}
                      onChange={(e) =>
                        setNewService({ ...newService, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter service description"
                      value={newService.description}
                      onChange={(e) =>
                        setNewService({
                          ...newService,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Standard Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="Enter price"
                        value={newService.standardPrice}
                        onChange={(e) =>
                          setNewService({
                            ...newService,
                            standardPrice: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Estimated Duration</Label>
                      <Select
                        value={newService.estimatedDuration}
                        onValueChange={(value) =>
                          setNewService({
                            ...newService,
                            estimatedDuration: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1 hour">1 hour</SelectItem>
                          <SelectItem value="2 hours">2 hours</SelectItem>
                          <SelectItem value="3 hours">3 hours</SelectItem>
                          <SelectItem value="1 day">1 day</SelectItem>
                          <SelectItem value="2 days">2 days</SelectItem>
                          <SelectItem value="1 week">1 week</SelectItem>
                          <SelectItem value="1 month">1 month</SelectItem>
                          <SelectItem value="1 year">1 year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsNewServiceOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-indigo-900 hover:bg-indigo-800 text-white"
                    onClick={handleSaveService}
                  >
                    Save Service
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button className="bg-[#F59E0B] hover:bg-[#D97706] text-white">
              Bulk Update
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-[#E5E5E5] m-6 mt-0">
        <CardContent className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Description
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Standard Price
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Estimated Duration
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      No services found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {service.name}
                      </TableCell>
                      <TableCell>{service.description}</TableCell>
                      <TableCell className="font-medium">
                        {service.standardPrice}
                      </TableCell>
                      <TableCell>{service.estimatedDuration}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              handleDeleteClick({
                                id: service.id,
                                name: service.name,
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button variant="ghost" size="sm">
              &lt; Previous
            </Button>
            <Button variant="outline" size="sm">
              1
            </Button>
            <Button variant="ghost" size="sm">
              Next &gt;
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={serviceToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
        contextMessage="from the service types list"
      />
    </>
  );
}
