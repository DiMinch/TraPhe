import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, History, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product.types";

interface ProductSearchProps {
  className?: string;
  placeholder?: string;
  isDrink?: boolean;
}

const POPULAR_KEYWORDS = [
  "Cà phê sữa đá",
  "Trà đào cam sả",
  "Sinh tố xoài",
  "Premium Tea",
  "Coffee Beans",
];

export default function ProductSearch({
  className,
  placeholder = "Search for products...",
  isDrink,
}: ProductSearchProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  
  // Dropdown UI states
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("traphe_search_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        setHistory([]);
      }
    }
  }, []);

  // Sync with URL query param
  useEffect(() => {
    setQuery(searchParams.get("search") || "");
  }, [searchParams]);

  // Click outside detection to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!query.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await productService.getAllProducts({
          search: query.trim(),
          size: 5,
          isDrink,
        });
        if (res.statusCode === 200 && res.data) {
          const items = Array.isArray(res.data) ? res.data : (res.data as any).content || [];
          setSuggestions(items);
        }
      } catch (error) {
        console.error("Failed to fetch search suggestions", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, isDrink]);

  const saveToHistory = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    const updated = [trimmed, ...history.filter((h) => h.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
    setHistory(updated);
    localStorage.setItem("traphe_search_history", JSON.stringify(updated));
  };

  const handleSearch = (searchTerm: string = query) => {
    const finalQuery = searchTerm.trim();
    saveToHistory(finalQuery);
    setIsFocused(false);

    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (finalQuery) {
        newParams.set("search", finalQuery);
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

  const handleDeleteHistory = (e: React.MouseEvent, indexToDelete: number) => {
    e.stopPropagation();
    const updated = history.filter((_, i) => i !== indexToDelete);
    setHistory(updated);
    localStorage.setItem("traphe_search_history", JSON.stringify(updated));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative flex items-center w-full">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          className="pr-20 h-12 border-mist focus-visible:ring-roast bg-white shadow-sm text-base rounded-full font-ui-body text-ink"
        />

        <div className="absolute right-1.5 flex items-center gap-1">
          {query && (
            <button
              onClick={handleClear}
              className="p-2 text-dust hover:text-roast hover:bg-cream/30 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <Button
            size="sm"
            onClick={() => handleSearch()}
            className="h-9 px-4 bg-roast hover:bg-caramel text-white rounded-full cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Suggestion & History Dropdown */}
      {isFocused && (
        <div className="absolute z-40 left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-mist overflow-hidden animate-in fade-in-50 slide-in-from-top-1 duration-200">
          
          {/* 1. Lịch sử & Từ khóa phổ biến (khi query trống) */}
          {!query.trim() && (
            <div className="p-4 flex flex-col gap-4">
              {/* Lịch sử tìm kiếm */}
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-dust font-ui-body mb-2 uppercase tracking-wider">
                  <History className="w-3.5 h-3.5" />
                  Lịch sử tìm kiếm
                </div>
                {history.length === 0 ? (
                  <p className="text-xs text-dust/60 italic px-2 py-1">Chưa có lịch sử tìm kiếm</p>
                ) : (
                  <div className="flex flex-col">
                    {history.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setQuery(item);
                          handleSearch(item);
                        }}
                        className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-cream/40 text-sm font-ui-body text-espresso cursor-pointer transition-colors"
                      >
                        <span className="truncate">{item}</span>
                        <button
                          onClick={(e) => handleDeleteHistory(e, index)}
                          className="p-1 hover:text-roast text-dust/60 rounded-full hover:bg-cream transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Từ khóa phổ biến */}
              <div className="border-t border-mist/30 pt-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-dust font-ui-body mb-2 uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Từ khóa phổ biến
                </div>
                <div className="flex flex-wrap gap-2 px-1">
                  {POPULAR_KEYWORDS.map((keyword, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(keyword);
                        handleSearch(keyword);
                      }}
                      className="px-3 py-1.5 bg-cream/40 hover:bg-cream text-xs font-ui-body font-medium text-roast rounded-full border border-mist/20 transition-all cursor-pointer hover:-translate-y-0.5"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Danh sách sản phẩm gợi ý (khi đang nhập) */}
          {query.trim() && (
            <div className="py-2">
              <div className="px-4 py-1.5 text-xs font-semibold text-dust font-ui-body uppercase tracking-wider border-b border-mist/20">
                Gợi ý sản phẩm
              </div>

              {isLoading && (
                <div className="flex items-center justify-center py-6 gap-2 text-sm text-dust font-ui-body">
                  <Loader2 className="w-4 h-4 animate-spin text-roast" />
                  Đang tìm kiếm...
                </div>
              )}

              {!isLoading && suggestions.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-dust/70 italic font-ui-body">
                  Không tìm thấy sản phẩm nào phù hợp
                </div>
              )}

              {!isLoading && suggestions.length > 0 && (
                <div className="flex flex-col">
                  {suggestions.map((product) => {
                    const displayPrice =
                      product.effectivePrice ||
                      product.basePrice ||
                      product.sizes?.[0]?.sellingPrice ||
                      0;

                    return (
                      <div
                        key={product.id}
                        onClick={() => {
                          setIsFocused(false);
                          navigate(`/menu/${product.id}`);
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-cream/40 cursor-pointer transition-colors border-b border-mist/10 last:border-0"
                      >
                        <div className="w-12 h-12 rounded-lg bg-cream overflow-hidden shrink-0 border border-mist/20">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-roast/40 font-ui-body font-bold text-xs">
                              TraPhe
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-ui-body font-semibold text-espresso text-sm truncate">
                            {product.name}
                          </h4>
                          <p className="text-xs text-dust truncate">
                            {product.description || product.categoryName}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-body-md text-sm text-roast font-semibold">
                            {formatPrice(displayPrice)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
