import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
}

interface CategoryNode extends Category {
  children: CategoryNode[];
}

interface CategoryFilterProps {
  categoryTree: CategoryNode[];
  loading: boolean;
  selectedCategoryId?: string;
  expandedCategories: Record<string, boolean>;
  onCategoryClick: (catId: string) => void;
  onToggleExpand: (catId: string) => void;
}

export default function CategoryFilter({
  categoryTree,
  loading,
  selectedCategoryId,
  expandedCategories,
  onCategoryClick,
  onToggleExpand,
}: CategoryFilterProps) {
  const renderCategoryItem = (node: CategoryNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedCategories[node.id];
    const isSelected = selectedCategoryId === node.id;

    return (
      <div key={node.id} className="w-full">
        <div
          className={cn(
            "flex items-center justify-between py-2 px-2 rounded-md cursor-pointer transition-colors hover:bg-gray-100",
            isSelected
              ? "bg-black text-white hover:bg-gray-800"
              : "text-gray-700",
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onCategoryClick(node.id)}
        >
          <span
            className={cn("text-sm font-medium", isSelected && "font-bold")}
          >
            {node.name}
          </span>

          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.id);
              }}
              className={cn(
                "p-1 rounded-full hover:bg-gray-200/20",
                isSelected ? "text-white" : "text-gray-500",
              )}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {node.children.map((child) => renderCategoryItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-1">
      {categoryTree.length > 0 ? (
        categoryTree.map((node) => renderCategoryItem(node))
      ) : (
        <p className="text-sm text-gray-500 italic pl-2">Không có danh mục</p>
      )}
    </div>
  );
}
