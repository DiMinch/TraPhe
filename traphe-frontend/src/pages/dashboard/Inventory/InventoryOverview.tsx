import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { BellIcon, Package } from "lucide-react";

export default function InventoryOverviewPage() {
  const lowStockProducts = [
    {
      id: 1,
      variant: "MacBook Pro M1 2020 MB-M1-GR-256",
      supplier: "ABC",
      inventory: 5,
      threshold: 15,
    },
    {
      id: 2,
      variant: "ZADEZ Mouse Gaming... ZM-M1-GR-25",
      supplier: "LeM",
      inventory: 10,
      threshold: 20,
    },
  ];

  const lowStockComponents = [
    {
      id: 1,
      component: "2GB Register",
      supplier: "ABC",
      inventory: 5,
      threshold: 15,
    },
    {
      id: 2,
      component: "HDD Storage",
      supplier: "LeM",
      inventory: 10,
      threshold: 20,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Overview</h1>
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

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Stock Value</p>
                <p className="text-2xl font-semibold">$ 5,200</p>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Low Stock Product</p>
                <p className="text-2xl font-semibold">2</p>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Low Stock Component
                </p>
                <p className="text-2xl font-semibold">2</p>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Stock Value Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Stock Value
              </CardTitle>
              <Select defaultValue="month">
                <SelectTrigger className="w-[140px] h-8 text-sm">
                  <SelectValue placeholder="By Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">By Month</SelectItem>
                  <SelectItem value="week">By Week</SelectItem>
                  <SelectItem value="year">By Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center border rounded-md bg-gray-50">
              <p className="text-sm text-gray-500">
                Chart placeholder - Stock Value
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm text-gray-600">Laptop</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                <span className="text-sm text-gray-600">Screen</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-gray-600">Mouse</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* On-hand Quantity Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                On-hand Quantity
              </CardTitle>
              <Select defaultValue="month">
                <SelectTrigger className="w-[140px] h-8 text-sm">
                  <SelectValue placeholder="By Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">By Month</SelectItem>
                  <SelectItem value="week">By Week</SelectItem>
                  <SelectItem value="year">By Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center border rounded-md bg-gray-50">
              <p className="text-sm text-gray-500">
                Chart placeholder - On-hand Quantity
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm text-gray-600">Laptop</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                <span className="text-sm text-gray-600">Screen</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-gray-600">Mouse</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Low Stock Product Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Low Stock Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Product Variant</TableHead>
                    <TableHead>Suppliers</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Min Stock Threshold</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium text-sm">
                        {product.variant}
                      </TableCell>
                      <TableCell>{product.supplier}</TableCell>
                      <TableCell>{product.inventory}</TableCell>
                      <TableCell>{product.threshold}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4">
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

        {/* Low Stock Component Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Low Stock Component
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Component</TableHead>
                    <TableHead>Suppliers</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Min Stock Threshold</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockComponents.map((component) => (
                    <TableRow key={component.id}>
                      <TableCell className="font-medium">
                        {component.component}
                      </TableCell>
                      <TableCell>{component.supplier}</TableCell>
                      <TableCell>{component.inventory}</TableCell>
                      <TableCell>{component.threshold}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4">
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
    </div>
  );
}
