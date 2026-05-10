import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Upload, Edit, Trash2, Package } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";

export default function ProductPage() {
  const products = [
    {
      id: 1,
      image: "¥",
      name: "MacBook Pro M1 2020",
      variants: "3 variants",
      category: "Laptop",
      suppliers: "ABC",
      inventory: 5,
      status: "Active",
    },
    {
      id: 2,
      image: "¥",
      name: "ZADEZ Mouse Gaming 2025",
      variants: "2 variants",
      category: "Mouse",
      suppliers: "LeM",
      inventory: 10,
      status: "Active",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Product List"
        subtitle="Manage your products and inventory"
      />

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          New Product
        </Button>
        <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Import CSV
        </Button>
        <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg">
          <Upload className="w-4 h-4 mr-2" />
          Bulk Update
        </Button>
      </div>

      {/* Product List Card */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-semibold text-slate-800">
            Products
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {products.length === 0 ? (
            <EmptyState
              icon={<Package className="w-8 h-8 text-slate-400" />}
              title="No products found"
              description="Add your first product to get started"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                  <TableHead className="font-semibold text-slate-600">
                    Image
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Category
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Suppliers
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Inventory
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl">
                        {product.image}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-800">
                          {product.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {product.variants}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700 hover:bg-blue-100"
                      >
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-700 hover:bg-purple-100"
                      >
                        {product.suppliers}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {product.inventory}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
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
    </PageContainer>
  );
}
