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
  Plus,
  Upload,
  Edit,
  Trash2,
  Package,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import NewProductDialog from "./NewProduct";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product.types";
import { toast } from "sonner";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";

export default function ProductListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts();
      if (response.data) {
        setAllProducts(response.data);

        // Filter products by category if category filter is provided
        if (categoryFilter) {
          const filtered = response.data.filter((product) => {
            // Match products where category name or parent category name matches
            return (
              product.categoryName === categoryFilter ||
              product.parentCategoryName === categoryFilter
            );
          });
          setProducts(filtered);
        } else {
          setProducts(response.data);
        }
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
    <PageContainer>
      <PageHeader
        title="Product List"
        subtitle={
          categoryFilter
            ? `Filtered by: ${categoryFilter}`
            : "Manage your products"
        }
        onRefresh={fetchProducts}
      />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6 justify-end">
        <Button
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md"
          onClick={() => setIsNewProductOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Product
        </Button>
        <Button
          variant="outline"
          className="border-slate-200 hover:bg-slate-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Import CSV
        </Button>
        <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md">
          <Upload className="w-4 h-4 mr-2" />
          Bulk Update
        </Button>
      </div>

      {/* Product List Card */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <span className="mt-3 text-slate-500 font-medium">
                Loading products...
              </span>
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<Package className="w-8 h-8 text-slate-400" />}
              title="No products found"
              description={
                categoryFilter
                  ? "Try clearing the category filter"
                  : "Start by adding your first product"
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
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
                        Supplier
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600">
                        Variants
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
                    {currentProducts.map((product) => (
                      <TableRow
                        key={product.id}
                        className="cursor-pointer border-slate-50 hover:bg-slate-50/50 transition-colors"
                        onClick={() =>
                          navigate(`/product/detail/${product.id}`)
                        }
                      >
                        <TableCell>
                          <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-800">
                              {product.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {product.warrantyPeriod
                                ? `${product.warrantyPeriod} months warranty`
                                : "No warranty"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">
                            {product.categoryName || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0">
                            {product.supplierName || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-600">
                            {product.variants?.length || 0} variant(s)
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              product.status === "ACTIVE"
                                ? "bg-green-100 text-green-700 hover:bg-green-100 border-0"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-100 border-0"
                            }
                          >
                            {product.status || "ACTIVE"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-amber-50 text-slate-600 hover:text-amber-600"
                              onClick={() =>
                                navigate(`/product/edit/${product.id}`)
                              }
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-50 text-slate-600 hover:text-red-600"
                              onClick={() =>
                                handleDeleteClick({
                                  id: product.id,
                                  name: product.name,
                                })
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-medium">
                    {startIndex + 1}-{Math.min(endIndex, products.length)}
                  </span>{" "}
                  of <span className="font-medium">{products.length}</span>{" "}
                  products
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        className={`hover:bg-slate-100 ${
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }`}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className={`cursor-pointer ${currentPage === page ? "bg-primary text-white hover:bg-primary/90" : ""}`}
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
                        className={`hover:bg-slate-100 ${
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }`}
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
    </PageContainer>
  );
}
