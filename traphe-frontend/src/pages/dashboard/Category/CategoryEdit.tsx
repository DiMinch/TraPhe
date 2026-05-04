import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryService } from "@/services/category.service";
import type { Category } from "@/types/category";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function CategoryEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: undefined as string | undefined,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      fetchCategory();
      fetchAllCategories();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategoryById(id!);
      if (response.data) {
        setCategory(response.data);
        setFormData({
          name: response.data.name || "",
          description: response.data.description || "",
          parentId: response.data.parentId || undefined,
        });
      }
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to load category";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response.data) {
        // Filter out current category to avoid circular reference
        setCategories(response.data.filter((cat) => cat.id !== id));
      }
    } catch (error: unknown) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name) {
      toast.error("Category name is required");
      return;
    }

    try {
      setLoading(true);
      await categoryService.updateCategory(
        id!,
        {
          name: formData.name,
          description: formData.description || undefined,
          parentId: formData.parentId || undefined,
        },
        imageFile || undefined,
      );
      toast.success("Category updated successfully");
      navigate("/category");
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to update category";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const rootCategories = categories.filter((cat) => !cat.parentId);

  if (loading && !category) {
    return (
      <div className="p-6">
        <div className="text-center py-10">Loading category...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/category")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-semibold">Edit Category</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent">Parent Category</Label>
              <Select
                value={formData.parentId || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    parentId: value === "none" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Root Category)</SelectItem>
                  {rootCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Category description..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Category Image</Label>
            {category?.imageUrl && (
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-32 h-32 object-cover rounded mb-2"
              />
            )}
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setImageFile(file);
              }}
            />
            {imageFile && (
              <p className="text-sm text-gray-500">New: {imageFile.name}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/category")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="bg-indigo-900 hover:bg-indigo-800"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Category"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
