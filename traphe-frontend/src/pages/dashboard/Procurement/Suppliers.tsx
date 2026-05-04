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
import { Input } from "@/components/ui/input";
import {
  Plus,
  Upload,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  BellIcon,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

interface Supplier {
  id: number;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  totalPOs: number;
  status: "Active" | "Inactive";
}

export default function SuppliersPage() {
  const navigate = useNavigate();
  const [suppliers] = useState<Supplier[]>([
    {
      id: 1,
      name: "ABC",
      contactName: "Nguyen Van A",
      phone: "+84 972 188 755",
      email: "nguyenvana@abc.gmai",
      totalPOs: 1,
      status: "Active",
    },
  ]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Suppliers</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome Admin Nguyen Van A
          </span>
          <Button variant="outline" size="icon">
            <BellIcon className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            CN
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <Button className="bg-indigo-900 hover:bg-indigo-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Supplier
        </Button>
        <Button className="bg-indigo-900 hover:bg-indigo-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Import CSV
        </Button>
        <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
          <Upload className="w-4 h-4 mr-2" />
          Bulk Update
        </Button>
      </div>

      {/* Main Card */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search" className="pl-10 bg-white" />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="w-[200px]">Contact Name</TableHead>
                  <TableHead className="w-[150px]">Phone</TableHead>
                  <TableHead className="w-[200px]">Email</TableHead>
                  <TableHead className="w-[120px]">Total POs</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[120px] text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <button
                        onClick={() =>
                          navigate(`/procurement/suppliers/${supplier.name}`)
                        }
                        className="font-medium text-indigo-900 hover:underline cursor-pointer"
                      >
                        {supplier.name}
                      </button>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {supplier.contactName}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {supplier.phone}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {supplier.email}
                    </TableCell>
                    <TableCell className="text-center text-gray-700">
                      {supplier.totalPOs}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          supplier.status === "Active"
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                        }
                      >
                        {supplier.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
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
