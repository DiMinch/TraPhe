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
import { Input } from "@/components/ui/input";
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
import {
  Plus,
  Edit,
  Trash2,
  ArrowUpDown,
  Settings,
  Search,
  Loader2,
  Filter,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { categoryService } from "@/services/category.service";
import { toast } from "sonner";
import NewCategoryDialog from "./NewCategory";
import EditCategoryDialog from "./EditCategory";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import CategorySpecsDialog from "./CategorySpecsDialog";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";

interface Category {
  id: number;
  name: string;
  description: string;
  parent: string;
  productCount: number;
  status: "Active" | "Inactive";
  image?: string;
  fullId?: string; // Store full UUID
}

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSpecsDialogOpen, setIsSpecsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [apiCategories, setApiCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all-status");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAllCategories();
      if (response.data) {
        // Handle both direct array and paginated response
        const categoriesData = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.content || [];
        setApiCategories(categoriesData);
        // Convert API categories to display format and store full API data
        const displayCategories: Category[] = categoriesData.map(
          (cat: any) => ({
            id: parseInt(cat.id.slice(0, 8), 16), // Use first 8 chars of UUID as number
            fullId: cat.id, // Store full UUID
            name: cat.name,
            description: cat.description || "No description",
            parent: cat.parentName || "",
            productCount: cat.productCount ?? cat.menuItemCount ?? 0,
            status: "Active" as const,
            image: cat.imageUrl,
          }),
        );
        setCategories(displayCategories);
      }
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to load categories";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsEditCategoryOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleManageSpecs = (category: Category) => {
    setSelectedCategory(category);
    setIsSpecsDialogOpen(true);
  };

  const handleUpdateCategory = () => {
    fetchCategories();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;

    try {
      // Find the original API category to get the UUID
      const response = await categoryService.getAllCategories();
      const apiCategory = response.data?.find(
        (cat: any) => cat.name === selectedCategory.name,
      );

      if (apiCategory) {
        await categoryService.deleteCategory(apiCategory.id);
        toast.success("Category deleted successfully");
        fetchCategories();
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to delete category";
      toast.error(errorMsg);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  // Filter categories
  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.parent &&
        category.parent.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all-status" ||
      category.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <PageContainer>
      <PageHeader
        title="Categories"
        subtitle="Manage product categories and specifications"
        onRefresh={fetchCategories}
      />

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md"
            onClick={() => setIsNewCategoryOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Category
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <span className="mt-3 text-slate-500 font-medium">
                Loading categories...
              </span>
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div className="rounded-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[250px]">
                      <div className="flex items-center gap-2">Name</div>
                    </TableHead>
                    <TableHead className="w-[300px]">Description</TableHead>
                    <TableHead className="w-[150px]">
                      <div className="flex items-center gap-2">
                        Parent
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[150px]">
                      <div className="flex items-center gap-2">
                        Number of Product
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[120px] text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-10 text-gray-500"
                      >
                        {searchTerm || statusFilter !== "all-status"
                          ? "No categories match your filters"
                          : "No categories found. Click 'New Category' to add one."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                category.image || "/placeholder-category.png"
                              }
                              alt={category.name}
                              className="w-10 h-10 rounded object-cover flex-shrink-0"
                            />
                            <button
                              onClick={() =>
                                navigate(
                                  `/product?category=${encodeURIComponent(
                                    category.name,
                                  )}`,
                                )
                              }
                              className="font-medium text-indigo-900 hover:underline cursor-pointer"
                            >
                              {category.name}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {category.description}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {category.parent || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {category.productCount}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              category.status === "Active"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              category.status === "Active"
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                            }
                          >
                            {category.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-purple-50 hover:text-purple-600"
                              onClick={() => handleManageSpecs(category)}
                              title="Manage Specifications"
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(category)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(category)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredCategories.length > 0 && (
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
          )}
        </CardContent>
      </Card>

      {/* New Category Dialog */}
      <NewCategoryDialog
        open={isNewCategoryOpen}
        onOpenChange={setIsNewCategoryOpen}
        onAdd={() => fetchCategories()}
      />

      {/* Edit Category Dialog */}
      <EditCategoryDialog
        open={isEditCategoryOpen}
        onOpenChange={setIsEditCategoryOpen}
        onUpdate={handleUpdateCategory}
        category={selectedCategory}
        categoryId={
          selectedCategory
            ? apiCategories.find((c) => c.name === selectedCategory.name)?.id
            : undefined
        }
      />

      {/* Category Specs Dialog */}
      <CategorySpecsDialog
        open={isSpecsDialogOpen}
        onOpenChange={setIsSpecsDialogOpen}
        categoryId={selectedCategory?.fullId || ""}
        categoryName={selectedCategory?.name || ""}
      />

      {/* Delete Category Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        itemName={selectedCategory?.name || ""}
        contextMessage="from the category list"
      />
    </PageContainer>
  );
}
