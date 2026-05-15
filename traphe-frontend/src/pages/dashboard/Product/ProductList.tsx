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
  Edit,
  Trash2,
  Package,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import NewProductDialog from "./NewProduct";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import type { Product } from "@/types/product.types";
import type { Category } from "@/types/category.types";
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

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = allProducts;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.categoryName?.toLowerCase().includes(query) ||
          product.supplierName?.toLowerCase().includes(query),
      );
    }

    // Apply category filter
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.categoryName === selectedCategory,
      );
    }

    setProducts(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchQuery, selectedCategory, allProducts]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts();
      // response.data is ProductPageResponse, extract content array
      const productList = response.data?.content || [];

      setAllProducts(productList);

      // Filter products by category if category filter is provided
      if (categoryFilter) {
        const filtered = productList.filter((product) => {
          // Match products where category name matches
          return product.categoryName === categoryFilter;
        });
        setProducts(filtered);
      } else {
        setProducts(productList);
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

      {/* Search, Filter & Actions */}
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden mb-6">
        <CardContent className="p-0">
          <div className="p-4 bg-gradient-to-r from-slate-50/80 to-indigo-50/50 border-b border-slate-200/60">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search Input */}
              <div className="relative flex-1 min-w-0 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search products by name, category, supplier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-[180px] h-10 rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* New Product Button */}
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md"
                  onClick={() => setIsNewProductOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Product
                </Button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || selectedCategory !== "all") && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-slate-500">Active filters:</span>
                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  >
                    Search: "{searchQuery}" ×
                  </Badge>
                )}
                {selectedCategory !== "all" && (
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer"
                    onClick={() => setSelectedCategory("all")}
                  >
                    Category: {selectedCategory} ×
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-700 h-6 px-2"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product List Card */}
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 animate-pulse"></div>
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <span className="mt-4 text-slate-500 font-medium">
                Loading products...
              </span>
            </div>
          ) : products.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<Package className="w-10 h-10 text-slate-400" />}
                title="No products found"
                description={
                  categoryFilter
                    ? "Try clearing the category filter"
                    : "Start by adding your first product"
                }
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/50 hover:bg-slate-50 border-b border-slate-200">
                      <TableHead className="font-semibold text-slate-700 py-4">
                        Image
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Name
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Category
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Supplier
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Variants
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentProducts.map((product) => (
                      <TableRow
                        key={product.id}
                        className="cursor-pointer border-slate-100 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-indigo-50/30 transition-all duration-200"
                        onClick={() =>
                          navigate(`/product/detail/${product.id}`)
                        }
                      >
                        <TableCell className="py-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center overflow-hidden shadow-sm border border-slate-200/50">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-semibold text-slate-800">
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
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 font-medium">
                            {product.categoryName || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 font-medium">
                            {product.supplierName || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-600 font-medium">
                            {product.variants?.length || 0} variant(s)
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`font-medium ${
                              product.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-100 border-0"
                            }`}
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
                              className="h-9 w-9 hover:bg-amber-50 text-slate-600 hover:text-amber-600 rounded-lg transition-colors"
                              onClick={() =>
                                navigate(`/product/edit/${product.id}`)
                              }
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg transition-colors"
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
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {startIndex + 1}-{Math.min(endIndex, products.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {products.length}
                  </span>{" "}
                  products
                </p>
                <Pagination>
                  <PaginationContent className="gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        className={`rounded-lg hover:bg-slate-100 ${
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
                            className={`cursor-pointer rounded-lg ${currentPage === page ? "bg-indigo-600 text-white hover:bg-indigo-700 border-0" : "text-slate-600 hover:bg-slate-100"}`}
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
                        className={`rounded-lg hover:bg-slate-100 ${
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
