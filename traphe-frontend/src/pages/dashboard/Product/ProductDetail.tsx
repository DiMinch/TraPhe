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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Edit, Trash2, MoreHorizontal, Bell } from "lucide-react";
import { useParams } from "react-router";
import productsData from "@/data/products.json";
import { useState } from "react";
import { CURRENT_USER } from "@/constants/user";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);

  const product = productsData.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Product not found</h1>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Product Detail</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/product/productlist">
                  Product List
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome {CURRENT_USER.role}: {CURRENT_USER.name}
          </span>
          <Button variant="outline" size="icon">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            CN
          </Button>
          <Avatar>
            <AvatarFallback className="bg-green-600 text-white">
              M
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6 justify-end">
        <Button
          className="bg-indigo-900 hover:bg-indigo-800 text-white w-25"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit className="w-4 h-4 mr-2" />
          {isEditing ? "Save" : "Edit"}
        </Button>
        {!isEditing && (
          <Button className="bg-red-600 hover:bg-red-700 text-white w-25">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        )}
      </div>

      {/* Product Information Form */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                defaultValue={product.name}
                className="bg-white"
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                defaultValue={product.category.toLowerCase()}
                disabled={!isEditing}
              >
                <SelectTrigger className="bg-white w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="laptop">Laptop</SelectItem>
                  <SelectItem value="mouse">Mouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                defaultValue={product.status.toLowerCase()}
                disabled={!isEditing}
              >
                <SelectTrigger className="bg-white w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select
                defaultValue={product.suppliers.toLowerCase()}
                disabled={!isEditing}
              >
                <SelectTrigger className="bg-white w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="abc">ABC</SelectItem>
                  <SelectItem value="lem">LeM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inventory">Inventory</Label>
              <Input
                id="inventory"
                defaultValue={product.inventory}
                className="bg-white"
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Min Stock Threshold</Label>
              <Input
                id="threshold"
                defaultValue={product.minStockThreshold}
                className="bg-white"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center bg-white">
                <Button variant="outline" size="sm" disabled={!isEditing}>
                  Choose File
                </Button>
                <span className="text-sm text-gray-500 ml-2">
                  No file chosen
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="spec">General Spec</Label>
              <Textarea
                id="spec"
                className="min-h-[100px] bg-white font-mono text-sm"
                defaultValue={JSON.stringify(product.generalSpec, null, 2)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variant List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Variant List</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Display Order</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Spec</TableHead>
                <TableHead>Purchase Price</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.variantList.map((variant) => (
                <TableRow key={variant.displayOrder}>
                  <TableCell>{variant.displayOrder}</TableCell>
                  <TableCell>
                    <div className="font-medium whitespace-pre-line">
                      {variant.sku.replace(/-/g, "-\n")}
                    </div>
                  </TableCell>
                  <TableCell>{variant.barcode}</TableCell>
                  <TableCell>
                    <div className="font-mono text-xs whitespace-pre-line">
                      {JSON.stringify(variant.spec)}
                    </div>
                  </TableCell>
                  <TableCell>{variant.purchasePrice}</TableCell>
                  <TableCell>{variant.sellingPrice}</TableCell>
                  <TableCell>{variant.inventory}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 hover:bg-green-100"
                    >
                      {variant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="w-50">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
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
