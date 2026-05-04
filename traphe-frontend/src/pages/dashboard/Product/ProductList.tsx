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
import {
  Plus,
  Upload,
  Edit,
  Trash2,
  MoreHorizontal,
  BellIcon,
} from "lucide-react";
import { useNavigate } from "react-router";
import { CURRENT_USER } from "@/constants/user";
import { useState, useEffect } from "react";
import NewProductDialog from "./NewProduct";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product";
import { toast } from "sonner";

export default function ProductListPage() {
  const navigate = useNavigate();
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts();
      if (response.data) {
        setProducts(response.data);
      }
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to load products";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const handleDeleteClick = (product: { id: string; name: string }) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      try {
        await productService.deleteProduct(productToDelete.id);
        setProducts(products.filter((p) => p.id !== productToDelete.id));
        toast.success("Product deleted successfully");
      } catch (error: unknown) {
        const errorMsg =
          error instanceof Error ? error.message : "Failed to delete product";
        toast.error(errorMsg);
      } finally {
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
      }
    }
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts([...products, newProduct]);
    fetchProducts(); // Refresh list
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Product List</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome {CURRENT_USER.role}: {CURRENT_USER.name}
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
      <div className="flex gap-3 mb-6 justify-end">
        <Button
          className="bg-indigo-900 hover:bg-indigo-800 text-white"
          onClick={() => setIsNewProductOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Product
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

      {/* Product List Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No products found
            </div>
          ) : (
            <>
              <Table className="">
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Variants</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProducts.map((product) => (
                    <TableRow
                      key={product.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/product/detail/${product.id}`)}
                    >
                      <TableCell>
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xl">📦</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            {product.warrantyPeriod
                              ? `${product.warrantyPeriod} months warranty`
                              : "No warranty"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-700 hover:bg-blue-100"
                        >
                          {product.categoryName || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-purple-100 text-purple-700 hover:bg-purple-100"
                        >
                          {product.supplierName || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.variants?.length || 0} variant(s)
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            product.status === "ACTIVE"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                          }
                        >
                          {product.status || "ACTIVE"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-amber-50 hover:border"
                            onClick={() =>
                              navigate(`/product/edit/${product.id}`)
                            }
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-red-50 hover:border"
                            onClick={() =>
                              handleDeleteClick({
                                id: product.id,
                                name: product.name,
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-gray-100 hover:border"
                          >
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
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1),
                          )
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* New Product Dialog */}
      <NewProductDialog
        open={isNewProductOpen}
        onOpenChange={setIsNewProductOpen}
        onAdd={handleAddProduct}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={productToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
        contextMessage="from the product list"
      />
    </div>
  );
}
