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
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  BellIcon,
  ArrowUpDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";

interface Attribute {
  id: number;
  name: string;
  key: string;
  type: string;
  required: string;
  highlight: number;
  order: number;
}

export default function AttributesPage() {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [attributes] = useState<Attribute[]>([
    {
      id: 1,
      name: "RAM",
      key: "ram",
      type: "Number",
      required: "$ 3,000",
      highlight: 5,
      order: 1,
    },
  ]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Attributes</h1>
        </div>
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

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
        <button
          onClick={() => navigate("/product/categories")}
          className="hover:text-gray-900"
        >
          {categoryName || "Laptop Gaming"}
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Attributes</span>
      </div>

      {/* New Attribute Button */}
      <div className="flex justify-end mb-4">
        <Button className="bg-indigo-900 hover:bg-indigo-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Attribute
        </Button>
      </div>

      {/* Main Card */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          {/* List Title */}
          <h2 className="text-lg font-semibold mb-6">List</h2>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="w-[150px]">Key</TableHead>
                  <TableHead className="w-[150px]">
                    <div className="flex items-center gap-2">
                      Type
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[150px]">Required</TableHead>
                  <TableHead className="w-[120px]">Highlight</TableHead>
                  <TableHead className="w-[120px]">
                    <div className="flex items-center gap-2">
                      Order
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px] text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attributes.map((attribute) => (
                  <TableRow key={attribute.id}>
                    <TableCell className="font-medium text-indigo-900">
                      {attribute.name}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {attribute.key}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {attribute.type}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {attribute.required}
                    </TableCell>
                    <TableCell className="text-center">
                      {attribute.highlight}
                    </TableCell>
                    <TableCell className="text-center">
                      {attribute.order}
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
