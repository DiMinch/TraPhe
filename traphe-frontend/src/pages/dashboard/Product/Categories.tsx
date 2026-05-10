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
  MoreHorizontal,
  BellIcon,
  ArrowUpDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { categoryService } from "@/services/category.service";
import { toast } from "sonner";
import NewCategoryDialog from "./NewCategory";
import EditCategoryDialog from "./EditCategory";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { CURRENT_USER } from "@/constants/user";

interface Category {
  id: number;
  name: string;
  description: string;
  parent: string;
  productCount: number;
  status: "Active" | "Inactive";
  image?: string;
}

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [apiCategories, setApiCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
            name: cat.name,
            description: cat.description || "No description",
            parent: cat.parentName || "",
            productCount: 0, // TODO: Get actual product count from API
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

  const handleUpdateCategory = () => {
    fetchCategories();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;

    try {
      // Find the original API category to get the UUID
      const response = await categoryService.getAllCategories();
      const apiCategory = response.data?.find(
        (cat) => cat.name === selectedCategory.name,
      );

      if (apiCategory) {
        await categoryService.deleteCategory(apiCategory.id);
        toast.success("Category deleted successfully");
        fetchCategories();
      } else {
        toast.error("Category not found");
      }
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to delete category";
      toast.error(errorMsg);
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Categories</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome {CURRENT_USER.role} {CURRENT_USER.name}
          </span>
          <Button variant="outline" size="icon">
            <BellIcon className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            CN
          </Button>
        </div>
      </div>

      {/* New Category Button */}
      <div className="flex justify-end mb-4">
        <Button
          className="bg-indigo-900 hover:bg-indigo-800 text-white"
          onClick={() => setIsNewCategoryOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Category
        </Button>
      </div>

      {/* Main Card */}
      <Card className="shadow-md">
        <CardContent className="p-6 pt-0">
          {/* List Title */}
          <h2 className="text-lg font-semibold mb-6">List</h2>

          {/* Table */}
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
                <TableHead className="w-[120px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-gray-500"
                  >
                    Loading categories...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-gray-500"
                  >
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={category.image || "/placeholder-category.png"}
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
                          category.status === "Active" ? "default" : "secondary"
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
                          className="h-8 w-8"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(category)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

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

      {/* Delete Category Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        itemName={selectedCategory?.name || ""}
        contextMessage="from the category list"
      />
    </div>
  );
}
