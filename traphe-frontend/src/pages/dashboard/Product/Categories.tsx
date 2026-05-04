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
import { useState } from "react";
import { useNavigate } from "react-router";
import NewCategoryDialog from "./NewCategory";
import EditCategoryDialog from "./EditCategory";
import DeleteCategoryDialog from "./DeleteCategory";

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
  const [categories, setCategories] = useState<Category[]>([
    {
      id: 1,
      name: "Laptop",
      description: "Lorem ipsum dolor sit amet consectetur adipiscing elit.",
      parent: "",
      productCount: 500,
      status: "Active",
    },
    {
      id: 2,
      name: "Laptop Gaming",
      description: "Lorem ipsum dolor sit amet consectetur adipiscing elit.",
      parent: "Laptop",
      productCount: 121,
      status: "Active",
    },
    {
      id: 3,
      name: "Laptop Student",
      description: "Lorem ipsum dolor sit amet consectetur adipiscing elit.",
      parent: "Laptop",
      productCount: 10,
      status: "Inactive",
    },
  ]);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsEditCategoryOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    setCategories(
      categories.map((cat) =>
        cat.id === updatedCategory.id ? updatedCategory : cat,
      ),
    );
  };

  const handleDeleteConfirm = () => {
    if (selectedCategory) {
      setCategories(categories.filter((cat) => cat.id !== selectedCategory.id));
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
          <div className="rounded-md border">
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
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded flex-shrink-0" />
                        <button
                          onClick={() =>
                            navigate(
                              `/product/categories/${category.name}/attributes`,
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

      {/* New Category Dialog */}
      <NewCategoryDialog
        open={isNewCategoryOpen}
        onOpenChange={setIsNewCategoryOpen}
        onAdd={(newCategory) => setCategories([...categories, newCategory])}
      />

      {/* Edit Category Dialog */}
      <EditCategoryDialog
        open={isEditCategoryOpen}
        onOpenChange={setIsEditCategoryOpen}
        onUpdate={handleUpdateCategory}
        category={selectedCategory}
      />

      {/* Delete Category Dialog */}
      <DeleteCategoryDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        categoryName={selectedCategory?.name || ""}
      />
    </div>
  );
}
