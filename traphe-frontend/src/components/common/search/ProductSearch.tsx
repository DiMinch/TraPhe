import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductSearchProps {
  className?: string;
  placeholder?: string;
}

export default function ProductSearch({
  className,
  placeholder = "Search for products...",
}: ProductSearchProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  useEffect(() => {
    setQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearch = () => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (query.trim()) {
        newParams.set("search", query.trim());
      } else {
        newParams.delete("search");
      }
      newParams.set("page", "0");
      return newParams;
    });
  };

  const handleClear = () => {
    setQuery("");
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete("search");
      newParams.set("page", "0");
      return newParams;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="pr-20 h-12 border-gray-300 focus-visible:ring-black shadow-sm text-base rounded-xl"
      />

      <div className="absolute right-1.5 flex items-center gap-1">
        {query && (
          <button
            onClick={handleClear}
            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <Button
          size="sm"
          onClick={handleSearch}
          className="h-9 px-4 bg-black hover:bg-gray-800 text-white rounded-xl"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
